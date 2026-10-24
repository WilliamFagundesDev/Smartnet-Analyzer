<template>
  <div class="app-shell">
    <!-- Cabeçalho Principal -->
    <AppHeader />

    <!-- Corpo com Sidebar e Roteador de Views -->
    <div class="app-main-body">
      <AppSidebar />
      <main class="app-content">
        <router-view />
      </main>
    </div>

    <!-- Terminal Técnico Inferior (Console de Eventos - Desktop) -->
    <AppConsole />

    <!-- Barra de Navegação Inferior para Mobile (Thumb-Friendly) -->
    <MobileBottomNav />

    <!-- Gaveta Lateral Completa para Mobile (Drawer & Presets) -->
    <MobileNavDrawer />

    <!-- Terminal Técnico em Modal/Sheet para Mobile -->
    <MobileTerminalModal />

    <!-- Modal de Confirmação de Encerramento -->
    <ShutdownModal />

    <!-- Tela de Desconexão / Encerramento do Sistema -->
    <ShutdownScreen />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppConsole from './components/layout/AppConsole.vue'
import MobileBottomNav from './components/layout/MobileBottomNav.vue'
import MobileNavDrawer from './components/layout/MobileNavDrawer.vue'
import MobileTerminalModal from './components/layout/MobileTerminalModal.vue'
import ShutdownModal from './components/layout/ShutdownModal.vue'
import ShutdownScreen from './components/layout/ShutdownScreen.vue'
import { useMobileNav } from './composables/useMobileNav.js'

const { initMobileListener, destroyMobileListener } = useMobileNav()

onMounted(() => {
  initMobileListener()
})

onBeforeUnmount(() => {
  destroyMobileListener()
})
</script>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.app-main-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-primary);
  position: relative;
}

@media (max-width: 768px) {
  .app-content {
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
