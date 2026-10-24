<template>
  <div v-if="isMobileDrawerOpen" class="drawer-overlay" @click.self="closeMobileDrawer">
    <div class="drawer-panel glass-panel">
      <!-- Cabeçalho da Gaveta -->
      <div class="drawer-header">
        <div class="brand">
          <div class="brand-logo">
            <Activity class="brand-icon" />
          </div>
          <div class="brand-text">
            <span class="brand-title">SmartNet <span class="text-blue">Analyzer</span></span>
            <span class="brand-sub">Menu Mobile</span>
          </div>
        </div>
        <button class="close-btn" @click="closeMobileDrawer" title="Fechar Menu">
          <X class="icon-md" />
        </button>
      </div>

      <!-- Corpo da Gaveta com Rolagem Suave -->
      <div class="drawer-body">
        <!-- 1. Card da Topologia Ativa -->
        <div class="graph-status-box card-elevated">
          <div class="status-top">
            <span class="status-label">GRAFO ATUAL:</span>
            <span class="status-name">{{ graph.name }}</span>
          </div>
          <div class="status-badges">
            <span class="badge badge-blue">{{ metrics?.vertexCount ?? 0 }} Vértices</span>
            <span class="badge badge-purple">{{ metrics?.edgeCount ?? 0 }} Arestas</span>
            <span class="badge" :class="graph.directed ? 'badge-amber' : 'badge-green'">
              {{ graph.directed ? 'Direcionado' : 'Não-Direcionado' }}
            </span>
          </div>
        </div>

        <!-- 2. Carregar Exemplos e Topologias -->
        <div class="drawer-section">
          <span class="section-title">TOPOLOGIAS PREDEFINIDAS</span>
          <div class="presets-list">
            <button
              v-for="p in presets"
              :key="p.id"
              class="preset-item-btn"
              :class="{ 'is-selected': graph.name === p.name }"
              @click="handleSelectPreset(p.id)"
            >
              <div class="preset-info">
                <span class="preset-title">{{ p.name }}</span>
                <span class="preset-desc">{{ p.vertices.length }} nós &middot; {{ p.edges.length }} conexões</span>
              </div>
              <Check v-if="graph.name === p.name" class="icon-xs text-blue" />
            </button>
          </div>
        </div>

        <!-- 3. Módulos Secundários do Sistema -->
        <div class="drawer-section">
          <span class="section-title">MÓDULOS & DOCUMENTAÇÃO</span>
          <div class="nav-links-list">
            <router-link
              v-for="item in secondaryNav"
              :key="item.path"
              :to="item.path"
              class="drawer-nav-link"
              @click="closeMobileDrawer"
            >
              <component :is="item.icon" class="link-icon" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- 4. Ferramentas e Configurações -->
        <div class="drawer-section">
          <span class="section-title">PREFERÊNCIAS & FERRAMENTAS</span>

          <div class="settings-actions">
            <!-- Alternador de Tema -->
            <button class="settings-btn" @click="toggleTheme">
              <Sun v-if="theme === 'light'" class="icon-sm text-amber" />
              <Moon v-else class="icon-sm text-purple" />
              <span>Tema: <strong>{{ theme === 'light' ? 'Claro (Projetor)' : 'Escuro' }}</strong></span>
            </button>

            <!-- Abrir Terminal Técnico -->
            <button class="settings-btn" @click="handleOpenTerminal">
              <Terminal class="icon-sm text-blue" />
              <span>Console de Eventos ({{ logs.length }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Rodapé com Botão de Encerrar -->
      <div class="drawer-footer">
        <button class="btn btn-danger btn-block" @click="handleShutdown">
          <Power class="icon-sm" />
          <span>Encerrar Aplicação</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Activity,
  X,
  Check,
  Database,
  Cpu,
  BookOpen,
  Sun,
  Moon,
  Terminal,
  Power
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useTheme } from '../../composables/useTheme.js'
import { useMobileNav } from '../../composables/useMobileNav.js'
import { useAppLifecycle } from '../../composables/useAppLifecycle.js'

const { presets, loadPreset, graph, metrics, logs } = useGraph()
const { theme, toggleTheme } = useTheme()
const { isMobileDrawerOpen, closeMobileDrawer, toggleMobileTerminal } = useMobileNav()
const { requestTermination } = useAppLifecycle()

const secondaryNav = [
  { path: '/structures', label: 'Estruturas de Dados (Matriz & Lista)', icon: Database },
  { path: '/complexity', label: 'Análise Assintótica & Complexidade', icon: Cpu },
  { path: '/docs', label: 'Documentação & Manual do Usuário', icon: BookOpen }
]

function handleSelectPreset(id) {
  loadPreset(id)
  closeMobileDrawer()
}

function handleOpenTerminal() {
  closeMobileDrawer()
  toggleMobileTerminal()
}

function handleShutdown() {
  closeMobileDrawer()
  requestTermination()
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 85%;
  max-width: 360px;
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.25);
  animation: slideInRight 220ms ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.brand-sub {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.text-blue {
  color: var(--color-primary);
}

.close-btn {
  color: var(--text-muted);
  padding: 0.35rem;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.graph-status-box {
  padding: var(--spacing-3);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.status-top {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
}

.status-name {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.status-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.section-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.presets-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.preset-item-btn {
  padding: 0.5rem 0.65rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  transition: all var(--transition-fast);
}

.preset-item-btn.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preset-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
}

.preset-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.nav-links-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.drawer-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.drawer-nav-link:hover, .drawer-nav-link.router-link-active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-color: var(--border-accent);
}

.link-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  width: 100%;
  justify-content: flex-start;
  transition: all var(--transition-fast);
}

.settings-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.drawer-footer {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--border-subtle);
}

.btn-block {
  width: 100%;
}

.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.text-purple { color: var(--color-purple); }
.text-amber { color: var(--color-warning); }
</style>
