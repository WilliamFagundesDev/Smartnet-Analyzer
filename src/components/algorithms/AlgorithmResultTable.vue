<template>
  <div class="algorithm-results-container" :class="{ 'card-elevated': !embedded }">
    <!-- Cabeçalho do Painel de Resultados -->
    <div class="results-header-bar">
      <div class="header-main-info">
        <div class="title-with-badge">
          <h3 class="results-heading">MÉTRICAS & RESULTADO TÉCNICO</h3>
          <span v-if="activeResult" class="badge badge-blue">
            {{ activeResult.algorithm }}
          </span>
        </div>
        <p class="results-sub" v-if="activeResult">
          Complexidade Teórica:
          <strong class="font-mono text-primary">{{ activeResult.complexity.time }}</strong>
          &middot; Espaço:
          <span class="font-mono text-muted">{{ activeResult.complexity.space }}</span>
        </p>
      </div>

      <div class="header-action-group" v-if="activeResult">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="copyTextResults"
          :title="copied ? 'Copiado para a área de transferência!' : 'Copiar relatório completo'"
        >
          <Check v-if="copied" class="icon-xs text-green" />
          <Copy v-else class="icon-xs" />
          <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
        </button>

        <button
          v-if="!embedded"
          type="button"
          class="btn btn-ghost btn-sm"
          @click="clearResult"
          title="Limpar resultados"
        >
          <Trash2 class="icon-xs" />
          <span>Limpar</span>
        </button>
      </div>
    </div>

    <!-- Estado Vazio (Antes da Execução) -->
    <div v-if="!activeResult" class="empty-state-panel">
      <div class="empty-icon-circle">
        <Binary class="empty-icon text-muted" />
      </div>
      <h4 class="empty-title">Pronto para Execução</h4>
      <p class="empty-desc">
        Selecione 1 ou mais algoritmos acima e clique em <strong>Executar Simulação</strong> para visualizar o percurso passo a passo ou <strong>Resultado Imediato</strong> para obter o relatório final instantâneo.
      </p>
    </div>

    <!-- Resultados Reais do Algoritmo -->
    <div v-else class="results-body">
      <!-- 1. Notificação de Conclusão Discreta -->
      <div class="completion-banner">
        <CheckCircle2 class="icon-sm text-green flex-shrink-0" />
        <span class="completion-text">
          Execução de <strong>{{ activeResult.algorithm }}</strong> concluída com sucesso &mdash;
          {{ completionSummaryText }}
        </span>
      </div>

      <!-- 2. Resumo Principal: Métricas Chave Específicas do Algoritmo -->
      <div class="kpi-metrics-grid">
        <!-- DFS KPIs -->
        <template v-if="activeResult.algorithm === 'DFS'">
          <div class="kpi-card">
            <span class="kpi-label">Vértice Raiz:</span>
            <span class="kpi-val font-mono text-blue">{{ activeResult.startVertexId }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Vértices Visitados:</span>
            <span class="kpi-val font-mono">{{ activeResult.visitedCount }} / {{ activeResult.totalVertices }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Arestas de Árvore:</span>
            <span class="kpi-val font-mono text-green">{{ activeResult.treeEdgeCount }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Conectividade:</span>
            <span class="badge" :class="activeResult.isCompleteTraversal ? 'badge-green' : 'badge-amber'">
              {{ activeResult.isCompleteTraversal ? 'Totalmente Conexo' : 'Grafo Desconexo' }}
            </span>
          </div>
        </template>

        <!-- BFS KPIs -->
        <template v-else-if="activeResult.algorithm === 'BFS'">
          <div class="kpi-card">
            <span class="kpi-label">Vértice Raiz:</span>
            <span class="kpi-val font-mono text-blue">{{ activeResult.startVertexId }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Vértices Alcançados:</span>
            <span class="kpi-val font-mono">{{ activeResult.visitedCount }} / {{ activeResult.totalVertices }}</span>
          </div>
          <div class="kpi-card" v-if="activeResult.targetVertexId">
            <span class="kpi-label">Destino:</span>
            <span class="kpi-val font-mono text-primary">{{ activeResult.targetVertexId }}</span>
          </div>
          <div class="kpi-card" v-if="activeResult.shortestPath">
            <span class="kpi-label">Menor Salto:</span>
            <span class="kpi-val font-mono text-green">{{ activeResult.pathEdgeCount }} arestas</span>
          </div>
        </template>

        <!-- Dijkstra KPIs -->
        <template v-else-if="activeResult.algorithm === 'Dijkstra'">
          <div class="kpi-card">
            <span class="kpi-label">Vértice Origem:</span>
            <span class="kpi-val font-mono text-blue">{{ activeResult.startVertexId }}</span>
          </div>
          <div class="kpi-card" v-if="activeResult.targetVertexId">
            <span class="kpi-label">Destino:</span>
            <span class="kpi-val font-mono text-primary">{{ activeResult.targetVertexId }}</span>
          </div>
          <div class="kpi-card" v-if="activeResult.targetCost !== null">
            <span class="kpi-label">Custo Mínimo Total:</span>
            <span class="kpi-val font-mono text-green">{{ activeResult.targetCost }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Vértices Fixados:</span>
            <span class="kpi-val font-mono">{{ activeResult.settledOrder.length }} / {{ graph.vertices.length }}</span>
          </div>
        </template>

        <!-- Kruskal KPIs -->
        <template v-else-if="activeResult.algorithm === 'Kruskal'">
          <div class="kpi-card">
            <span class="kpi-label">Arestas na AGM:</span>
            <span class="kpi-val font-mono text-green">
              {{ activeResult.edgeCountInMST }}
              <span class="kpi-subtext">de {{ activeResult.expectedEdgesForSingleTree }}</span>
            </span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Custo Total da Árvore:</span>
            <span class="kpi-val font-mono text-blue">{{ activeResult.totalCost }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Componentes:</span>
            <span class="kpi-val font-mono">{{ activeResult.componentCount }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Classificação:</span>
            <span class="badge" :class="activeResult.isSpanningTree ? 'badge-green' : 'badge-amber'">
              {{ activeResult.isSpanningTree ? 'Árvore Única' : 'Floresta Mínima' }}
            </span>
          </div>
        </template>
      </div>

      <!-- 3. Caminho Mínimo Encontrado em Destaque (BFS / Dijkstra) -->
      <div v-if="shortestPathList" class="path-card">
        <div class="path-top">
          <span class="path-title">CAMINHO ÓTIMO ENCONTRADO</span>
          <span v-if="pathMetricBadge" class="badge badge-green font-mono">
            {{ pathMetricBadge }}
          </span>
        </div>
        <div class="path-nodes-flow font-mono">
          <span
            v-for="(nodeId, idx) in shortestPathList"
            :key="`${nodeId}-${idx}`"
            class="path-node-item"
          >
            <span class="node-chip">{{ nodeId }}</span>
            <span v-if="idx < shortestPathList.length - 1" class="node-arrow">&rarr;</span>
          </span>
        </div>
      </div>

      <!-- 4. Seletor de Detalhes Sob Demanda (Abas Limpas) -->
      <div class="details-tab-bar">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeDetailTab === 'main' }"
          @click="activeDetailTab = 'main'"
        >
          <span>{{ mainTabLabel }}</span>
        </button>

        <button
          v-if="hasSecondaryTab"
          type="button"
          class="tab-btn"
          :class="{ active: activeDetailTab === 'secondary' }"
          @click="activeDetailTab = 'secondary'"
        >
          <span>{{ secondaryTabLabel }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeDetailTab === 'sequence' }"
          @click="activeDetailTab = 'sequence'"
        >
          <span>Ordem de Visitação</span>
        </button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div class="tab-content-panel">
        <!-- DFS Aba Principal: Arestas da Árvore DFS -->
        <div v-if="activeResult.algorithm === 'DFS' && activeDetailTab === 'main'">
          <div v-if="activeResult.treeEdges.length === 0" class="empty-subtext">
            Nenhuma aresta de árvore gerada (vértice inicial isolado).
          </div>
          <div v-else class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Origem</th>
                  <th>Destino</th>
                  <th>Peso</th>
                  <th>Aresta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in activeResult.treeEdges" :key="e.edgeId || `${e.source}-${e.target}`">
                  <td class="font-mono text-blue font-bold">{{ e.source }}</td>
                  <td class="font-mono text-blue font-bold">{{ e.target }}</td>
                  <td class="font-mono font-bold">{{ e.weight }}</td>
                  <td class="font-mono text-muted">{{ e.edgeId || 'e-tree' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="activeResult.unreachableVertices.length > 0" class="warning-alert-row">
            <AlertTriangle class="icon-xs text-amber" />
            <span>
              <strong>Vértices Inalcançáveis a partir de "{{ activeResult.startVertexId }}":</strong>
              {{ activeResult.unreachableVertices.join(', ') }}
            </span>
          </div>
        </div>

        <!-- BFS Aba Principal: Tabela de Distâncias e Predecessores -->
        <div v-else-if="activeResult.algorithm === 'BFS' && activeDetailTab === 'main'">
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Vértice</th>
                  <th>Distância (Saltos)</th>
                  <th>Predecessor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in graph.vertices" :key="v.id">
                  <td class="font-mono text-blue font-bold">{{ v.id }} <span class="text-secondary font-sans font-normal">({{ v.label }})</span></td>
                  <td class="font-mono font-bold">
                    {{ activeResult.distances[v.id] === Infinity ? '∞' : activeResult.distances[v.id] }}
                  </td>
                  <td class="font-mono">{{ activeResult.predecessors[v.id] || '—' }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="activeResult.distances[v.id] !== Infinity ? 'badge-green' : 'badge-red'"
                    >
                      {{ activeResult.distances[v.id] !== Infinity ? 'Alcançado' : 'Inalcançável' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Dijkstra Aba Principal: Tabela Completa de Destinos e Custos Ótimos -->
        <div v-else-if="activeResult.algorithm === 'Dijkstra' && activeDetailTab === 'main'">
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Destino</th>
                  <th>Custo Ótimo Acumulado</th>
                  <th>Predecessor</th>
                  <th>Caminho Reconstruído</th>
                  <th>Alcançabilidade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in activeResult.distancesTable" :key="row.vertexId">
                  <td class="font-mono text-blue font-bold">{{ row.vertexId }} <span class="text-secondary font-sans font-normal">({{ row.label }})</span></td>
                  <td class="font-mono font-bold">
                    {{ row.isReachable ? row.distance : '∞' }}
                  </td>
                  <td class="font-mono">{{ row.predecessor || '—' }}</td>
                  <td class="font-mono text-secondary">{{ row.pathString }}</td>
                  <td>
                    <span class="badge" :class="row.isReachable ? 'badge-green' : 'badge-red'">
                      {{ row.isReachable ? 'Alcançável' : 'Inalcançável' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Kruskal Aba Principal: Arestas Selecionadas na AGM -->
        <div v-else-if="activeResult.algorithm === 'Kruskal' && activeDetailTab === 'main'">
          <div v-if="activeResult.mstEdges.length === 0" class="empty-subtext">
            Nenhuma aresta foi aceita na Árvore Geradora Mínima.
          </div>
          <div v-else class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Vértice U</th>
                  <th>Vértice V</th>
                  <th>Peso da Aresta</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in activeResult.mstEdges" :key="e.id">
                  <td class="font-mono text-blue font-bold">{{ e.source }}</td>
                  <td class="font-mono text-blue font-bold">{{ e.target }}</td>
                  <td class="font-mono font-bold">{{ e.weight }}</td>
                  <td>
                    <span class="badge badge-green">Aceita na AGM</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Kruskal Aba Secundária: Arestas Rejeitadas (Ciclos) -->
        <div v-else-if="activeResult.algorithm === 'Kruskal' && activeDetailTab === 'secondary'">
          <div v-if="activeResult.rejectedEdges.length === 0" class="empty-subtext">
            Nenhum ciclo formado (grafo acíclico).
          </div>
          <div v-else class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Vértice U</th>
                  <th>Vértice V</th>
                  <th>Peso</th>
                  <th>Motivo da Rejeição</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in activeResult.rejectedEdges" :key="e.id">
                  <td class="font-mono text-muted">{{ e.source }}</td>
                  <td class="font-mono text-muted">{{ e.target }}</td>
                  <td class="font-mono">{{ e.weight }}</td>
                  <td>
                    <span class="badge badge-red">Formaria Ciclo (Mesmo Conjunto DSU)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Aba Ordem de Visitação / Fixação -->
        <div v-else-if="activeDetailTab === 'sequence'">
          <div class="sequence-chips-wrap">
            <div
              v-for="(vId, idx) in visitSequenceList"
              :key="`${vId}-${idx}`"
              class="sequence-pill font-mono"
            >
              <span class="seq-idx">#{{ idx + 1 }}</span>
              <span class="seq-node">{{ vId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Binary,
  Copy,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'

const props = defineProps({
  customResult: {
    type: Object,
    default: null
  },
  embedded: {
    type: Boolean,
    default: false
  }
})

const { graph } = useGraph()
const { result, clearResult } = useAlgorithmRunner()
const copied = ref(false)
const activeDetailTab = ref('main')

const activeResult = computed(() => props.customResult || result.value)

watch(
  () => activeResult.value?.algorithm,
  () => {
    activeDetailTab.value = 'main'
  }
)

const completionSummaryText = computed(() => {
  if (!activeResult.value) return ''
  switch (activeResult.value.algorithm) {
    case 'DFS':
      return `${activeResult.value.visitedCount} nós visitados & ${activeResult.value.treeEdgeCount} arestas de árvore geradas.`
    case 'BFS':
      return `${activeResult.value.visitedCount} nós alcançados a partir da raiz "${activeResult.value.startVertexId}".`
    case 'Dijkstra':
      return activeResult.value.targetCost !== null
        ? `Menor custo para "${activeResult.value.targetVertexId}": ${activeResult.value.targetCost}.`
        : `Custos calculados para todos os ${activeResult.value.settledOrder.length} nós alcançáveis.`
    case 'Kruskal':
      return `AGM construída com ${activeResult.value.edgeCountInMST} arestas e custo total de ${activeResult.value.totalCost}.`
    default:
      return 'Cálculo concluído.'
  }
})

const shortestPathList = computed(() => {
  if (!activeResult.value) return null
  if (activeResult.value.algorithm === 'BFS' && activeResult.value.shortestPath) {
    return activeResult.value.shortestPath
  }
  if (activeResult.value.algorithm === 'Dijkstra' && activeResult.value.targetPath) {
    return activeResult.value.targetPath
  }
  return null
})

const pathMetricBadge = computed(() => {
  if (!activeResult.value) return null
  if (activeResult.value.algorithm === 'BFS' && activeResult.value.pathEdgeCount !== undefined) {
    return `${activeResult.value.pathEdgeCount} Saltos`
  }
  if (activeResult.value.algorithm === 'Dijkstra' && activeResult.value.targetCost !== null) {
    return `Custo: ${activeResult.value.targetCost}`
  }
  return null
})

const mainTabLabel = computed(() => {
  if (!activeResult.value) return 'Detalhes'
  switch (activeResult.value.algorithm) {
    case 'DFS': return 'Arestas de Árvore'
    case 'BFS': return 'Tabela de Distâncias (Saltos)'
    case 'Dijkstra': return 'Tabela de Custos & Caminhos'
    case 'Kruskal': return 'Arestas Aceitas (AGM)'
    default: return 'Detalhes'
  }
})

const hasSecondaryTab = computed(() => {
  return activeResult.value && activeResult.value.algorithm === 'Kruskal' && activeResult.value.rejectedEdges?.length > 0
})

const secondaryTabLabel = computed(() => {
  return 'Ciclos Rejeitados'
})

const visitSequenceList = computed(() => {
  if (!activeResult.value) return []
  if (activeResult.value.visitedOrder) return activeResult.value.visitedOrder
  if (activeResult.value.settledOrder) return activeResult.value.settledOrder
  if (activeResult.value.mstEdges) return activeResult.value.mstEdges.map(e => `${e.source}➔${e.target}`)
  return []
})

function copyTextResults() {
  if (!activeResult.value) return
  let text = `SMARTNET ANALYZER — RELATÓRIO DO ALGORITMO: ${activeResult.value.algorithm}\n`
  text += `Data: ${new Date().toLocaleString()}\n`
  text += `Complexidade Teórica: ${activeResult.value.complexity.time} (Espaço: ${activeResult.value.complexity.space})\n\n`

  if (activeResult.value.algorithm === 'DFS') {
    text += `Raiz: ${activeResult.value.startVertexId}\n`
    text += `Ordem de Visitação: ${activeResult.value.visitedOrder.join(' -> ')}\n`
    text += `Arestas de Árvore: ${activeResult.value.treeEdges.map(e => `(${e.source}, ${e.target})`).join(', ')}\n`
    if (activeResult.value.unreachableVertices.length > 0) {
      text += `Vértices Inalcançáveis: ${activeResult.value.unreachableVertices.join(', ')}\n`
    }
  } else if (activeResult.value.algorithm === 'BFS') {
    text += `Raiz: ${activeResult.value.startVertexId}\n`
    text += `Ordem de Visitação: ${activeResult.value.visitedOrder.join(' -> ')}\n`
    if (activeResult.value.shortestPath) {
      text += `Caminho Mínimo em Saltos: ${activeResult.value.shortestPath.join(' -> ')} (${activeResult.value.pathEdgeCount} arestas)\n`
    }
  } else if (activeResult.value.algorithm === 'Dijkstra') {
    text += `Origem: ${activeResult.value.startVertexId}\n`
    if (activeResult.value.targetPath) {
      text += `Caminho Ótimo para ${activeResult.value.targetVertexId}: ${activeResult.value.targetPath.join(' -> ')} (Custo: ${activeResult.value.targetCost})\n`
    }
    text += `Tabela de Distâncias:\n`
    activeResult.value.distancesTable.forEach(row => {
      text += ` - ${row.vertexId}: Custo ${row.distance ?? '∞'} | Caminho: ${row.pathString}\n`
    })
  } else if (activeResult.value.algorithm === 'Kruskal') {
    text += `Custo Total da AGM: ${activeResult.value.totalCost}\n`
    text += `Classificação: ${activeResult.value.isSpanningTree ? 'Árvore Única' : 'Floresta'}\n`
    text += `Arestas Aceitas:\n`
    activeResult.value.mstEdges.forEach(e => {
      text += ` - (${e.source} - ${e.target}): Peso ${e.weight}\n`
    })
  }

  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<style scoped>
.algorithm-results-container {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.algorithm-results-container:not(.card-elevated) {
  padding: 0;
  border: none;
  background: transparent;
}

.results-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-3);
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.results-heading {
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.results-sub {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Estado Vazio */
.empty-state-panel {
  padding: var(--spacing-8) var(--spacing-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-2);
}

.empty-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-1);
}

.empty-icon {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
}

.empty-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.empty-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  max-width: 440px;
  line-height: 1.5;
}

/* Resultados Preenchidos */
.results-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.completion-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--color-success-bg);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
  padding: 0.45rem 0.75rem;
  font-size: var(--text-xs);
  color: var(--color-success);
}

.completion-text {
  color: var(--text-primary);
}

/* KPIs */
.kpi-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-2);
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.kpi-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
}

.kpi-val {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-subtext {
  font-size: 0.68rem;
  font-weight: 400;
  color: var(--text-muted);
}

/* Card do Caminho */
.path-card {
  background: var(--color-path-bg);
  border: 1px solid rgba(14, 165, 233, 0.35);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.path-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.path-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-path);
  letter-spacing: 0.04em;
}

.path-nodes-flow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: var(--text-sm);
  font-weight: 700;
}

.node-chip {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid rgba(14, 165, 233, 0.4);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}

.node-arrow {
  color: var(--color-path);
}

/* Abas de Detalhes Sob Demanda */
.details-tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 2px;
}

.tab-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: transparent;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.tab-content-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.sequence-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: var(--spacing-2) 0;
}

.sequence-pill {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-xs);
}

.seq-idx {
  color: var(--text-muted);
  font-size: 0.68rem;
}

.seq-node {
  color: var(--color-primary);
  font-weight: 700;
}

.warning-alert-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--color-warning-bg);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-warning);
}

.empty-subtext {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-style: italic;
  padding: var(--spacing-3) 0;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.icon-xs { width: 13px; height: 13px; }
.icon-sm { width: 16px; height: 16px; }

@media (max-width: 600px) {
  .kpi-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
