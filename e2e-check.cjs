// Script de verificación end-to-end de Planazo.
// Requiere: npm i -D playwright && npx playwright install chromium
// Uso: npm run build && npm run preview -- --port 4173 &  (en otra terminal)
//      npm run test:e2e
const { chromium } = require('playwright');
const { compressToEncodedURIComponent } = require('lz-string');
const fs = require('node:fs');

const BASE = process.env.PLANAZO_E2E_BASE_URL || 'http://localhost:4173';
const SHOT_DIR = '/home/claude/planazo/e2e-shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

function encode(data) {
  return compressToEncodedURIComponent(JSON.stringify(data));
}

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
  console.log('  ok - ' + msg);
}

async function main() {
  const browser = await chromium.launch();
  const results = [];

  // ---------- 1) FLUJO COMPLETO DE CREACIÓN (mobile viewport) ----------
  console.log('\n[1] Flujo de creación completo (mobile 390x844)');
  const ctx1 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx1.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx1.newPage();
  await page.goto(BASE + '/');

  await page.screenshot({ path: `${SHOT_DIR}/01-create-step1-empty.png` });

  const nextBtn = page.getByRole('button', { name: 'Siguiente ➔' });
  assert(await nextBtn.isDisabled(), 'botón Siguiente deshabilitado con campos vacíos');

  await page.getByLabel('¿Cómo te llamas?').fill('Dani');
  await page.getByLabel('¿A quién quieres invitar?').fill('Alex');
  await page.getByRole('button', { name: 'Cine y palomitas' }).click();

  const planField = page.getByLabel('¿Cuál es el plan?');
  assert((await planField.inputValue()) === '🎬 Cine y palomitas', 'la chip rellena el campo de plan');

  assert(await nextBtn.isEnabled(), 'botón Siguiente habilitado con los 3 campos rellenos');
  await page.screenshot({ path: `${SHOT_DIR}/02-create-step1-filled.png` });
  await nextBtn.click();

  await page.waitForTimeout(450);
  await page.screenshot({ path: `${SHOT_DIR}/03-create-step2-calendar.png` });

  const genBtn = page.getByRole('button', { name: 'Generar Invitación Mágica ✨' });
  assert(await genBtn.isDisabled(), 'botón Generar deshabilitado sin fecha');

  const prevMonthBtn = page.getByRole('button', { name: 'Mes anterior' });
  assert(await prevMonthBtn.isDisabled(), 'no se puede navegar a meses anteriores al actual');

  await page.getByRole('button', { name: 'Mes siguiente' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '15', exact: true }).first().click();
  await page.locator('input[type="time"]').fill('20:00');

  assert(await genBtn.isEnabled(), 'botón Generar habilitado con fecha y hora');
  await page.screenshot({ path: `${SHOT_DIR}/04-create-step2-filled.png` });
  await genBtn.click();
  await page.waitForTimeout(450);

  const linkInput = page.locator('input[readonly]');
  const url = await linkInput.inputValue();
  console.log('  enlace generado:', url);
  assert(url.includes('/i?d='), 'el enlace generado contiene la ruta /i?d=');
  await page.screenshot({ path: `${SHOT_DIR}/05-create-step3-share.png` });

  const copyBtn = page.getByRole('button', { name: /Copiar Enlace/ });
  await copyBtn.click();
  await page.waitForTimeout(400);
  const bodyHasCopiado = await page.evaluate(() => document.body.textContent?.includes('¡Copiado! ✅'));
  assert(bodyHasCopiado, 'el botón copiar muestra confirmación visual ("¡Copiado! ✅")');

  const clipboardValue = await page.evaluate(() => navigator.clipboard.readText());
  assert(clipboardValue === url, 'el portapapeles contiene el enlace correcto');

  const whatsappHrefBefore = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find((b) => b.textContent?.includes('WhatsApp')) ? 'found' : 'missing';
  });
  assert(whatsappHrefBefore === 'found', 'botón de compartir por WhatsApp presente');

  await ctx1.close();
  results.push('Flujo de creación (1->2->3): OK');

  // ---------- 2) ABRIR EL ENLACE COMO INVITADO (contexto nuevo = incógnito) ----------
  console.log('\n[2] Abrir enlace generado como invitado, en contexto nuevo (incógnito)');
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const guestPage = await ctx2.newPage();
  await guestPage.goto(url);
  await guestPage.waitForTimeout(300);
  await guestPage.screenshot({ path: `${SHOT_DIR}/06-invite-sobre.png` });

  const envelopeText = await guestPage.textContent('body');
  assert(envelopeText.includes('Dani'), 'la pantalla del sobre muestra el nombre de quien invita (Dani)');

  await guestPage.getByRole('button', { name: 'Abrir invitación' }).click();
  await guestPage.waitForSelector('text=te propone un planazo', { timeout: 5000 });
  await guestPage.screenshot({ path: `${SHOT_DIR}/07-invite-propuesta.png` });

  const proposalText = await guestPage.textContent('body');
  assert(proposalText.includes('Cine y palomitas'), 'la propuesta muestra el plan correcto');
  assert(/agosto/i.test(proposalText), 'la fecha se formatea en lenguaje natural (mes en texto, no ISO)');
  assert(!proposalText.includes('T20:00'), 'la fecha NO se muestra en formato ISO');

  await guestPage.getByRole('button', { name: '¿Qué le dices? 👀' }).click();
  await guestPage.waitForSelector('role=button[name="No"]', { timeout: 5000 });
  await guestPage.waitForTimeout(150);
  await guestPage.screenshot({ path: `${SHOT_DIR}/08-invite-decision.png` });

  // ---------- 3) VERIFICAR QUE EL BOTÓN "NO" ES ESQUIVO ----------
  console.log('\n[3] Verificar comportamiento esquivo del botón "NO"');
  const noBtn = guestPage.getByRole('button', { name: 'No' });
  const box1 = await noBtn.boundingBox();
  assert(box1 !== null, 'el botón NO es visible y medible');

  const targetX = box1.x + box1.width / 2;
  const targetY = box1.y + box1.height / 2;
  await guestPage.mouse.move(targetX - 300, targetY - 300);
  await guestPage.mouse.move(targetX, targetY, { steps: 25 });
  await guestPage.waitForTimeout(400);

  const box2 = await noBtn.boundingBox();
  const allNoButtons = await guestPage.evaluate(
    () => Array.from(document.querySelectorAll('button')).filter((b) => b.textContent === 'No').length,
  );
  assert(allNoButtons === 1, 'solo existe un botón "No" en el DOM (sin duplicados por el portal)');
  const moved = Math.hypot(box2.x - box1.x, box2.y - box1.y);
  console.log(`  posición inicial: (${box1.x.toFixed(0)}, ${box1.y.toFixed(0)}) -> tras aproximar cursor: (${box2.x.toFixed(0)}, ${box2.y.toFixed(0)}), desplazamiento=${moved.toFixed(0)}px`);
  assert(moved > 50, 'el botón NO se ha desplazado significativamente al acercar el cursor');

  const stillInsideViewport =
    box2.x >= 0 && box2.y >= 0 && box2.x + box2.width <= 390 && box2.y + box2.height <= 844;
  assert(stillInsideViewport, 'el botón NO sigue dentro del viewport tras esquivar');

  function boxesOverlap(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
  }

  const yesBox = await guestPage.getByRole('button', { name: 'SÍ 🎉' }).boundingBox();
  assert(!boxesOverlap(box2, yesBox), 'el botón NO no tapa al botón SÍ tras esquivar');

  const headingBox = await guestPage.getByText('¿te apuntas?').boundingBox();
  assert(!boxesOverlap(box2, headingBox), 'el botón NO no tapa el texto de la pregunta tras esquivar');

  // Segundo acercamiento: confirma que vuelve a esquivar (no se queda "atrapado")
  const box3ref = await noBtn.boundingBox();
  await guestPage.mouse.move(box3ref.x + box3ref.width / 2, box3ref.y + box3ref.height / 2, { steps: 15 });
  await guestPage.waitForTimeout(400);
  const box4 = await noBtn.boundingBox();
  const moved2 = Math.hypot(box4.x - box3ref.x, box4.y - box3ref.y);
  assert(moved2 > 50, 'el botón NO vuelve a esquivar en un segundo intento (no queda atrapado)');
  await guestPage.screenshot({ path: `${SHOT_DIR}/09-invite-decision-dodged.png` });

  // Simulación táctil: touchstart directamente sobre el botón debe reposicionarlo
  const box5ref = await noBtn.boundingBox();
  await noBtn.tap({ force: true }).catch(() => {});
  await guestPage.waitForTimeout(400);
  const box6 = await noBtn.boundingBox();
  const movedTouch = Math.hypot(box6.x - box5ref.x, box6.y - box5ref.y);
  console.log(`  tras tap táctil directo: desplazamiento=${movedTouch.toFixed(0)}px`);
  assert(movedTouch > 30, 'el botón NO también reacciona a un tap táctil directo');

  results.push('Botón NO esquivo: OK');

  // ---------- 4) ACEPTAR (SÍ) Y VERIFICAR PANTALLA FINAL ----------
  console.log('\n[4] Pulsar SÍ y verificar pantalla final');
  await guestPage.getByRole('button', { name: 'SÍ 🎉' }).click();
  await guestPage.waitForTimeout(600);
  await guestPage.screenshot({ path: `${SHOT_DIR}/10-invite-final.png` });

  const finalText = await guestPage.textContent('body');
  assert(finalText.includes('¡Cita confirmada!'), 'se muestra el mensaje de cita confirmada');

  const countdownUnits = await guestPage.locator('text=días').count();
  assert(countdownUnits > 0, 'el contador muestra la unidad "días"');

  const gcalHref = await guestPage.getAttribute('a:has-text("Google Calendar")', 'href');
  assert(gcalHref && gcalHref.includes('calendar.google.com/calendar/render'), 'el enlace de Google Calendar apunta al endpoint correcto');
  assert(gcalHref.includes('Cine') , 'el enlace de Google Calendar incluye el título del plan');
  console.log('  Google Calendar href:', gcalHref);

  const [download] = await Promise.all([
    guestPage.waitForEvent('download'),
    guestPage.getByRole('button', { name: /Descargar .ics/ }).click(),
  ]);
  const icsPath = await download.path();
  const icsContent = fs.readFileSync(icsPath, 'utf-8');
  assert(icsContent.includes('BEGIN:VCALENDAR') && icsContent.includes('DTSTART'), 'el .ics descargado tiene contenido válido');
  console.log('  .ics descargado y verificado, tamaño:', icsContent.length, 'bytes');

  results.push('Pantalla final (countdown + calendario): OK');

  // Comprobar que la URL del navegador ahora incluye a=1 (persistencia best-effort)
  const finalUrl = guestPage.url();
  assert(finalUrl.includes('/i?d='), 'la URL tras aceptar sigue teniendo el formato /i?d=');
  const acceptedRaw = new URL(finalUrl).searchParams.get('d');

  await ctx2.close();

  // ---------- 5) RECARGAR EL ENLACE "ACEPTADO" (sin backend, vía URL con a=1) ----------
  console.log('\n[5] Reabrir el enlace ya aceptado (misma URL con a=1) -> debe ir directo a la pantalla final');
  const ctx2b = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const reopenPage = await ctx2b.newPage();
  await reopenPage.goto(`${BASE}/i?d=${acceptedRaw}`);
  await reopenPage.waitForTimeout(500);
  const reopenText = await reopenPage.textContent('body');
  assert(reopenText.includes('¡Cita confirmada!'), 'reabrir un enlace con a=1 lleva directo a la pantalla final');
  await ctx2b.close();
  results.push('Persistencia de aceptación (a=1) al reabrir: OK');

  // ---------- 6) ENLACE CORRUPTO / SIN DATOS ----------
  console.log('\n[6] Enlace corrupto o sin datos');
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errPage = await ctx3.newPage();

  await errPage.goto(BASE + '/i?d=esto-no-es-un-payload-valido');
  await errPage.waitForTimeout(300);
  let errText = await errPage.textContent('body');
  assert(errText.includes('Este enlace no funciona'), 'payload corrupto muestra el estado de error amigable');
  await errPage.screenshot({ path: `${SHOT_DIR}/11-invite-error-corrupt.png` });

  await errPage.goto(BASE + '/i');
  await errPage.waitForTimeout(300);
  errText = await errPage.textContent('body');
  assert(errText.includes('Este enlace no funciona'), 'ausencia total de datos muestra el estado de error amigable');

  await ctx3.close();
  results.push('Enlace corrupto/ausente -> estado de error: OK');

  // ---------- 7) PLAN YA PASADO (sin aceptar / aceptado) ----------
  console.log('\n[7] Plan con fecha ya pasada');
  const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pastPage = await ctx4.newPage();

  const pastMs = Date.now() - 1000 * 60 * 60 * 24 * 3; // hace 3 días
  const missedPayload = encode({ n: 'Dani', p: 'Alex', pl: '🍕 Cena italiana', f: pastMs });
  await pastPage.goto(`${BASE}/i?d=${missedPayload}`);
  await pastPage.waitForTimeout(300);
  let pastText = await pastPage.textContent('body');
  assert(pastText.includes('ya pasó') && !pastText.includes('fue un sí'), 'plan pasado sin aceptar muestra mensaje neutro, no negativo');
  assert(!/-\d+/.test(pastText), 'no se muestra ninguna cuenta atrás negativa');
  await pastPage.screenshot({ path: `${SHOT_DIR}/12-invite-past-missed.png` });

  const celebratedPayload = encode({ n: 'Dani', p: 'Alex', pl: '🍕 Cena italiana', f: pastMs, a: 1 });
  await pastPage.goto(`${BASE}/i?d=${celebratedPayload}`);
  await pastPage.waitForTimeout(300);
  pastText = await pastPage.textContent('body');
  assert(pastText.includes('fue un sí'), 'plan pasado ya aceptado se celebra en pasado');
  await pastPage.screenshot({ path: `${SHOT_DIR}/13-invite-past-celebrated.png` });

  await ctx4.close();
  results.push('Plan con fecha pasada (missed / celebrated): OK');

  // ---------- 8) SIN OVERFLOW HORIZONTAL EN MÓVIL ----------
  console.log('\n[8] Comprobación de overflow horizontal en viewport móvil pequeño (360px)');
  const ctx5 = await browser.newContext({ viewport: { width: 360, height: 780 } });
  const smallPage = await ctx5.newPage();
  await smallPage.goto(BASE + '/');
  await smallPage.waitForTimeout(200);
  const overflow1 = await smallPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow1 <= 1, `sin overflow horizontal en / (diff=${overflow1}px)`);

  await smallPage.goto(`${BASE}/i?d=${missedPayload}`);
  await smallPage.waitForTimeout(200);
  const overflow2 = await smallPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow2 <= 1, `sin overflow horizontal en /i (diff=${overflow2}px)`);
  await ctx5.close();
  results.push('Sin overflow horizontal en móvil 360px: OK');

  // ---------- 9) ESCRITORIO ----------
  console.log('\n[9] Comprobación visual en escritorio (1440x900)');
  const ctx6 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await ctx6.newPage();
  await desktopPage.goto(BASE + '/');
  await desktopPage.waitForTimeout(200);
  await desktopPage.screenshot({ path: `${SHOT_DIR}/14-desktop-create.png` });
  await desktopPage.goto(`${BASE}/i?d=${celebratedPayload}`);
  await desktopPage.waitForTimeout(200);
  await desktopPage.screenshot({ path: `${SHOT_DIR}/15-desktop-invite-past.png` });
  await ctx6.close();
  results.push('Capturas de escritorio: OK');

  // ---------- 10) prefers-reduced-motion ----------
  console.log('\n[10] prefers-reduced-motion sigue permitiendo esquivar el botón NO');
  const ctx7 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rmPage = await ctx7.newPage();
  const upcomingMs = Date.now() + 1000 * 60 * 60 * 24 * 10;
  const rmPayload = encode({ n: 'Dani', p: 'Alex', pl: '☕ Café y postre', f: upcomingMs });
  await rmPage.goto(`${BASE}/i?d=${rmPayload}`);
  await rmPage.waitForTimeout(200);
  await rmPage.getByRole('button', { name: 'Abrir invitación' }).click();
  await rmPage.waitForSelector('text=te propone un planazo', { timeout: 5000 });
  await rmPage.getByRole('button', { name: '¿Qué le dices? 👀' }).click();
  await rmPage.waitForSelector('role=button[name="No"]', { timeout: 5000 });
  await rmPage.waitForTimeout(150);
  const rmNoBtn = rmPage.getByRole('button', { name: 'No' });
  const rmBox1 = await rmNoBtn.boundingBox();
  await rmPage.mouse.move(rmBox1.x + rmBox1.width / 2, rmBox1.y + rmBox1.height / 2, { steps: 10 });
  await rmPage.waitForTimeout(300);
  const rmBox2 = await rmNoBtn.boundingBox();
  const rmMoved = Math.hypot(rmBox2.x - rmBox1.x, rmBox2.y - rmBox1.y);
  assert(rmMoved > 40, 'con prefers-reduced-motion el botón NO sigue esquivando (lógica no desactivada)');
  await ctx7.close();
  results.push('prefers-reduced-motion + botón NO: OK');

  await browser.close();

  console.log('\n========== RESUMEN ==========');
  results.forEach((r) => console.log('✔ ' + r));
  console.log('\nTODAS LAS COMPROBACIONES PASARON ✅');
}

main().catch((err) => {
  console.error('\n❌ FALLO EN LA VERIFICACIÓN:', err.message);
  process.exit(1);
});
