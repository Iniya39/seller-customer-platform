import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

/**
 * Light theme: dark status bar icons (time, battery, signal) for light backgrounds
 * Dark theme: light status bar icons for dark backgrounds
 */
const LIGHT_THEME = {
  style: Style.Light,
  themeColor: '#ffffff',
  appleStatusBarStyle: 'default'
}

const DARK_THEME = {
  style: Style.Dark,
  themeColor: '#0f172a',
  appleStatusBarStyle: 'black-translucent'
}

// Routes with dark headers/backgrounds use dark theme; all others use light
const DARK_ROUTES = []

function getThemeForPath(pathname) {
  const isDark = DARK_ROUTES.some(route => pathname.startsWith(route))
  return isDark ? DARK_THEME : LIGHT_THEME
}

export default function StatusBarTheme() {
  const location = useLocation()

  useEffect(() => {
    const theme = getThemeForPath(location.pathname)

    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: theme.style }).catch(() => {})
    }

    const themeColorMeta = document.getElementById('theme-color')
    const appleMeta = document.getElementById('apple-status-bar-style')
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme.themeColor)
    if (appleMeta) appleMeta.setAttribute('content', theme.appleStatusBarStyle)
  }, [location.pathname])

  return null
}
