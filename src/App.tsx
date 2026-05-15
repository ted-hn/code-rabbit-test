import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

/**
 * Root application component that renders the demo UI and manages theme and counter state.
 *
 * Provides a light/dark theme toggle (persisted to localStorage and applied to the document root), a click counter, branding, documentation links, and social links.
 *
 * @returns The application's root React element.
 */
function App() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('site-theme')
      if (stored === 'dark' || stored === 'light') return stored
    } catch (e) {
      // ignore
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    // ensure we explicitly set either 'dark' or 'light' class so the toggle
    // can override the prefers-color-scheme media query
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    try {
      localStorage.setItem('site-theme', theme)
    } catch (e) {
      // ignore
    }
  }, [theme])

  return (
    <>
      <section id="center">
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-h)',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="img" aria-label="Documentation" viewBox="0 0 24 24" fill="none">
            <path d="M6 2h7l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="currentColor" />
            <path d="M13 2v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
          <svg className="icon" role="img" aria-label="Community" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="2.2" fill="currentColor" />
            <circle cx="16" cy="8" r="2.2" fill="currentColor" />
            <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="img" aria-label="GitHub" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.72 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.5 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.45-2.71 5.42-5.29 5.71.42.36.8 1.07.8 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.67.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="img" aria-label="Discord" viewBox="0 0 24 24" fill="none">
                  <path d="M7 8s1.5-1 3-1 3 1 3 1v3s-1.5 1-3 1-3-1-3-1V8z" fill="currentColor" />
                  <path d="M4 4c2-1 14-1 16 0v8c-2 1-14 1-16 0V4z" stroke="currentColor" strokeWidth="0.8" fill="none" />
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="img" aria-label="X.com" viewBox="0 0 24 24" fill="none">
                  <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="img" aria-label="Bluesky" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 12c3-4 8-7 14-7-2 5-5 8-10 11 4 0 7-1 10-3-3 4-7 6-14 6v-7z" />
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
  )
}

export default App
