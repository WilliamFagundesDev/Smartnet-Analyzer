<template>
  <div class="view-container dashboard-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Visão Geral da Rede</h1>
        <p class="view-subtitle">Topologia ativa e métricas fundamentais derivadas da infraestrutura urbana</p>
      </div>

      <div class="header-actions">
        <router-link to="/editor" class="btn btn-secondary">
          <Network class="icon-sm" />
          <span>Editor de Grafos</span>
        </router-link>
        <router-link to="/algorithms" class="btn btn-primary">
          <Binary class="icon-sm" />
          <span>Laboratório de Algoritmos</span>
        </router-link>
      </div>
    </div>

    <!-- Indicadores Principais Derivados dos Dados Reais -->
    <div class="metrics-grid">
      <div class="metric-card card-elevated">
        <div class="metric-top">
          <span class="metric-name">TOTAL DE VÉRTICES (|V|)</span>
          <span class="metric-icon-wrap bg-blue-subtle">
            <Layers class="icon-xs text-blue" />
          </span>
        </div>
        <div class="metric-value font-mono">{{ metrics?.vertexCount ?? 0 }}</div>
        <div class="metric-hint">
          {{ metrics?.isolatedCount ?? 0 }} nós isolados
        </div>
      </div>

      <div class="metric-card card-elevated">
        <div class="metric-top">
          <span class="metric-name">TOTAL DE ARESTAS (|E|)</span>
          <span class="metric-icon-wrap bg-purple-subtle">
            <Network class="icon-xs text-purple" />
          </span>
        </div>
        <div class="metric-value font-mono">{{ metrics?.edgeCount ?? 0 }}</div>
        <div class="metric-hint">
          {{ graph.directed ? 'Conexões Direcionadas' : 'Conexões Bidirecionais' }}
        </div>
      </div>

      <div class="metric-card card-elevated">
        <div class="metric-top">
          <span class="metric-name">COMPONENTES CONEXOS</span>
          <span class="metric-icon-wrap" :class="metrics?.isConnected ? 'bg-green-subtle' : 'bg-amber-subtle'">
            <Share2 class="icon-xs" :class="metrics?.isConnected ? 'text-green' : 'text-amber'" />
          </span>
        </div>
        <div class="metric-value font-mono">{{ metrics?.connectedComponentsCount ?? 0 }}</div>
        <div class="metric-hint" :class="metrics?.isConnected ? 'text-green' : 'text-amber'">
          {{ metrics?.isConnected ? '● Grafo Totalmente Conexo' : '▲ Grafo Desconexo' }}
        </div>
      </div>

      <div class="metric-card card-elevated">
        <div class="metric-top">
          <span class="metric-name">DENSIDADE DA REDE</span>
          <span class="metric-icon-wrap bg-blue-subtle">
            <Activity class="icon-xs text-blue" />
          </span>
        </div>
        <div class="metric-value font-mono">{{ metrics?.density ?? 0 }}</div>
        <div class="metric-hint">
          Grau médio: {{ metrics?.avgDegree ?? 0 }}
        </div>
      </div>
    </div>

    <!-- Área Central Dividida: Canvas 3D e Painel Lateral de Execução -->
    <div class="dashboard-body">
      <div class="canvas-panel card-elevated">
        <div class="panel-top-bar">
          <div class="panel-title-group">
            <Box class="icon-sm text-blue" />
            <span class="panel-title">Topologia Espacial em Tempo Real &middot; 3D</span>
          </div>
          <router-link to="/explorer" class="explorer-link">
            <span>Tela Cheia</span>
            <ArrowUpRight class="icon-xs" />
          </router-link>
        </div>
        <div class="canvas-wrapper">
          <GraphCanvas3D />
        </div>
      </div>

      <div class="side-panel">
        <div class="card-elevated quick-algo-card">
          <h3 class="side-title">Execução Rápida</h3>
          <p class="side-subtitle">Selecione um algoritmo para simular imediatamente:</p>

          <div class="algo-quick-list">
            <button
              v-for="algo in quickAlgorithms"
              :key="algo.key"
              class="quick-algo-btn"
              @click="handleQuickRun(algo.key)"
              type="button"
            >
              <div class="btn-text-group">
                <span class="btn-algo-title">{{ algo.title }}</span>
                <span class="btn-algo-desc">{{ algo.desc }}</span>
              </div>
              <ChevronRight class="icon-sm text-muted arrow-icon" />
            </button>
          </div>
        </div>

        <div class="card-elevated summary-info-card">
          <h3 class="side-title">Estado da Infraestrutura</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="row-label">Topologia Ativa:</span>
              <span class="row-val font-bold">{{ graph.name }}</span>
            </div>
            <div class="info-row">
              <span class="row-label">Orientação:</span>
              <span class="badge" :class="graph.directed ? 'badge-purple' : 'badge-blue'">
                {{ graph.directed ? 'Direcionado (u ➔ v)' : 'Não-Direcionado (u ↔ v)' }}
              </span>
            </div>
            <div class="info-row">
              <span class="row-label">Ponderação:</span>
              <span class="badge" :class="graph.weighted ? 'badge-green' : 'badge-amber'">
                {{ graph.weighted ? 'Ponderado' : 'Não-Ponderado' }}
              </span>
            </div>
            <div class="info-row">
              <span class="row-label">Último Algoritmo:</span>
              <span class="row-val font-mono text-blue font-bold">
                {{ result ? result.algorithm : 'Nenhum' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Espaçador garantido de respiro inferior no final da rolagem -->
    <div class="scroll-bottom-spacer"></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Network,
  Binary,
  Box,
  Layers,
  Share2,
  Activity,
  ArrowUpRight,
  ChevronRight
} from 'lucide-vue-next'
import { useGraph } from '../composables/useGraph.js'
import { useAlgorithmRunner } from '../composables/useAlgorithmRunner.js'
import GraphCanvas3D from '../components/graph/GraphCanvas3D.vue'

const router = useRouter()
const { graph, metrics } = useGraph()
const { result, selectedAlgorithm, runInstant } = useAlgorithmRunner()

const quickAlgorithms = [
  { key: 'DFS', title: 'DFS (Busca em Profundidade)', desc: 'Travessia de caminhos e componentes — O(V + E)' },
  { key: 'BFS', title: 'BFS (Busca em Largura)', desc: 'Menor número de saltos em arestas — O(V + E)' },
  { key: 'DIJKSTRA', title: 'Dijkstra (Menor Caminho)', desc: 'Menor custo ponderado ótimo — O((V + E) log V)' },
  { key: 'KRUSKAL', title: 'Kruskal (Árvore Mínima)', desc: 'Árvore Geradora Mínima global — O(E log E)' }
]

function handleQuickRun(algo) {
  selectedAlgorithm.value = algo
  runInstant()
  router.push('/algorithms')
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  height: 100%;
  overflow-y: auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.view-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Indicadores Métricas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: var(--spacing-3);
}

.metric-card {
  padding: var(--spacing-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-light);
  box-shadow: var(--shadow-md);
}

.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-name {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.metric-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-subtle { background: var(--color-primary-bg); }
.bg-purple-subtle { background: var(--color-purple-bg); }
.bg-green-subtle { background: var(--color-success-bg); }
.bg-amber-subtle { background: var(--color-warning-bg); }

.metric-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.25;
}

.metric-hint {
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Corpo Principal do Dashboard */
.dashboard-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-4);
  flex: 1;
  min-height: 480px;
}

.canvas-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  min-height: 440px;
  height: 440px;
}

.panel-top-bar {
  padding: 0.65rem var(--spacing-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.panel-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.explorer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.explorer-link:hover {
  color: var(--color-primary-hover);
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  min-height: 380px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.quick-algo-card,
.summary-info-card {
  padding: var(--spacing-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.side-title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}

.side-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-3);
}

.algo-quick-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.quick-algo-btn {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  transition: all var(--transition-fast);
}

.quick-algo-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--color-primary);
  transform: translateX(2px);
}

.quick-algo-btn:hover .arrow-icon {
  color: var(--color-primary);
  transform: translateX(2px);
}

.btn-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.btn-algo-title {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-primary);
}

.btn-algo-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.arrow-icon {
  transition: transform var(--transition-fast), color var(--transition-fast);
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  font-size: var(--text-xs);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-subtle);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-label {
  color: var(--text-muted);
}

.row-val {
  color: var(--text-primary);
}

.icon-xs { width: 13px; height: 13px; }
.icon-sm { width: 15px; height: 15px; }

@media (max-width: 1024px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: var(--spacing-3);
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2);
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
    font-size: var(--text-xs);
    padding: 0.45rem;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-2);
  }

  .canvas-panel {
    min-height: 330px;
    height: 330px;
  }

  .canvas-wrapper {
    min-height: 280px;
  }
}
</style>
