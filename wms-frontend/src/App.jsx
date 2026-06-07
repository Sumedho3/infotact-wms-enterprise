import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Login from './components/auth/Login' 
import { AuthProvider, useAuth } from './components/auth/AuthContext' 
import ProtectedRoute from './components/auth/ProtectedRoute' // 👈 1. Import your brand new Day 5 Gateguard
import './App.css'

// 2. Create a fast internal component to manage state visibility cleanly
function MainWorkspaceContent() {
  const { user, logoutService } = useAuth(); // Grab the live login log details from our global service desk

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        
        <div style={{ margin: '20px 0', width: '100%', maxWidth: '360px' }}>
          {/* 3. Conditional Rendering: If a user is NOT logged in, show the Login card */}
          {!user ? (
            <Login />
          ) : (
            /* 4. Gateguard Verification: If they are logged in, swap the card out for a secure view! */
            <ProtectedRoute>
              <div style={styles.secureCard}>
                <h2 style={styles.secureTitle}>WMS Active Dashboard</h2>
                <p style={styles.secureText}>Welcome back, <strong style={{color: '#007bff'}}>{user.username}</strong>!</p>
                <p style={styles.secureText}>Clearance Clearance Level: <span style={styles.badge}>{user.role}</span></p>
                
                <button onClick={logoutService} style={styles.logoutBtn}>
                  Secure Sign Out
                </button>
              </div>
            </ProtectedRoute>
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

// 5. Outermost App layout wraps everything inside the global Context Provider
function App() {
  return (
    <AuthProvider> 
      <MainWorkspaceContent />
    </AuthProvider> 
  )
}

// Enterprise embedded styles for your newly unlocked secure panel view
const styles = {
  secureCard: { background: '#ffffff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '100%', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'Arial, sans-serif' },
  secureTitle: { color: '#333', marginBottom: '16px', fontSize: '22px' },
  secureText: { color: '#555', margin: '8px 0', fontSize: '15px' },
  badge: { background: '#e1f5fe', color: '#0288d1', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' },
  logoutBtn: { width: '100%', marginTop: '20px', padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }
};

export default App;