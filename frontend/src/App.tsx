import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import LabPage from './pages/LabPage'
import { LearnPage } from './pages/LearnPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cambric-labs/" element={<HomePage />} />
        <Route path="/cambric-labs/lab" element={<LabPage />} />
        <Route path="/cambric-labs/lab/:experimentId" element={<LabPage />} />
        <Route path="/cambric-labs/learn" element={<LearnPage />} />
        <Route path="/cambric-labs/learn/:lessonId" element={<LearnPage />} />
        <Route path="/cambric-labs/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
