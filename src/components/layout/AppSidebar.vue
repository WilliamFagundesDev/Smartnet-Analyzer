<template>
  <aside
    class="app-sidebar"
    :class="{ 'is-collapsed': isCollapsed }"
    aria-label="Navegação Principal"
  >
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'collapsed-link': isCollapsed }"
          :title="isCollapsed ? item.label : ''"
        >
          <div class="icon-wrapper">
            <component :is="item.icon" class="nav-icon" />
          </div>
          <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
          <div v-if="isCollapsed" class="sidebar-tooltip">
            {{ item.label }}
          </div>
        </router-link>
      </nav>
    </div>

    <!-- Rodapé de Controle: Recolher / Expandir -->
    <div class="sidebar-footer">
      <button
        class="collapse-trigger-btn"
        @click="toggleSidebar"
        :title="isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'"
        aria-label="Alternar recolhimento da barra lateral"
      >
        <div class="icon-wrapper">
          <ChevronRight v-if="isCollapsed" class="collapse-icon" />
          <ChevronLeft v-else class="collapse-icon" />
        </div>
        <span v-if="!isCollapsed" class="collapse-label">Recolher Menu</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import {
  LayoutDashboard,
  Network,
  Box,
  Binary,
  Database,
  Cpu,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { useLayout } from '../../composables/useLayout.js'

const { isSidebarCollapsed, isFocusMode, toggleSidebar } = useLayout()
const isCollapsed = computed(() => isSidebarCollapsed.value || isFocusMode.value)

const navItems = [
  { path: '/', label: 'Visão Geral', icon: LayoutDashboard },
  { path: '/editor', label: 'Editor de Grafos', icon: Network },
  { path: '/explorer', label: 'Visualização 3D', icon: Box },
  { path: '/algorithms', label: 'Laboratório de Algoritmos', icon: Binary },
  { path: '/structures', label: 'Estrutura de Dados', icon: Database },
  { path: '/complexity', label: 'Análise de Complexidade', icon: Cpu },
  { path: '/docs', label: 'Documentação', icon: BookOpen }
]
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width var(--transition-normal);
  user-select: none;
  z-index: 40;
  flex-shrink: 0;
}

.app-sidebar.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-content {
  padding: var(--spacing-3) var(--spacing-2);
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--text-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}

.nav-link.router-link-exact-active,
.nav-link.router-link-active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-link.router-link-exact-active::before,
.nav-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.nav-icon {
  width: 17px;
  height: 17px;
  color: currentColor;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

/* Tooltip nativo personalizado no modo recolhido */
.collapsed-link {
  justify-content: center;
  padding: 0.6rem 0;
}

.collapsed-link .sidebar-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 10px;
  background: var(--text-primary);
  color: var(--bg-surface);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-4px);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  pointer-events: none;
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.collapsed-link:hover .sidebar-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.sidebar-footer {
  padding: var(--spacing-2) var(--spacing-2);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.collapse-trigger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 0.5rem 0.75rem;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.is-collapsed .collapse-trigger-btn {
  justify-content: center;
  padding: 0.5rem 0;
}

.collapse-trigger-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.collapse-icon {
  width: 15px;
  height: 15px;
}

.collapse-label {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .app-sidebar {
    display: none;
  }
}
</style>
