import { Route, Routes } from 'react-router-dom'
import GradientBackground from './components/shared/GradientBackground'
import CreateFlow from './components/create/CreateFlow'
import InviteView from './components/invite/InviteView'

export default function App() {
  return (
    <>
      <GradientBackground />
      <Routes>
        <Route path="/" element={<CreateFlow />} />
        <Route path="/i" element={<InviteView />} />
        <Route path="*" element={<CreateFlow />} />
      </Routes>
    </>
  )
}
