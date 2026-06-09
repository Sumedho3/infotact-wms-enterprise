import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Login from './components/auth/Login' 
import Register from './components/auth/Register' // 👈 CHANGE: Import your new Register Component
import { AuthProvider, useAuth } from './components/auth/AuthContext' 
import ProtectedRoute from './components/auth/ProtectedRoute' 
import WarehouseDashboard from './components/dashboard/WarehouseDashboard' // 👈 CHANGE 1: Import your production dashboard component
import './App.css'

// Create a fast internal component to manage state visibility cleanly
function MainWorkspaceContent() {
  const { user } = useAuth(); // Grab the live login details from our global service desk

  // 🎯 CHANGE: State hook to track whether the anonymous user is on the Login or Register card view
  const [isRegisterView, setIsRegisterView] = useState(false);

  // 👈 CHANGE 2: Early return statement for layout rendering.
  // The moment 'user' is initialized by a valid JWT claim, we completely hand over 
  // the viewport to the Warehouse Dashboard under the guard rails of ProtectedRoute.
  if (user) {
    return (
      <ProtectedRoute>
        <WarehouseDashboard />
      </ProtectedRoute>
    );
  }

  // Otherwise, render the standard public landing page frame with the Login/Register toggle card engine
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        
        <div style={{ margin: '20px 0', width: '100%', maxWidth: '360px', display: 'flex', justifyContent: 'center' }}>
          {/* 🎯 CHANGE: Conditional layout block to render the correct view with clean callback assignments */}
          {isRegisterView ? (
            <Register switchToLogin={() => setIsRegisterView(false)} />
          ) : (
            <Login switchToRegister={() => setIsRegisterView(true)} />
          )}
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

// Outermost App layout wraps everything inside the global Context Provider
function App() {
  return (
    <AuthProvider> 
      <MainWorkspaceContent />
    </AuthProvider> 
  )
}

export default App;