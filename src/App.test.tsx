import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

// Stub asset imports
vi.mock('./assets/react.svg', () => ({ default: 'react.svg' }))
vi.mock('./assets/vite.svg', () => ({ default: 'vite.svg' }))
vi.mock('./assets/hero.png', () => ({ default: 'hero.png' }))
vi.mock('./App.css', () => ({}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

function setMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let localStorageMock: ReturnType<typeof createLocalStorageMock>

beforeEach(() => {
  // Reset document classes
  document.documentElement.classList.remove('dark', 'light')

  // Fresh localStorage mock
  localStorageMock = createLocalStorageMock()
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: localStorageMock,
  })

  // Default: no system dark-mode preference
  setMatchMedia(false)
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.classList.remove('dark', 'light')
})

// ---------------------------------------------------------------------------
// Theme initialisation
// ---------------------------------------------------------------------------

describe('theme initialisation', () => {
  it('defaults to light when localStorage is empty and matchMedia prefers light', () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('defaults to dark when matchMedia prefers dark and localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null)
    setMatchMedia(true)
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('reads "dark" from localStorage and applies dark theme', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('reads "light" from localStorage and applies light theme even when matchMedia prefers dark', () => {
    localStorageMock.getItem.mockReturnValue('light')
    setMatchMedia(true)
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('ignores invalid localStorage values and falls back to matchMedia', () => {
    localStorageMock.getItem.mockReturnValue('invalid-value')
    setMatchMedia(true)
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('ignores invalid localStorage values and falls back to light when matchMedia prefers light', () => {
    localStorageMock.getItem.mockReturnValue('system')
    setMatchMedia(false)
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('falls back to light when localStorage throws and matchMedia prefers light', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('SecurityError')
    })
    setMatchMedia(false)
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('falls back to dark when localStorage throws and matchMedia prefers dark', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('SecurityError')
    })
    setMatchMedia(true)
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('handles missing matchMedia (treats as light)', () => {
    localStorageMock.getItem.mockReturnValue(null)
    // @ts-expect-error deliberately remove matchMedia
    delete window.matchMedia
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useEffect: document class and localStorage persistence
// ---------------------------------------------------------------------------

describe('useEffect theme side-effects', () => {
  it('removes the opposite class and adds the current theme class on mount', () => {
    document.documentElement.classList.add('dark') // pre-existing stale class
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists the initial theme to localStorage via useEffect', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<App />)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('site-theme', 'dark')
  })

  it('persists light theme to localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue(null)
    setMatchMedia(false)
    render(<App />)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('site-theme', 'light')
  })

  it('does not throw when localStorage.setItem throws', async () => {
    localStorageMock.getItem.mockReturnValue('light')
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => render(<App />)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Toggle button rendering
// ---------------------------------------------------------------------------

describe('toggle button rendering', () => {
  it('renders the toggle button with accessible label', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument()
  })

  it('shows moon icon text when theme is light', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)
    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(btn.textContent).toContain('Dark')
  })

  it('shows sun icon text when theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<App />)
    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(btn.textContent).toContain('Light')
  })

  it('sets aria-pressed="false" when theme is light', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)
    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets aria-pressed="true" when theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<App />)
    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })
})

// ---------------------------------------------------------------------------
// Toggle button interaction
// ---------------------------------------------------------------------------

describe('toggle button interaction', () => {
  it('switches from light to dark when clicked', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)

    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    await act(async () => {
      await user.click(btn)
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn.textContent).toContain('Light')
  })

  it('switches from dark to light when clicked', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue('dark')
    render(<App />)

    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    await act(async () => {
      await user.click(btn)
    })

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn.textContent).toContain('Dark')
  })

  it('persists the toggled theme to localStorage', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)

    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    await act(async () => {
      await user.click(btn)
    })

    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('site-theme', 'dark')
  })

  it('toggles back to light and persists on second click', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue('dark')
    render(<App />)

    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    // click 1: dark -> light
    await act(async () => {
      await user.click(btn)
    })
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('site-theme', 'light')

    // click 2: light -> dark
    await act(async () => {
      await user.click(btn)
    })
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('site-theme', 'dark')
  })

  it('only has one theme class on documentElement after toggle', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue('light')
    render(<App />)

    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    await act(async () => {
      await user.click(btn)
    })

    const classes = Array.from(document.documentElement.classList)
    const themeClasses = classes.filter((c) => c === 'dark' || c === 'light')
    expect(themeClasses).toHaveLength(1)
    expect(themeClasses[0]).toBe('dark')
  })
})

// ---------------------------------------------------------------------------
// Inline SVG accessibility (changed in this PR)
// ---------------------------------------------------------------------------

describe('inline SVG accessibility', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('light')
  })

  it('renders Documentation SVG with role="img" and aria-label', () => {
    render(<App />)
    const svgs = document.querySelectorAll('svg[role="img"]')
    const labels = Array.from(svgs).map((s) => s.getAttribute('aria-label'))
    expect(labels).toContain('Documentation')
  })

  it('renders Community SVG with role="img" and aria-label', () => {
    render(<App />)
    const svgs = document.querySelectorAll('svg[role="img"]')
    const labels = Array.from(svgs).map((s) => s.getAttribute('aria-label'))
    expect(labels).toContain('Community')
  })

  it('renders GitHub SVG with role="img" and aria-label', () => {
    render(<App />)
    const svgs = document.querySelectorAll('svg[role="img"]')
    const labels = Array.from(svgs).map((s) => s.getAttribute('aria-label'))
    expect(labels).toContain('GitHub')
  })

  it('renders Discord SVG with role="img" and aria-label', () => {
    render(<App />)
    const svgs = document.querySelectorAll('svg[role="img"]')
    const labels = Array.from(svgs).map((s) => s.getAttribute('aria-label'))
    expect(labels).toContain('Discord')
  })
})