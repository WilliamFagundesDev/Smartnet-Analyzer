import { ref, onMounted, onBeforeUnmount } from 'vue'

const isMobileDrawerOpen = ref(false)
const isMobileTerminalOpen = ref(false)
const isMobile = ref(false)

function checkIsMobile() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

export function useMobileNav() {
  function toggleMobileDrawer() {
    isMobileDrawerOpen.value = !isMobileDrawerOpen.value
  }

  function openMobileDrawer() {
    isMobileDrawerOpen.value = true
  }

  function closeMobileDrawer() {
    isMobileDrawerOpen.value = false
  }

  function toggleMobileTerminal() {
    isMobileTerminalOpen.value = !isMobileTerminalOpen.value
  }

  function closeMobileTerminal() {
    isMobileTerminalOpen.value = false
  }

  function initMobileListener() {
    checkIsMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIsMobile)
    }
  }

  function destroyMobileListener() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', checkIsMobile)
    }
  }

  return {
    isMobile,
    isMobileDrawerOpen,
    isMobileTerminalOpen,
    toggleMobileDrawer,
    openMobileDrawer,
    closeMobileDrawer,
    toggleMobileTerminal,
    closeMobileTerminal,
    initMobileListener,
    destroyMobileListener
  }
}
