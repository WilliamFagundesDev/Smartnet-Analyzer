import { ref } from 'vue'

const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('smartnet_theme') : null
// Padrão: 'light' (Tema Claro para máxima legibilidade e alto contraste em projetores de sala de aula)
const currentTheme = ref(savedTheme === 'dark' ? 'dark' : 'light')

function applyThemeToDom(themeName) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeName)
  }
}

// Aplicação inicial imediata
applyThemeToDom(currentTheme.value)

export function useTheme() {
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartnet_theme', currentTheme.value)
    }
    applyThemeToDom(currentTheme.value)
  }

  function setTheme(themeName) {
    if (themeName === 'light' || themeName === 'dark') {
      currentTheme.value = themeName
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartnet_theme', themeName)
      }
      applyThemeToDom(themeName)
    }
  }

  return {
    theme: currentTheme,
    toggleTheme,
    setTheme
  }
}
