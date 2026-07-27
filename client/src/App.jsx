import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { PassportProvider } from './context/PassportContext.jsx'
import Navbar from './components/Navbar.jsx'
import XPToast from './components/XPToast.jsx'

import Landing from './pages/Landing.jsx'
import Museum from './pages/Museum/index.jsx'
import Gallery from './pages/Gallery/index.jsx'
import Games from './pages/Games/index.jsx'
import Planner from './pages/Planner/index.jsx'
import PassportDashboard from './pages/PassportDashboard.jsx'
import SignInPage from './pages/Auth/SignInPage.jsx'
import SignUpPage from './pages/Auth/SignUpPage.jsx'
import AccountPage from './pages/Account.jsx'
import PassportSetup from './pages/PassportSetup.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import RequirePassportIdentity from './components/auth/RequirePassportIdentity.jsx'
import StateDetail from './pages/StateDetail/index.jsx'

const AUTH_PATHS = ['/sign-in', '/sign-up']

function AppRoutes() {
  const location = useLocation()
  const isAuthRoute = AUTH_PATHS.some(path => location.pathname.startsWith(path))

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/state/:stateId" element={<StateDetail />} />
          <Route path="/museum" element={<Museum />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/games" element={<Games />} />
          <Route path="/planner" element={<Planner />} />
          <Route
            path="/passport"
            element={(
              <RequireAuth>
                <RequirePassportIdentity>
                  <PassportDashboard />
                </RequirePassportIdentity>
              </RequireAuth>
            )}
          />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route
            path="/account"
            element={(
              <RequireAuth>
                <RequirePassportIdentity>
                  <AccountPage />
                </RequirePassportIdentity>
              </RequireAuth>
            )}
          />
          <Route
            path="/passport-setup"
            element={(
              <RequireAuth>
                <PassportSetup />
              </RequireAuth>
            )}
          />
        </Routes>
      </main>
      {!isAuthRoute && <XPToast />}
    </>
  )
}

export default function App() {
  return (
    <PassportProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </PassportProvider>
  )
}
