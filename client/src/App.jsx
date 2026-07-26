import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PassportProvider } from './context/PassportContext.jsx'
import Navbar from './components/Navbar.jsx'
import XPToast from './components/XPToast.jsx'

import Landing from './pages/Landing.jsx'
import Museum from './pages/Museum/index.jsx'
import Gallery from './pages/Gallery/index.jsx'
import Games from './pages/Games/index.jsx'
import Planner from './pages/Planner/index.jsx'
import PassportDashboard from './pages/PassportDashboard.jsx'

export default function App() {
  return (
    <PassportProvider>
      <BrowserRouter>
        <Navbar />
        <main id="main-content">
          <Routes>
            <Route path="/"         element={<Landing />} />
            <Route path="/museum"   element={<Museum />} />
            <Route path="/gallery"  element={<Gallery />} />
            <Route path="/games"    element={<Games />} />
            <Route path="/planner"  element={<Planner />} />
            <Route path="/passport" element={<PassportDashboard />} />
          </Routes>
        </main>
        {/* Global XP/badge toast notifications */}
        <XPToast />
      </BrowserRouter>
    </PassportProvider>
  )
}
