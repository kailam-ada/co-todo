import { Navigate, Route, Routes } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { Account } from './pages/Account'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/connexion" element={<SignIn />} />
      <Route path="/inscription" element={<SignUp />} />
      <Route
        path="/compte"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
