<template>
  <div class="view-container dashboard-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">VISÃO GERAL</h1>
        <p class="view-subtitle">Topologia atual e métricas derivadas da infraestrutura urbana</p>
      </div>

      <div class="header-actions">
        <router-link to="/editor" class="btn btn-secondary">
          <Network class="icon-sm" />
          <span>Editar Grafo</span>
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
        <div class="metric-info">
          <span class="metric-name">TOTAL DE VÉRTICES (|V|)</span>
          <span class="metric-number font-mono">{{ metrics?.vertexCount ?? 0 }}</span>
          <span class="metric-hint">{{ metrics?.isolatedCount ?? 0 }} nós isolados</span>
        </div>
      </div>

      <div class="metric-card card-elevated">
        <div class="metric-info">
          <span class="metric-name">TOTAL DE ARESTAS (|E|)</span>
          <span class="metric-number font-mono">{{ metrics?.edgeCount ?? 0 }}</span>
          <span class="metric-hint">{{ graph.directed ? 'Conexões Direcionadas' : 'Conexões Bidirecionais' }}</span>
        </div>
      </div>

      <div class="metric-card card-elevated">
        <div class="metric-info">
          <span class="metric-name">COMPONENTES CONEXOS</span>
          <span class="metric-number font-mono">{{ metrics?.connectedComponentsCount ?? 0 }}</span>
          <span class="metric-hint" :class="metrics?.isConnected ? 'text-green' : 'text-amber'">
            {{ metrics?.isConnected ? '● Grafo Totalmente Conexo' : '▲ Grafo Desconexo' }}
          </span>
        </div>
      </div>

      <div class="metric-card card-elevated">
        <div class="metric-info">
          <span class="metric-name">DENSIDADE DO GRAFO</span>
          <span class="metric-number font-mono">{{ metrics?.density ?? 0 }}</span>
          <span class="metric-hint">Grau médio: {{ metrics?.avgDegree ?? 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Área Central Dividida: Canvas 3D e Painel Lateral de Execução -->
    <div class="dashboard-body">
      <div class="canvas-panel card-elevated">
        <div class="panel-top-bar">
          <div class="panel-title-group">
            <Box class="icon-sm text-blue" />
            <span class="panel-title">TOPOLOGIA EM TEMPO REAL &middot; 3D</span>
          </div>
          <router-link to="/explorer" class="text-link">
            Tela Cheia &rarr;
          </router-link>
        </div>
        <div class="canvas-wrapper">
          <GraphCanvas3D />
        </div>
      </div>

      <div class="side-panel">
        <div class="card-elevated quick-algo-card">
          <h3 class="side-title">EXECUÇÃO RÁPIDA</h3>
          <p class="side-subtitle">Escolha um algoritmo para executar imediatamente:</p>

          <div class="algo-quick-list">
            <button
              v-for="algo in quickAlgorithms"
              :key="algo.key"
              class="quick-algo-btn"
              @click="handleQuickRun(algo.key)"
            >
              <div class="btn-text-group">
                <span class="btn-algo-title">{{ algo.title }}</span>
                <span class="btn-algo-desc">{{ algo.desc }}</span>
              </div>
              <ChevronRight class="icon-sm text-muted" />
            </button>
          </div>
        </div>

        <div class="card-elevated summary-info-card">
          <h3 class="side-title">ESTADO DO GRAFO</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="row-label">Nome:</span>
              <span class="row-val font-bold">{{ graph.name }}</span>
            </div>
            <div class="info-row">
              <span class="row-label">Orientação:</span>
              <span class="badge" :class="graph.directed ? 'badge-purple' : 'badge-blue'">
                {{ graph.directed ? 'Direcionado' : 'Não-Direcionado' }}
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
              <span class="row-val font-mono">
                {{ result ? result.algorithm : 'Nenhum' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Network,
  Binary,
  Box,
  ChevronRight
} from 'lucide-vue-next'
import { useGraph } from '../composables/useGraph.js'
import { useAlgorithmRunner } from '../composables/useAlgorithmRunner.js'
import GraphCanvas3D from '../components/graph/GraphCanvas3D.vue'

const router = useRouter()
const { graph, metrics } = useGraph()
const { result, selectedAlgorithm, runInstant } = useAlgorithmRunner()

const quickAlgorithms = [
  { key: 'DFS', title: 'DFS (Busca em Profundidade)', desc: 'Percurso e floresta de busca — O(V + E)' },
  { key: 'BFS', title: 'BFS (Busca em Largura)', desc: 'Menor número de arestas (saltos) — O(V + E)' },
  { key: 'DIJKSTRA', title: 'Dijkstra (Menor Caminho)', desc: 'Menor custo ponderado — O((V + E) log V)' },
  { key: 'KRUSKAL', title: 'Kruskal (Árvore Mínima)', desc: 'Árvore Geradora Mínima — O(E log E)' }
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
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: -0.01em;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: var(--spacing-3);
}

.metric-card {
  padding: var(--spacing-4);
  background: var(--bg-surface);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-name {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.metric-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.3;
}

.metric-hint {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

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
  min-height: 440px;
  height: 440px;
}

.panel-top-bar {
  padding: 0.6rem var(--spacing-4);
  background: var(--bg-card);
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
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.text-link {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
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

.quick-algo-card, .summary-info-card {
  padding: var(--spacing-4);
  background: var(--bg-surface);
}

.side-title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
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
  padding: 0.55rem 0.75rem;
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
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--border-subtle);
}

.row-label {
  color: var(--text-muted);
}

.row-val {
  color: var(--text-primary);
}

.text-blue { color: var(--color-primary); }
.text-green { color: var(--color-success); }
.text-amber { color: var(--color-warning); }
.icon-sm { width: 15px; height: 15px; }

@media (max-width: 1024px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: var(--spacing-3);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
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

  .metric-card {
    padding: var(--spacing-3);
  }

  .metric-name {
    font-size: 0.65rem;
    line-height: 1.25;
    word-break: break-word;
  }

  .metric-number {
    font-size: 1.25rem;
  }

  .metric-hint {
    font-size: 0.68rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
