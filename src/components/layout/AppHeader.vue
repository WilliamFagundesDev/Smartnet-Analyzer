<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Marca Principal -->
      <router-link to="/" class="brand-link" title="SmartNet Analyzer - Início">
        <div class="brand-mark">
          <Activity class="brand-icon" />
        </div>
        <div class="brand-typography">
          <span class="brand-name">SmartNet</span>
          <span class="brand-badge">Analyzer</span>
        </div>
      </router-link>

      <div class="header-divider"></div>

      <!-- Seletor de Grafo e Topologias Ativas (Dropdown Compacto e Elegante) -->
      <div class="graph-selector-wrapper">
        <label for="header-preset-select" class="sr-only">Selecione o Grafo Ativo</label>
        <div class="graph-pill-selector">
          <Network class="icon-xs text-blue flex-shrink-0" />
          <select
            id="header-preset-select"
            class="header-select-native"
            :value="activePresetId"
            @change="handlePresetChange($event.target.value)"
            title="Trocar grafo / topologia ativa"
          >
            <option
              v-for="p in presets"
              :key="p.id"
              :value="p.id"
            >
              {{ p.name }}
            </option>
          </select>
          <span class="graph-stats-chip font-mono">
            {{ metrics?.vertexCount ?? 0 }}V &middot; {{ metrics?.edgeCount ?? 0 }}E
          </span>
          <ChevronDown class="icon-xs text-muted flex-shrink-0" />
        </div>
      </div>
    </div>

    <div class="header-right">
      <!-- Alternador de Tema Claro / Escuro -->
      <button
        class="header-tool-btn"
        @click="toggleTheme"
        :title="theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'"
        aria-label="Alternar tema de cores"
      >
        <Sun v-if="theme === 'light'" class="icon-sm theme-sun" />
        <Moon v-else class="icon-sm theme-moon" />
        <span class="tool-label">{{ theme === 'light' ? 'Claro' : 'Escuro' }}</span>
      </button>

      <!-- Botão de Encerramento Discreto -->
      <button
        class="header-tool-btn btn-shutdown"
        id="btn-shutdown-app"
        @click="requestTermination"
        title="Encerrar sessão de trabalho"
        aria-label="Encerrar sessão"
      >
        <Power class="icon-sm" />
        <span class="tool-label">Encerrar</span>
      </button>

      <!-- Menu Mobile -->
      <button
        class="header-tool-btn mobile-menu-btn"
        @click="toggleMobileDrawer"
        title="Menu de Navegação"
        aria-label="Abrir menu móvel"
      >
        <Menu class="icon-md" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import {
  Activity,
  Network,
  ChevronDown,
  Sun,
  Moon,
  Power,
  Menu
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAppLifecycle } from '../../composables/useAppLifecycle.js'
import { useTheme } from '../../composables/useTheme.js'
import { useMobileNav } from '../../composables/useMobileNav.js'

const { graph, metrics, presets, loadPreset } = useGraph()
const { requestTermination } = useAppLifecycle()
const { theme, toggleTheme } = useTheme()
const { toggleMobileDrawer } = useMobileNav()

const activePresetId = computed(() => {
  const match = presets.find(p => p.name === graph.value.name)
  return match ? match.id : (presets[0]?.id || '')
})

function handlePresetChange(id) {
  if (id) {
    loadPreset(id)
  }
}
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
  z-index: 50;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(79, 99, 246, 0.15) 0%, rgba(79, 99, 246, 0.05) 100%);
  border: 1px solid var(--border-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), border-color var(--transition-fast);
}

.brand-link:hover .brand-mark {
  transform: scale(1.04);
  border-color: var(--color-primary);
}

.brand-icon {
  width: 17px;
  height: 17px;
  color: var(--color-primary);
}

.brand-typography {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.brand-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(79, 99, 246, 0.2);
  letter-spacing: 0.02em;
}

.header-divider {
  width: 1px;
  height: 20px;
  background: var(--border-subtle);
  flex-shrink: 0;
}

/* Seletor Compacto de Topologia */
.graph-selector-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}

.graph-pill-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.25rem 0.65rem;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.graph-pill-selector:hover {
  border-color: var(--border-light);
  background: var(--bg-card-hover);
}

.header-select-native {
  position: relative;
  border: none;
  background: transparent;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
  font-family: inherit;
  cursor: pointer;
  outline: none;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.25rem;
}

.header-select-native:focus-visible {
  outline: none;
}

.graph-stats-chip {
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

/* Botões Utilitários do Cabeçalho */
.header-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  transition: all var(--transition-fast);
}

.header-tool-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
  border-color: var(--border-light);
}

.theme-sun {
  color: var(--color-warning);
}

.theme-moon {
  color: var(--color-purple);
}

.btn-shutdown:hover {
  color: var(--color-danger);
  border-color: rgba(239, 68, 68, 0.3);
  background: var(--color-danger-bg);
}

.mobile-menu-btn {
  display: none;
  padding: 0.4rem;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.icon-xs {
  width: 13px;
  height: 13px;
}

.icon-sm {
  width: 15px;
  height: 15px;
}

.icon-md {
  width: 19px;
  height: 19px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (max-width: 900px) {
  .header-select-native {
    max-width: 160px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 var(--spacing-3);
  }

  .header-divider,
  .graph-selector-wrapper,
  .btn-shutdown,
  .tool-label {
    display: none;
  }

  .header-tool-btn {
    padding: 0.4rem;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .brand-badge {
    display: none;
  }
}
</style>
