import { ref } from 'vue'

const isTerminated = ref(false)
const confirmModalOpen = ref(false)

export function useAppLifecycle() {
  function requestTermination() {
    confirmModalOpen.value = true
  }

  function confirmTermination() {
    confirmModalOpen.value = false
    isTerminated.value = true
  }

  function cancelTermination() {
    confirmModalOpen.value = false
  }

  function resumeApplication() {
    isTerminated.value = false
  }

  function restartApplication() {
    localStorage.removeItem('smartnet_analyzer_active_graph_v1')
    window.location.reload()
  }

  return {
    isTerminated,
    confirmModalOpen,
    requestTermination,
    confirmTermination,
    cancelTermination,
    resumeApplication,
    restartApplication
  }
}
