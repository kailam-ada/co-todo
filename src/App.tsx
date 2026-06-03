import { Navigate, Route, Routes } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Account } from './pages/Account'
import { Dashboard } from './pages/Dashboard'
import { Reserve } from './pages/Reserve'
import { CreateTask } from './pages/CreateTask'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { LegalNotice } from './pages/LegalNotice'
import { Terms } from './pages/Terms'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/connexion" element={<SignIn />} />
      <Route path="/inscription" element={<SignUp />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
      <Route path="/confidentialite" element={<PrivacyPolicy />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/cgu" element={<Terms />} />
      <Route
        path="/tableau-de-bord"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reserve"
        element={
          <ProtectedRoute>
            <Reserve />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creation"
        element={
          <ProtectedRoute>
            <CreateTask />
          </ProtectedRoute>
        }
      />
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
