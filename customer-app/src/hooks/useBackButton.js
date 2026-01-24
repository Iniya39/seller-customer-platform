import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'

// Global UI stack to track open UI components
let uiStack = []
let backButtonHandler = null
// Flag for native code to check synchronously
let hasOpenUIFlag = false

/**
 * Check if there are any open UI components
 * @returns {boolean} True if there are open UIs
 */
export function hasOpenUI() {
  return uiStack.length > 0
}

/**
 * Get the most recent UI component
 * @returns {Object|null} The most recent UI component or null
 */
export function getMostRecentUI() {
  return uiStack.length > 0 ? uiStack[uiStack.length - 1] : null
}

/**
 * Register a UI component to the stack
 * @param {string} id - Unique identifier for the UI component
 * @param {Function} onClose - Function to call when back button is pressed
 * @returns {Function} Unregister function
 */
/**
 * Update the native flag for open UIs
 */
function updateNativeFlag() {
  hasOpenUIFlag = uiStack.length > 0
  // Update native interface if available
  if (typeof window !== 'undefined' && window.BackButtonInterface) {
    try {
      window.BackButtonInterface.setHasOpenUI(hasOpenUIFlag)
    } catch (e) {
      // Interface might not be available yet
    }
  }
}

export function registerUI(id, onClose) {
  // Remove if already exists
  uiStack = uiStack.filter(item => item.id !== id)
  
  // Add to stack
  uiStack.push({ id, onClose, timestamp: Date.now() })
  updateNativeFlag()
  
  console.log('[BackButton] Registered UI:', id, 'Stack size:', uiStack.length)
  
  // Return unregister function
  return () => {
    uiStack = uiStack.filter(item => item.id !== id)
    updateNativeFlag()
    console.log('[BackButton] Unregistered UI:', id, 'Stack size:', uiStack.length)
  }
}

/**
 * Handle back button press
 */
function handleBackButton() {
  if (uiStack.length > 0) {
    // Get the most recently opened UI (last in stack)
    const mostRecent = uiStack[uiStack.length - 1]
    console.log('[BackButton] Closing UI:', mostRecent.id)
    
    // Call its close handler
    if (mostRecent.onClose) {
      mostRecent.onClose()
    }
    
    // Remove from stack
    uiStack = uiStack.filter(item => item.id !== mostRecent.id)
    updateNativeFlag()
    
    // Prevent default back behavior
    return true
  }
  
  // No UI to close, allow default behavior
  updateNativeFlag()
  return false
}

/**
 * Handle back button press (called from native or browser)
 * Exported for use in header back buttons
 */
export function dispatchBackButton() {
  const handled = handleBackButton()
  if (handled) {
    // UI was closed, prevent further back button handling
    return true
  }
  return false
}

// Expose to window for native bridge calls
if (typeof window !== 'undefined') {
  window.dispatchBackButton = dispatchBackButton
  window.hasOpenUI = () => hasOpenUIFlag
}

/**
 * Initialize back button listener
 */
export function initBackButtonListener() {
  if (backButtonHandler) {
    return // Already initialized
  }
  
  // Initialize native flag
  updateNativeFlag()
  
  // Check if running on native platform
  App.addListener('backButton', ({ canGoBack }) => {
    const handled = dispatchBackButton()
    if (handled) {
      // UI was closed, prevent default back behavior
      return
    }
    
    // No UI to close - handle navigation
    // Note: MainActivity handles the actual navigation via WebView.goBack()
    // This listener is mainly for Capacitor's App plugin integration
    if (uiStack.length === 0) {
      if (!canGoBack) {
        // Can't go back in navigation and no UIs open, exit app
        App.exitApp()
      }
      // If canGoBack is true, MainActivity will handle navigation
    }
  }).then(listener => {
    backButtonHandler = listener
    console.log('[BackButton] Listener initialized')
  }).catch(err => {
    console.warn('[BackButton] Failed to initialize listener (may be running in browser):', err)
  })
  
  // Also handle browser back button
  if (typeof window !== 'undefined' && window.history) {
    window.addEventListener('popstate', (event) => {
      const handled = dispatchBackButton()
      if (handled) {
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href)
      }
    })
  }
}

/**
 * Hook to register/unregister a UI component with the back button handler
 * @param {string} id - Unique identifier for the UI component
 * @param {boolean} isOpen - Whether the UI is currently open
 * @param {Function} onClose - Function to call when back button is pressed
 */
export function useBackButton(id, isOpen, onClose) {
  const unregisterRef = useRef(null)
  
  useEffect(() => {
    // Note: initBackButtonListener() is called at app startup in main.jsx
    // No need to initialize here
    
    if (isOpen && onClose) {
      // Register UI component
      unregisterRef.current = registerUI(id, onClose)
    } else if (unregisterRef.current) {
      // Unregister when closed
      unregisterRef.current()
      unregisterRef.current = null
    }
    
    // Cleanup on unmount
    return () => {
      if (unregisterRef.current) {
        unregisterRef.current()
        unregisterRef.current = null
      }
    }
  }, [id, isOpen, onClose])
}

