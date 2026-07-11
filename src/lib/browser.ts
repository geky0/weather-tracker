/**
 * Lightweight browser capability detection.
 * One build serves everyone — CSS/JS adapts via html[data-*] hooks.
 */
export type BrowserProfile = {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'other'
  engine: 'blink' | 'gecko' | 'webkit' | 'unknown'
  supportsBackdrop: boolean
  supportsColorMix: boolean
  prefersReducedMotion: boolean
}

export function detectBrowser(win: Window = window): BrowserProfile {
  const ua = win.navigator.userAgent
  let name: BrowserProfile['name'] = 'other'
  let engine: BrowserProfile['engine'] = 'unknown'

  if (/Edg\//.test(ua)) {
    name = 'edge'
    engine = 'blink'
  } else if (/Firefox\//.test(ua)) {
    name = 'firefox'
    engine = 'gecko'
  } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua)) {
    name = 'safari'
    engine = 'webkit'
  } else if (/Chrome\//.test(ua) || /Chromium\//.test(ua)) {
    name = 'chrome'
    engine = 'blink'
  }

  const css = (win as Window & typeof globalThis).CSS
  const supportsBackdrop = !!(
    css?.supports?.('backdrop-filter', 'blur(1px)') ||
    css?.supports?.('-webkit-backdrop-filter', 'blur(1px)')
  )
  const supportsColorMix = !!css?.supports?.(
    'color',
    'color-mix(in srgb, red 50%, blue)',
  )
  const prefersReducedMotion = !!win.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches

  return {
    name,
    engine,
    supportsBackdrop,
    supportsColorMix,
    prefersReducedMotion,
  }
}

export function applyBrowserProfile(doc: Document = document, win: Window = window) {
  const profile = detectBrowser(win)
  const root = doc.documentElement
  root.dataset.browser = profile.name
  root.dataset.engine = profile.engine
  root.dataset.backdrop = profile.supportsBackdrop ? '1' : '0'
  root.dataset.colormix = profile.supportsColorMix ? '1' : '0'
  if (profile.prefersReducedMotion) {
    root.dataset.reducedMotion = '1'
  }
  return profile
}
