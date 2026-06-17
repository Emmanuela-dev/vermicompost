import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Benefits from './pages/Benefits'
import HowItWorks from './pages/HowItWorks'
import Data from './pages/Data'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import AIInsights from './pages/AIInsights'
import Lifecycle from './pages/Lifecycle'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="benefits" element={<Benefits />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="data" element={<Data />} />
        <Route path="contact" element={<Contact />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="lifecycle" element={<Lifecycle />} />
      </Route>
    </Routes>
  )
}

export default App
