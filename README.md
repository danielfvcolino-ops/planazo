# Planazo 💌

Invita a alguien a un plan de la forma más bonita y divertida posible: rellenas un
mini-formulario, se genera un enlace único, y la otra persona lo abre y ve una
invitación animada con una pregunta a la que solo puede responder que sí (el
botón "No" no se deja pulsar).

100% frontend. Sin backend, sin base de datos: todos los datos de la invitación
van codificados y comprimidos directamente en la URL del enlace generado, así
que se puede desplegar como sitio estático en Vercel, Netlify o GitHub Pages
sin ninguna infraestructura adicional.

## Stack

React + TypeScript · Tailwind CSS v4 · Framer Motion · canvas-confetti ·
lz-string · date-fns · React Router · Vite.

## Cómo funciona

- `/` — flujo de creación en 3 pasos (nombres y plan → fecha y hora → enlace
  y vista previa).
- `/i?d=<datos>` — lo que ve la persona invitada: sobre animado → propuesta →
  decisión (con el botón "No" esquivo) → pantalla final con cuenta atrás y
  botones de calendario.

Los datos se serializan como `{ n, p, pl, f, a }` (nombre de quien invita,
nombre del invitado, plan, fecha en epoch ms, y un flag opcional `a=1` si ya
se aceptó), se comprimen con `lz-string` y se meten en el parámetro `d` de la
URL. La pantalla del invitado simplemente decodifica ese parámetro; si falta o
está corrupto, se muestra un estado de error amigable en vez de romperse.

Al pulsar "SÍ", la app reescribe la URL del navegador (vía
`history.replaceState`, sin recargar ni tocar ningún backend) para incluir
`a=1`. Así, si esa misma persona vuelve a abrir su enlace después de la fecha
del plan, ve un mensaje de celebración en pasado en vez del mensaje genérico
de "esto ya pasó".

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview   # sirve dist/ en local para probarlo
```

## Desplegar

Es un sitio estático: sube el contenido de `dist/` a Vercel, Netlify o GitHub
Pages tal cual. Si lo despliegas en una GitHub Pages de **proyecto** (no de
usuario/organización, es decir la URL incluye `/nombre-repo/`), añade la base
correspondiente en `vite.config.ts`:

```ts
export default defineConfig({
  base: '/nombre-repo/',
  plugins: [react(), tailwindcss()],
})
```

El resto de la app (enlaces generados, rutas) ya usa `import.meta.env.BASE_URL`
internamente, así que no hace falta tocar nada más.

## Verificación end-to-end

Hay un script de Playwright (`e2e-check.cjs`) que recorre el flujo completo
contra un build de producción: crea una invitación, la abre en un contexto
nuevo simulando ser la otra persona, comprueba que el botón "No" esquiva de
verdad (incluyendo que nunca tape el "SÍ" ni el texto, y que nunca salga del
viewport), acepta, verifica el countdown y los botones de calendario, y prueba
los casos límite (enlace corrupto, plan ya pasado con y sin aceptar,
`prefers-reduced-motion`, overflow horizontal en móvil).

```bash
npm i -D playwright
npx playwright install chromium
npm run build
npm run preview -- --port 4173 &
npm run test:e2e
```

Las capturas de cada paso del flujo se guardan en `e2e-shots/` (no se suben al
repo).
