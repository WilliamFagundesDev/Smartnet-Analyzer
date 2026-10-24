<template>
  <header class="app-header">
    <div class="header-left">
      <div class="brand">
        <div class="brand-logo">
          <Activity class="brand-icon" />
        </div>
        <div class="brand-text">
          <span class="brand-title">SmartNet <span class="text-blue">Analyzer</span></span>
        </div>
      </div>

      <div class="graph-tag" :title="`Grafo ativo: ${graph.name}`">
        <span class="graph-name">{{ graph.name }}</span>
        <span class="tag-meta font-mono">{{ metrics?.vertexCount ?? 0 }} nós &middot; {{ metrics?.edgeCount ?? 0 }} conexões</span>
      </div>
    </div>

    <div class="header-right">
      <!-- Alternador de Tema Claro / Escuro -->
      <button
        class="btn btn-secondary btn-theme-toggle"
        @click="toggleTheme"
        :title="theme === 'light' ? 'Alternar para Tema Escuro' : 'Alternar para Tema Claro (Ideal para Projetores)'"
      >
        <Sun v-if="theme === 'light'" class="icon-sm text-amber" />
        <Moon v-else class="icon-sm text-purple" />
        <span class="theme-text">{{ theme === 'light' ? 'Tema Claro' : 'Tema Escuro' }}</span>
      </button>

      <button
        class="btn btn-ghost btn-shutdown"
        id="btn-shutdown-app"
        @click="requestTermination"
        title="Finalizar aplicação e liberar recursos"
      >
        <Power class="icon-sm" />
        <span>Encerrar Sessão</span>
      </button>

      <!-- Botão de Menu para Mobile -->
      <button
        class="btn btn-ghost mobile-menu-btn"
        @click="toggleMobileDrawer"
        title="Abrir Menu de Navegação e Exemplos"
      >
        <Menu class="icon-md" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { Activity, Power, Sun, Moon, Menu } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAppLifecycle } from '../../composables/useAppLifecycle.js'
import { useTheme } from '../../composables/useTheme.js'
import { useMobileNav } from '../../composables/useMobileNav.js'

const { graph, metrics } = useGraph()
const { requestTermination } = useAppLifecycle()
const { theme, toggleTheme } = useTheme()
const { toggleMobileDrawer } = useMobileNav()
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-5);
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.brand-logo {
  width: 32px;
  height: 32px;
  background: var(--color-primary-bg);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
}

.brand-title {
  font-size: var(--text-base);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.text-blue {
  color: var(--color-primary);
}

.graph-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
}

.graph-name {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-meta {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.btn-theme-toggle {
  font-size: var(--text-xs);
  padding: 0.35rem 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.theme-text {
  font-size: var(--text-xs);
}

.btn-shutdown {
  font-size: var(--text-xs);
  padding: 0.4rem 0.75rem;
  color: var(--text-secondary);
}

.btn-shutdown:hover {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.icon-sm {
  width: 15px;
  height: 15px;
}

.icon-md {
  width: 20px;
  height: 20px;
}

.mobile-menu-btn {
  display: none;
  padding: 0.35rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 var(--spacing-3);
  }

  .graph-tag {
    display: none;
  }

  .btn-shutdown {
    display: none;
  }

  .theme-text {
    display: none;
  }

  .btn-theme-toggle {
    padding: 0.35rem;
    border-radius: var(--radius-md);
  }

  .mobile-menu-btn {
    display: flex;
  }

  .brand-title .text-blue {
    display: none;
  }
}
</style>
