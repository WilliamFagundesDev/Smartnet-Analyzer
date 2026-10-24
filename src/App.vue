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

    <!-- Terminal Técnico Inferior (Console de Eventos) -->
    <AppConsole />

    <!-- Modal de Confirmação de Encerramento -->
    <ShutdownModal />

    <!-- Tela de Desconexão / Encerramento do Sistema -->
    <ShutdownScreen />
  </div>
</template>

<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppConsole from './components/layout/AppConsole.vue'
import ShutdownModal from './components/layout/ShutdownModal.vue'
import ShutdownScreen from './components/layout/ShutdownScreen.vue'
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
</style>
