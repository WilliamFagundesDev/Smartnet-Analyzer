<template>
  <div class="algorithm-results-container glass-panel">
    <div class="results-header">
      <div class="header-info">
        <h3 class="results-title">RELATÓRIO & RESULTADOS</h3>
        <p class="results-subtitle" v-if="result">
          Algoritmo: <strong class="text-blue">{{ result.algorithm }}</strong> &middot; Complexidade:
          <span class="font-mono font-bold">{{ result.complexity.time }}</span>
        </p>
      </div>

      <div class="header-actions" v-if="result">
        <button class="btn btn-secondary btn-sm" @click="copyTextResults" title="Copiar relatório completo em texto">
          <Copy class="icon-xs" />
          <span>Copiar</span>
        </button>
        <button class="btn btn-ghost btn-sm" @click="clearResult" title="Limpar resultados da tela">
          <Trash2 class="icon-xs" />
          <span>Limpar</span>
        </button>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-if="!result" class="empty-state">
      <Binary class="empty-icon text-muted" />
      <h4 class="empty-title">Nenhum resultado para exibir</h4>
      <p class="empty-desc">
        Selecione um algoritmo acima e clique em "Executar e Ver Resultado" ou "Ver Passo a Passo".
      </p>
    </div>

    <!-- Resultados DFS -->
    <div v-else-if="result.algorithm === 'DFS'" class="result-details">
      <div class="summary-cards-grid">
        <div class="summary-card">
          <span class="card-label">Origem:</span>
          <span class="card-val font-mono text-blue">{{ result.startVertexId }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Visitados:</span>
          <span class="card-val font-mono">{{ result.visitedCount }} / {{ result.totalVertices }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Arestas da Árvore:</span>
          <span class="card-val font-mono text-green">{{ result.treeEdgeCount }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Conectividade:</span>
          <span class="badge" :class="result.isCompleteTraversal ? 'badge-green' : 'badge-amber'">
            {{ result.isCompleteTraversal ? 'Totalmente Conexo' : 'Grafo Desconexo' }}
          </span>
        </div>
      </div>

      <div class="section-box">
        <h4 class="section-heading">ORDEM DE VISITAÇÃO:</h4>
        <div class="sequence-chips">
          <span
            v-for="(vId, idx) in result.visitedOrder"
            :key="vId"
            class="chip-node font-mono"
          >
            <span class="chip-idx">#{{ idx + 1 }}</span>
            <span class="chip-id">{{ vId }}</span>
          </span>
        </div>
      </div>

      <div class="section-box">
        <h4 class="section-heading">ARESTAS DA ÁRVORE DFS ({{ result.treeEdges.length }}):</h4>
        <div v-if="result.treeEdges.length === 0" class="subtext">
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
              <tr v-for="e in result.treeEdges" :key="e.edgeId || `${e.source}-${e.target}`">
                <td class="font-mono text-blue">{{ e.source }}</td>
                <td class="font-mono text-blue">{{ e.target }}</td>
                <td class="font-mono font-bold">{{ e.weight }}</td>
                <td class="font-mono text-muted">{{ e.edgeId || 'e-dfs' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="result.unreachableVertices.length > 0" class="warning-box">
        <AlertTriangle class="icon-sm text-amber" />
        <div>
          <strong>Vértices Inalcançáveis a partir de "{{ result.startVertexId }}":</strong>
          <span class="font-mono ml-2">{{ result.unreachableVertices.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Resultados BFS -->
    <div v-else-if="result.algorithm === 'BFS'" class="result-details">
      <div class="summary-cards-grid">
        <div class="summary-card">
          <span class="card-label">Raiz da Busca:</span>
          <span class="card-val font-mono text-blue">{{ result.startVertexId }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Vértices Alcançados:</span>
          <span class="card-val font-mono">{{ result.visitedCount }} / {{ result.totalVertices }}</span>
        </div>
        <div class="summary-card" v-if="result.targetVertexId">
          <span class="card-label">Destino Solicitado:</span>
          <span class="card-val font-mono text-red">{{ result.targetVertexId }}</span>
        </div>
        <div class="summary-card" v-if="result.shortestPath">
          <span class="card-label">Menor Salto em Arestas:</span>
          <span class="card-val font-mono text-green">{{ result.pathEdgeCount }} saltos</span>
        </div>
      </div>

      <div v-if="result.shortestPath" class="path-highlight-card">
        <div class="path-label">CAMINHO MÍNIMO EM NÚMERO DE ARESTAS:</div>
        <div class="path-sequence font-mono">
          {{ result.shortestPath.join(' ➔ ') }}
        </div>
      </div>

      <div class="section-box">
        <h4 class="section-heading">TABELA DE DISTÂNCIAS EM NÍVEIS (HOPS) E PREDECESSORES:</h4>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Vértice</th>
                <th>Distância (Arestas)</th>
                <th>Precessor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in graph.vertices" :key="v.id">
                <td class="font-mono text-blue"><strong>{{ v.id }}</strong> ({{ v.label }})</td>
                <td class="font-mono">
                  {{ result.distances[v.id] === Infinity ? '∞' : result.distances[v.id] }}
                </td>
                <td class="font-mono">{{ result.predecessors[v.id] || 'Nenhum' }}</td>
                <td>
                  <span
                    class="badge"
                    :class="result.distances[v.id] !== Infinity ? 'badge-green' : 'badge-red'"
                  >
                    {{ result.distances[v.id] !== Infinity ? 'Alcançado' : 'Inalcançável' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Resultados Dijkstra -->
    <div v-else-if="result.algorithm === 'Dijkstra'" class="result-details">
      <div class="summary-cards-grid">
        <div class="summary-card">
          <span class="card-label">Vértice de Origem:</span>
          <span class="card-val font-mono text-blue">{{ result.startVertexId }}</span>
        </div>
        <div class="summary-card" v-if="result.targetVertexId">
          <span class="card-label">Destino:</span>
          <span class="card-val font-mono text-red">{{ result.targetVertexId }}</span>
        </div>
        <div class="summary-card" v-if="result.targetCost !== null">
          <span class="card-label">Custo Mínimo Total:</span>
          <span class="card-val font-mono text-green">{{ result.targetCost }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Vértices Fixados:</span>
          <span class="card-val font-mono">{{ result.settledOrder.length }}</span>
        </div>
      </div>

      <div v-if="result.targetPath" class="path-highlight-card">
        <div class="path-label">CAMINHO ÓTIMO DE MENOR CUSTO PONDERADO (DIJKSTRA):</div>
        <div class="path-sequence font-mono">
          {{ result.targetPath.join(' ➔ ') }}
        </div>
        <div class="path-cost">
          Custo acumulado total: <strong>{{ result.targetCost }}</strong>
        </div>
      </div>

      <div class="section-box">
        <h4 class="section-heading">TABELA COMPLETA DE DESTINOS, CUSTOS E CAMINHOS:</h4>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Destino</th>
                <th>Distância / Custo Ótimo</th>
                <th>Predecessor</th>
                <th>Caminho Reconstruído</th>
                <th>Conexão</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in result.distancesTable" :key="row.vertexId">
                <td class="font-mono text-blue"><strong>{{ row.vertexId }}</strong> ({{ row.label }})</td>
                <td class="font-mono font-bold">
                  {{ row.isReachable ? row.distance : '∞ (Inalcançável)' }}
                </td>
                <td class="font-mono">{{ row.predecessor || 'Nenhum' }}</td>
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
    </div>

    <!-- Resultados Kruskal -->
    <div v-else-if="result.algorithm === 'Kruskal'" class="result-details">
      <div class="summary-cards-grid">
        <div class="summary-card">
          <span class="card-label">Arestas Selecionadas na AGM:</span>
          <span class="card-val font-mono text-green">
            {{ result.edgeCountInMST }}
            <span class="sub-label">de {{ result.expectedEdgesForSingleTree }} esperadas</span>
          </span>
        </div>
        <div class="summary-card">
          <span class="card-label">Custo Total da Árvore / Floresta:</span>
          <span class="card-val font-mono text-blue">{{ result.totalCost }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Componentes Resultantes:</span>
          <span class="card-val font-mono">{{ result.componentCount }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Classificação Topológica:</span>
          <span class="badge" :class="result.isSpanningTree ? 'badge-green' : 'badge-amber'">
            {{ result.isSpanningTree ? 'Árvore Geradora Mínima Única' : 'Floresta Geradora Mínima' }}
          </span>
        </div>
      </div>

      <div class="section-box">
        <h4 class="section-heading">ARESTAS ACEITAS NA ÁRVORE GERADORA MÍNIMA ({{ result.mstEdges.length }}):</h4>
        <div v-if="result.mstEdges.length === 0" class="subtext">
          Nenhuma aresta foi aceita (grafo com 0 ou 1 vértice).
        </div>
        <div v-else class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Vértice U</th>
                <th>Vértice V</th>
                <th>Peso da Conexão</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in result.mstEdges" :key="e.id">
                <td class="font-mono text-blue">{{ e.source }}</td>
                <td class="font-mono text-blue">{{ e.target }}</td>
                <td class="font-mono font-bold">{{ e.weight }}</td>
                <td>
                  <span class="badge badge-green">Conecta Componentes</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-box" v-if="result.rejectedEdges.length > 0">
        <h4 class="section-heading">ARESTAS REJEITADAS POR FORMAÇÃO DE CICLOS ({{ result.rejectedEdges.length }}):</h4>
        <div class="table-container">
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
              <tr v-for="e in result.rejectedEdges" :key="e.id">
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Binary, Copy, Trash2, AlertTriangle } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'

const { graph } = useGraph()
const { result, clearResult } = useAlgorithmRunner()
const copied = ref(false)

function copyTextResults() {
  if (!result.value) return
  let text = `SMARTNET ANALYZER - RELATÓRIO DO ALGORITMO: ${result.value.algorithm}\n`
  text += `Data: ${new Date().toLocaleString()}\n`
  text += `Complexidade: ${result.value.complexity.time} (Espaço: ${result.value.complexity.space})\n\n`

  if (result.value.algorithm === 'DFS') {
    text += `Raiz: ${result.value.startVertexId}\n`
    text += `Ordem de Visitação: ${result.value.visitedOrder.join(' -> ')}\n`
    text += `Arestas de Árvore: ${result.value.treeEdges.map(e => `(${e.source}, ${e.target})`).join(', ')}\n`
    if (result.value.unreachableVertices.length > 0) {
      text += `Vértices Inalcançáveis: ${result.value.unreachableVertices.join(', ')}\n`
    }
  } else if (result.value.algorithm === 'BFS') {
    text += `Raiz: ${result.value.startVertexId}\n`
    text += `Ordem de Visitação: ${result.value.visitedOrder.join(' -> ')}\n`
    if (result.value.shortestPath) {
      text += `Caminho Mínimo em Arestas: ${result.value.shortestPath.join(' -> ')} (${result.value.pathEdgeCount} saltos)\n`
    }
  } else if (result.value.algorithm === 'Dijkstra') {
    text += `Origem: ${result.value.startVertexId}\n`
    if (result.value.targetPath) {
      text += `Caminho Ótimo para ${result.value.targetVertexId}: ${result.value.targetPath.join(' -> ')} (Custo: ${result.value.targetCost})\n`
    }
    text += `Tabela de Distâncias:\n`
    result.value.distancesTable.forEach(row => {
      text += ` - ${row.vertexId}: Custo ${row.distance ?? '∞'} | Caminho: ${row.pathString}\n`
    })
  } else if (result.value.algorithm === 'Kruskal') {
    text += `Custo Total da AGM: ${result.value.totalCost}\n`
    text += `Classificação: ${result.value.isSpanningTree ? 'Árvore Única' : 'Floresta'}\n`
    text += `Arestas Aceitas:\n`
    result.value.mstEdges.forEach(e => {
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
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-3);
}

.results-title {
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.results-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-2);
}

.empty-state {
  padding: var(--spacing-10) var(--spacing-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.empty-icon {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}

.empty-title {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.empty-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  max-width: 480px;
  line-height: 1.6;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-3);
}

.summary-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.card-val {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
}

.sub-label {
  font-size: 0.7rem;
  font-weight: 400;
  color: var(--text-muted);
}

.section-box {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.section-heading {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.sequence-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.chip-node {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-xs);
}

.chip-idx {
  color: var(--text-muted);
  font-size: 0.68rem;
}

.chip-id {
  color: var(--color-primary);
  font-weight: 700;
}

.path-highlight-card {
  background: var(--color-path-bg);
  border: 1px solid var(--color-path);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
}

.path-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-path);
  letter-spacing: 0.04em;
  margin-bottom: 0.2rem;
}

.path-sequence {
  font-size: var(--text-base);
  font-weight: 700;
  color: #ffffff;
}

.path-cost {
  margin-top: var(--spacing-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.warning-box {
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.subtext {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-style: italic;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.text-blue {
  color: var(--color-primary);
}

.text-green {
  color: var(--color-success);
}

.text-red {
  color: var(--color-danger);
}

.text-amber {
  color: var(--color-warning);
}

.ml-2 {
  margin-left: 0.5rem;
}
</style>
