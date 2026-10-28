import { ref } from 'vue'

const savedSidebarState = typeof window !== 'undefined' ? localStorage.getItem('smartnet_sidebar_collapsed') : null
const isSidebarCollapsed = ref(savedSidebarState === 'true')
const isFocusMode = ref(false)
const isConsoleCollapsed = ref(true) // Padrão recolhido para liberar espaço

export function useLayout() {
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartnet_sidebar_collapsed', String(isSidebarCollapsed.value))
    }
  }

  function setSidebarCollapsed(val) {
    isSidebarCollapsed.value = !!val
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartnet_sidebar_collapsed', String(isSidebarCollapsed.value))
    }
  }

  function toggleFocusMode() {
    isFocusMode.value = !isFocusMode.value
    if (isFocusMode.value) {
      isConsoleCollapsed.value = true
    }
  }

  function setFocusMode(val) {
    isFocusMode.value = !!val
    if (isFocusMode.value) {
      isConsoleCollapsed.value = true
    }
  }

  function toggleConsole() {
    isConsoleCollapsed.value = !isConsoleCollapsed.value
  }

  function setConsoleCollapsed(val) {
    isConsoleCollapsed.value = !!val
  }

  return {
    isSidebarCollapsed,
    isFocusMode,
    isConsoleCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    toggleFocusMode,
    setFocusMode,
    toggleConsole,
    setConsoleCollapsed
  }
}
