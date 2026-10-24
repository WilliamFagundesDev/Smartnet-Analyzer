<template>
  <aside class="app-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar-top">
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :title="isCollapsed ? item.label : ''"
        >
          <component :is="item.icon" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Seletor Limpo de Exemplos -->
    <div v-if="!isCollapsed" class="sidebar-presets">
      <label class="presets-label">CARREGAR EXEMPLO:</label>
      <select
        class="select-control presets-select"
        @change="handleSelectPreset($event.target.value)"
      >
        <option
          v-for="p in presets"
          :key="p.id"
          :value="p.id"
          :selected="graph.name === p.name"
        >
          {{ p.name }}
        </option>
      </select>
    </div>

    <div class="sidebar-footer">
      <button
        class="collapse-btn"
        @click="isCollapsed = !isCollapsed"
        :title="isCollapsed ? 'Expandir Menu' : 'Recolher Menu'"
      >
        <ChevronLeft v-if="!isCollapsed" class="icon-sm" />
        <ChevronRight v-else class="icon-sm" />
        <span v-if="!isCollapsed" class="collapse-text">Recolher</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import {
  LayoutDashboard,
  Network,
  Box,
  Binary,
  Cpu,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'

const isCollapsed = ref(false)
const { presets, loadPreset, graph } = useGraph()

const navItems = [
  { path: '/', label: 'Visão Geral', icon: LayoutDashboard },
  { path: '/editor', label: 'Editor de Grafos', icon: Network },
  { path: '/explorer', label: 'Visualização 3D', icon: Box },
  { path: '/algorithms', label: 'Laboratório de Algoritmos', icon: Binary },
  { path: '/structures', label: 'Estrutura de Dados', icon: Database },
  { path: '/complexity', label: 'Análise de Complexidade', icon: Cpu },
  { path: '/docs', label: 'Documentação', icon: BookOpen }
]

function handleSelectPreset(id) {
  if (id) {
    loadPreset(id)
  }
}
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
}

.app-sidebar.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-top {
  padding: var(--spacing-3);
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--text-sm);
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

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-presets {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.presets-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.presets-select {
  font-size: var(--text-xs);
  padding: 0.4rem 0.55rem;
  background: var(--bg-card);
  border-color: var(--border-subtle);
}

.sidebar-footer {
  padding: var(--spacing-2) var(--spacing-3);
  border-top: 1px solid var(--border-subtle);
}

.collapse-btn {
  width: 100%;
  padding: 0.45rem;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
}

.collapse-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.icon-sm {
  width: 15px;
  height: 15px;
}

@media (max-width: 768px) {
  .app-sidebar {
    display: none;
  }
}
</style>
