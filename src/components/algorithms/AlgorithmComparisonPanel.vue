<template>
  <div class="comparison-panel card-elevated">
    <!-- Cabeçalho e Navegação entre Comparativo Geral e Relatórios Individuais -->
    <div class="comparison-header-bar">
      <div class="header-title-area">
        <div class="title-row">
          <GitCompare class="icon-sm text-blue" />
          <h3 class="comparison-heading">COMPARATIVO & DIFERENÇAS ENTRE OS ALGORITMOS</h3>
          <span class="badge badge-blue font-mono">
            {{ validRuns.length }} {{ validRuns.length === 1 ? 'executado' : 'comparados' }}
          </span>
        </div>
        <p class="comparison-subtitle">
          Análise lado a lado das decisões, rotas, custos, estruturas internas e divergências nas arestas do grafo atual
        </p>
      </div>

      <!-- Abas: Visão Comparativa vs Detalhes Individuais de cada Algoritmo -->
      <div class="section-tabs" v-if="validRuns.length > 0">
        <button
          type="button"
          class="section-tab-btn"
          :class="{ active: activeTab === 'COMPARE' }"
          @click="activeTab = 'COMPARE'"
        >
          <GitCompare class="icon-xs" />
          <span>Diferenças & Matriz</span>
        </button>

        <button
          v-for="run in validRuns"
          :key="run.key"
          type="button"
          class="section-tab-btn"
          :class="{ active: activeTab === run.key }"
          @click="activeTab = run.key"
        >
          <span class="tab-dot" :style="{ background: getAlgoAccent(run.key) }"></span>
          <span>Relatório {{ getAlgoName(run.key) }}</span>
        </button>
      </div>
    </div>

    <!-- Estado Vazio Antes da Execução -->
    <div v-if="validRuns.length === 0" class="empty-comparison-state">
      <div class="empty-icon-circle">
        <GitCompare class="empty-icon text-muted" />
      </div>
      <h4 class="empty-title">Pronto para Comparação Simultânea</h4>
      <p class="empty-desc">
        Clique em <strong>Executar {{ selectedAlgorithms.length }} Simultâneos</strong> ou <strong>Resultado Imediato</strong> acima para rodar os modelos 3D lado a lado e descobrir automaticamente onde e por que cada algoritmo diverge neste grafo.
      </p>
    </div>

    <!-- ABA 1: VISÃO COMPARATIVA COMPLETA & DIFERENÇAS -->
    <div v-else-if="activeTab === 'COMPARE'" class="comparison-body">
      <!-- 1. Cards Inteligentes de Diferenças Detectadas no Grafo Atual -->
      <div v-if="differenceInsights.length > 0" class="insights-grid">
        <div
          v-for="(insight, idx) in differenceInsights"
          :key="idx"
          class="insight-card"
          :class="`tone-${insight.tone}`"
        >
          <div class="insight-top">
            <span class="insight-tag">{{ insight.tag }}</span>
            <span class="insight-badge font-mono">{{ insight.badge }}</span>
          </div>
          <h4 class="insight-title">{{ insight.title }}</h4>
          <p class="insight-text">{{ insight.description }}</p>
        </div>
      </div>

      <!-- 2. Tabela Comparativa Lado a Lado de Comportamento & Resultados -->
      <div class="comparison-section-block">
        <div class="block-header">
          <h4 class="block-title">Resumo Técnico Lado a Lado</h4>
          <span class="block-hint">Métricas extraídas diretamente da topologia "{{ graph.name }}"</span>
        </div>

        <div class="table-container">
          <table class="custom-table comparison-table">
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>Estrutura & Estratégia</th>
                <th>Passos</th>
                <th>Alcance</th>
                <th>Arestas na Árvore / AGM</th>
                <th v-if="targetVertexId">Rota ({{ startVertexId }} &rarr; {{ targetVertexId }})</th>
                <th>Ordem de Processamento</th>
                <th>Complexidade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row.key">
                <td>
                  <div class="algo-cell">
                    <span class="algo-color-bar" :style="{ background: row.accent }"></span>
                    <div>
                      <div class="font-bold text-primary">{{ row.name }}</div>
                      <div class="cell-sub">{{ row.category }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="font-mono text-xs font-bold">{{ row.structure }}</div>
                  <div class="cell-sub">{{ row.strategy }}</div>
                </td>
                <td>
                  <div class="steps-cell font-mono">
                    <strong>{{ row.stepsCount }}</strong>
                    <div class="steps-mini-bar">
                      <div
                        class="steps-mini-fill"
                        :style="{ width: `${row.stepsRatio}%`, background: row.accent }"
                      ></div>
                    </div>
                  </div>
                </td>
                <td class="font-mono text-xs">
                  <div>{{ row.reachText }}</div>
                  <div class="cell-sub">{{ row.reachSub }}</div>
                </td>
                <td class="font-mono text-xs">
                  <div><strong>{{ row.treeEdgesCount }}</strong> arestas</div>
                  <div class="cell-sub" v-if="graph.weighted">Soma pesos: <strong>{{ row.treeTotalWeight }}</strong></div>
                </td>
                <td v-if="targetVertexId" class="font-mono text-xs">
                  <template v-if="row.key === 'KRUSKAL'">
                    <span class="text-muted">Global (sem origem/destino)</span>
                  </template>
                  <template v-else-if="row.targetPath">
                    <div class="route-flow">{{ row.targetPath.join(' ➔ ') }}</div>
                    <div class="route-metrics">
                      <span class="badge badge-blue">{{ row.targetHops }} {{ row.targetHops === 1 ? 'salto' : 'saltos' }}</span>
                      <span v-if="graph.weighted" class="badge badge-green">custo {{ row.targetWeight }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="badge badge-red">Inalcançável</span>
                  </template>
                </td>
                <td>
                  <div class="order-sequence font-mono">
                    <span
                      v-for="(item, i) in row.sequencePreview"
                      :key="`${row.key}-seq-${i}`"
                      class="seq-mini-chip"
                    >
                      {{ item }}
                    </span>
                    <span v-if="row.sequenceOverflow > 0" class="seq-more font-mono">
                      +{{ row.sequenceOverflow }}
                    </span>
                  </div>
                </td>
                <td class="font-mono text-xs text-secondary">
                  {{ row.complexityTime }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Matriz Interativa de Decisão por Aresta (Conectada à Seleção Neutra nos Modelos 3D!) -->
      <div class="comparison-section-block" v-if="graph.edges.length > 0">
        <div class="block-header">
          <div>
            <h4 class="block-title">Matriz de Decisão por Aresta & Divergências</h4>
            <span class="block-hint">
              Clique em qualquer aresta para destacá-la nos modelos 3D com anéis geométricos <strong>[ ]</strong> sem alterar sua cor
            </span>
          </div>

          <div class="filter-pills">
            <button
              type="button"
              class="filter-pill-btn"
              :class="{ active: !showOnlyDivergent }"
              @click="showOnlyDivergent = false"
            >
              Todas ({{ edgeDecisionRows.length }})
            </button>
            <button
              type="button"
              class="filter-pill-btn"
              :class="{ active: showOnlyDivergent }"
              @click="showOnlyDivergent = true"
            >
              Divergências ({{ divergentEdgesCount }})
            </button>
          </div>
        </div>

        <div v-if="filteredEdgeRows.length === 0" class="empty-divergence-box">
          Todas as arestas tiveram decisão equivalente entre os algoritmos selecionados neste grafo.
        </div>

        <div v-else class="table-container">
          <table class="custom-table edge-matrix-table">
            <thead>
              <tr>
                <th>Aresta</th>
                <th v-if="graph.weighted">Peso</th>
                <th v-for="run in validRuns" :key="`head-${run.key}`">
                  <span class="col-algo-head">
                    <span class="tab-dot" :style="{ background: getAlgoAccent(run.key) }"></span>
                    {{ getAlgoName(run.key) }}
                  </span>
                </th>
                <th>Consenso</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="edgeRow in filteredEdgeRows"
                :key="edgeRow.edge.id"
                class="clickable-edge-row"
                :class="{
                  'is-selected-row': selectedEdgeId === edgeRow.edge.id,
                  'is-divergent-row': edgeRow.isDivergent
                }"
                @click="toggleSelectEdge(edgeRow.edge.id)"
                title="Clique para selecionar/desmarcar esta aresta em todos os modelos 3D (sem alterar sua cor)"
              >
                <td class="font-mono font-bold">
                  <span class="edge-select-indicator font-mono">
                    {{ selectedEdgeId === edgeRow.edge.id ? '[●]' : '[ ]' }}
                  </span>
                  <span>
                    {{ edgeRow.edge.source }} {{ graph.directed ? '➔' : '↔' }} {{ edgeRow.edge.target }}
                  </span>
                </td>
                <td v-if="graph.weighted" class="font-mono font-bold">
                  {{ edgeRow.edge.weight }}
                </td>
                <td v-for="run in validRuns" :key="`${edgeRow.edge.id}-${run.key}`">
                  <span class="badge" :class="edgeRow.decisions[run.key].badgeClass">
                    {{ edgeRow.decisions[run.key].label }}
                  </span>
                </td>
                <td>
                  <span v-if="edgeRow.isDivergent" class="badge badge-amber">
                    Divergente
                  </span>
                  <span v-else class="badge badge-muted">
                    Consenso
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ABAS INDIVIDUAIS: RELATÓRIO TÉCNICO COMPLETO DE UM ALGORITMO ESPECÍFICO -->
    <div v-else class="individual-report-wrapper">
      <AlgorithmResultTable
        :customResult="getAlgoRun(activeTab)?.result"
        :embedded="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { GitCompare } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'
import AlgorithmResultTable from './AlgorithmResultTable.vue'

const { graph, selectedEdgeId, selectEdge } = useGraph()
const {
  algorithmsCatalog,
  selectedAlgorithms,
  startVertexId,
  targetVertexId,
  getAlgoRun
} = useAlgorithmRunner()

const activeTab = ref('COMPARE')
const showOnlyDivergent = ref(false)

const validRuns = computed(() => {
  return selectedAlgorithms.value
    .map(key => getAlgoRun(key))
    .filter(r => r && r.result)
})

watch(validRuns, (list) => {
  if (activeTab.value !== 'COMPARE' && !list.some(r => r.key === activeTab.value)) {
    activeTab.value = 'COMPARE'
  }
})

function getAlgoMeta(key) {
  return algorithmsCatalog.find(a => a.key === key) || algorithmsCatalog[0]
}

function getAlgoName(key) {
  return getAlgoMeta(key).name
}

function getAlgoAccent(key) {
  return getAlgoMeta(key).accent
}

function toggleSelectEdge(edgeId) {
  selectEdge(selectedEdgeId.value === edgeId ? null : edgeId)
}

function matchesEdgePair(edge, u, v, directed) {
  if (directed) {
    return edge.source === u && edge.target === v
  }
  return (
    (edge.source === u && edge.target === v) ||
    (edge.source === v && edge.target === u)
  )
}

function getWeightBetween(u, v) {
  const match = graph.value.edges.find(e => matchesEdgePair(e, u, v, graph.value.directed))
  return match ? Number(match.weight ?? 1) : 1
}

function computePathWeight(pathArr) {
  if (!pathArr || pathArr.length === 0) return null
  if (pathArr.length === 1) return 0
  let sum = 0
  for (let i = 0; i < pathArr.length - 1; i++) {
    sum += getWeightBetween(pathArr[i], pathArr[i + 1])
  }
  return Number(sum.toFixed(2))
}

function reconstructDFSTreePath(dfsResult, origin, dest) {
  if (!dfsResult || !origin || !dest) return null
  if (origin === dest) return [origin]
  const parentMap = {}
  for (const e of dfsResult.treeEdges || []) {
    parentMap[e.target] = e.source
  }
  if (!parentMap[dest]) return null
  const path = []
  const seen = new Set()
  let curr = dest
  while (curr) {
    if (seen.has(curr)) return null
    seen.add(curr)
    path.unshift(curr)
    if (curr === origin) return path
    curr = parentMap[curr]
  }
  return null
}

function getStrategyText(key) {
  switch (key) {
    case 'DFS': return 'Mergulho profundo até folha + backtrack'
    case 'BFS': return 'Expansão em ondas por distância em arestas'
    case 'DIJKSTRA': return 'Relaxamento guloso pelo menor peso acumulado'
    case 'KRUSKAL': return 'Ordenação global de arestas sem formar ciclos'
    default: return ''
  }
}

const comparisonRows = computed(() => {
  const maxEvents = Math.max(1, ...validRuns.value.map(r => r.events.length))
  const totalV = graph.value.vertices.length

  return validRuns.value.map(run => {
    const meta = getAlgoMeta(run.key)
    const res = run.result
    const stepsCount = run.events.length
    const stepsRatio = Math.round((stepsCount / maxEvents) * 100)

    let reachText = ''
    let reachSub = ''
    let treeEdgesCount = 0
    let treeTotalWeight = 0
    let targetPath = null
    let targetHops = null
    let targetWeight = null
    let sequenceFull = []

    if (run.key === 'DFS') {
      reachText = `${res.visitedCount} / ${totalV} nós`
      reachSub = res.isCompleteTraversal ? 'Travessia total' : `${res.unreachableVertices.length} inalcançáveis`
      treeEdgesCount = res.treeEdges.length
      treeTotalWeight = Number(res.treeEdges.reduce((acc, e) => acc + Number(e.weight ?? 1), 0).toFixed(2))
      if (targetVertexId.value) {
        targetPath = reconstructDFSTreePath(res, startVertexId.value, targetVertexId.value)
        if (targetPath) {
          targetHops = targetPath.length - 1
          targetWeight = computePathWeight(targetPath)
        }
      }
      sequenceFull = res.visitedOrder || []
    } else if (run.key === 'BFS') {
      reachText = `${res.visitedCount} / ${totalV} nós`
      reachSub = targetVertexId.value && res.shortestPath ? 'Parou ao atingir destino' : 'Busca em níveis'
      treeEdgesCount = res.treeEdges.length
      treeTotalWeight = Number(res.treeEdges.reduce((acc, e) => acc + Number(e.weight ?? 1), 0).toFixed(2))
      if (targetVertexId.value && res.shortestPath) {
        targetPath = res.shortestPath
        targetHops = res.pathEdgeCount
        targetWeight = computePathWeight(res.shortestPath)
      }
      sequenceFull = res.visitedOrder || []
    } else if (run.key === 'DIJKSTRA') {
      reachText = `${res.settledOrder.length} / ${totalV} fixados`
      reachSub = targetVertexId.value && res.targetPath ? 'Ótimo garantido p/ destino' : 'SPT completa'
      const sptEdges = Object.entries(res.predecessors || {}).filter(([, pred]) => pred !== null)
      treeEdgesCount = sptEdges.length
      treeTotalWeight = Number(
        sptEdges.reduce((acc, [vId, predId]) => acc + getWeightBetween(predId, vId), 0).toFixed(2)
      )
      if (targetVertexId.value && res.targetPath) {
        targetPath = res.targetPath
        targetHops = res.targetPath.length - 1
        targetWeight = res.targetCost
      }
      sequenceFull = res.settledOrder || []
    } else if (run.key === 'KRUSKAL') {
      reachText = `${res.componentCount} ${res.componentCount === 1 ? 'componente' : 'componentes'}`
      reachSub = res.isSpanningTree ? 'AGM única global' : 'Floresta geradora mínima'
      treeEdgesCount = res.edgeCountInMST
      treeTotalWeight = res.totalCost
      sequenceFull = (res.mstEdges || []).map(e => `${e.source}-${e.target}`)
    }

    return {
      key: run.key,
      name: meta.name,
      category: meta.category,
      accent: meta.accent,
      structure: meta.structure,
      strategy: getStrategyText(run.key),
      stepsCount,
      stepsRatio,
      reachText,
      reachSub,
      treeEdgesCount,
      treeTotalWeight,
      targetPath,
      targetHops,
      targetWeight,
      sequenceFull,
      sequencePreview: sequenceFull.slice(0, 7),
      sequenceOverflow: Math.max(0, sequenceFull.length - 7),
      complexityTime: meta.complexityTime
    }
  })
})

// Síntese Automática das Principais Diferenças no Grafo Atual
const differenceInsights = computed(() => {
  const insights = []
  const rowsByKey = {}
  comparisonRows.value.forEach(r => { rowsByKey[r.key] = r })

  // 1. Comparação de Rota Origem -> Destino (BFS vs Dijkstra vs DFS)
  if (targetVertexId.value && startVertexId.value) {
    const bfsRow = rowsByKey.BFS
    const dijkRow = rowsByKey.DIJKSTRA
    const dfsRow = rowsByKey.DFS

    if (bfsRow?.targetPath && dijkRow?.targetPath) {
      const samePath = bfsRow.targetPath.join('->') === dijkRow.targetPath.join('->')
      if (!samePath) {
        const saved = Number((bfsRow.targetWeight - dijkRow.targetWeight).toFixed(2))
        insights.push({
          tone: 'blue',
          tag: 'Rota: Saltos vs Peso',
          badge: saved > 0 ? `Economia de ${saved}` : 'Rotas Distintas',
          title: 'BFS e Dijkstra escolheram caminhos diferentes!',
          description: `De "${startVertexId.value}" até "${targetVertexId.value}", o BFS minimizou saltos por [${bfsRow.targetPath.join(' ➔ ')}] (${bfsRow.targetHops} ${bfsRow.targetHops === 1 ? 'aresta' : 'arestas'}, custo real ${bfsRow.targetWeight}), enquanto o Dijkstra desviou por [${dijkRow.targetPath.join(' ➔ ')}] (${dijkRow.targetHops} arestas) para obter o menor peso acumulado (${dijkRow.targetWeight}).`
        })
      } else {
        insights.push({
          tone: 'green',
          tag: 'Rota: Convergência',
          badge: `${dijkRow.targetHops} saltos · custo ${dijkRow.targetWeight}`,
          title: 'BFS e Dijkstra convergiram na mesma rota ótima',
          description: `Para ir de "${startVertexId.value}" a "${targetVertexId.value}", o caminho de menor número de arestas [${bfsRow.targetPath.join(' ➔ ')}] também coincidiu com o menor custo ponderado total (${dijkRow.targetWeight}).`
        })
      }
    } else if (dfsRow?.targetPath && (bfsRow?.targetPath || dijkRow?.targetPath)) {
      const refRow = dijkRow?.targetPath ? dijkRow : bfsRow
      const sameAsDfs = dfsRow.targetPath.join('->') === refRow.targetPath.join('->')
      if (!sameAsDfs) {
        insights.push({
          tone: 'amber',
          tag: 'Profundidade vs Otimização',
          badge: `${dfsRow.targetHops} vs ${refRow.targetHops} saltos`,
          title: `DFS encontrou rota não-ótima em comparação ao ${refRow.name}`,
          description: `A árvore em profundidade do DFS chegou a "${targetVertexId.value}" via [${dfsRow.targetPath.join(' ➔ ')}] (${dfsRow.targetHops} saltos, peso ${dfsRow.targetWeight}), enquanto ${refRow.name} otimizou por [${refRow.targetPath.join(' ➔ ')}] (${refRow.targetHops} saltos, peso ${refRow.targetWeight}).`
        })
      }
    }
  }

  // 2. Comparação da Ordem de Visitação / Exploração (DFS vs BFS vs Dijkstra)
  const traversalRows = ['DFS', 'BFS', 'DIJKSTRA'].map(k => rowsByKey[k]).filter(Boolean)
  if (traversalRows.length >= 2) {
    const maxLen = Math.max(...traversalRows.map(r => r.sequenceFull.length))
    let divergeIdx = -1
    for (let i = 0; i < maxLen; i++) {
      const setAtI = new Set(traversalRows.map(r => r.sequenceFull[i] || '—'))
      if (setAtI.size > 1) {
        divergeIdx = i
        break
      }
    }

    if (divergeIdx >= 0) {
      const choices = traversalRows
        .map(r => `${r.name} escolheu "${r.sequenceFull[divergeIdx] || 'fim'}"`)
        .join(', ')
      insights.push({
        tone: 'purple',
        tag: 'Ordem de Visitação',
        badge: `Diverge no #${divergeIdx + 1}`,
        title: `Ordem de exploração divergiu na ${divergeIdx + 1}ª visita`,
        description: `A partir de "${startVertexId.value}", ${choices}. Isso reflete a diferença direta entre Pilha LIFO (mergulho profundo), Fila FIFO (camadas vizinhas) e Min-Heap (menor custo acumulado).`
      })
    } else {
      insights.push({
        tone: 'green',
        tag: 'Ordem de Visitação',
        badge: 'Sequência Idêntica',
        title: 'Mesma sequência de visitação de vértices',
        description: `Nesta configuração e origem "${startVertexId.value}", ${traversalRows.map(r => r.name).join(' e ')} visitaram os nós exatamente na mesma ordem: [${traversalRows[0].sequenceFull.join(' ➔ ')}].`
      })
    }
  }

  // 3. Comparação Kruskal (AGM Global) vs Árvores enraizadas na Origem
  const kruskalRow = rowsByKey.KRUSKAL
  const rootedRows = ['DFS', 'BFS', 'DIJKSTRA'].map(k => rowsByKey[k]).filter(Boolean)
  if (kruskalRow && rootedRows.length > 0) {
    const treeSummaries = rootedRows
      .map(r => `${r.name}: peso ${r.treeTotalWeight} (${r.treeEdgesCount} arestas)`)
      .join(' · ')
    insights.push({
      tone: 'emerald',
      tag: 'Ótimo Global vs Origem',
      badge: `AGM Kruskal = ${kruskalRow.treeTotalWeight}`,
      title: 'Árvore Geradora Mínima (Kruskal) vs Árvores de Busca',
      description: `Kruskal seleciona arestas globalmente pelo menor peso sem depender de um nó inicial, conectando a rede com custo total ${kruskalRow.treeTotalWeight} (${kruskalRow.treeEdgesCount} arestas). Já as árvores enraizadas em "${startVertexId.value}" obtiveram: ${treeSummaries}.`
    })
  }

  return insights
})

function classifyEdgeForRun(edge, run) {
  const res = run.result
  const directed = graph.value.directed

  if (run.key === 'BFS' && res.shortestPath && res.shortestPath.length > 1) {
    for (let i = 0; i < res.shortestPath.length - 1; i++) {
      if (matchesEdgePair(edge, res.shortestPath[i], res.shortestPath[i + 1], directed)) {
        return { code: 'path', used: true, label: '★ Menor Caminho', badgeClass: 'badge-cyan' }
      }
    }
  }

  if (run.key === 'DIJKSTRA' && res.targetPath && res.targetPath.length > 1) {
    for (let i = 0; i < res.targetPath.length - 1; i++) {
      if (matchesEdgePair(edge, res.targetPath[i], res.targetPath[i + 1], directed)) {
        return { code: 'path', used: true, label: '★ Menor Caminho', badgeClass: 'badge-cyan' }
      }
    }
  }

  if (run.key === 'DFS' || run.key === 'BFS') {
    const inTree = (res.treeEdges || []).some(
      te => te.edgeId === edge.id || matchesEdgePair(edge, te.source, te.target, directed)
    )
    if (inTree) {
      return { code: 'tree', used: true, label: '✓ Na Árvore', badgeClass: 'badge-green' }
    }
  }

  if (run.key === 'DIJKSTRA') {
    const inSpt = Object.entries(res.predecessors || {}).some(
      ([vId, predId]) => predId !== null && matchesEdgePair(edge, predId, vId, directed)
    )
    if (inSpt) {
      return { code: 'tree', used: true, label: '✓ Árvore SPT', badgeClass: 'badge-green' }
    }
  }

  if (run.key === 'KRUSKAL') {
    const inMst = (res.mstEdges || []).some(
      me => me.id === edge.id || matchesEdgePair(edge, me.source, me.target, false)
    )
    if (inMst) {
      return { code: 'tree', used: true, label: '✓ Aceita AGM', badgeClass: 'badge-green' }
    }
    const isRej = (res.rejectedEdges || []).some(
      re => re.id === edge.id || matchesEdgePair(edge, re.source, re.target, false)
    )
    if (isRej) {
      return { code: 'cycle', used: false, label: '✕ Ciclo Rejeitado', badgeClass: 'badge-red' }
    }
  }

  return { code: 'unused', used: false, label: '— Não Usada', badgeClass: 'badge-muted' }
}

const edgeDecisionRows = computed(() => {
  if (validRuns.value.length === 0) return []
  return graph.value.edges.map(edge => {
    const decisions = {}
    const usageSet = new Set()
    for (const run of validRuns.value) {
      const dec = classifyEdgeForRun(edge, run)
      decisions[run.key] = dec
      usageSet.add(dec.used ? 'USED' : 'UNUSED')
    }
    return {
      edge,
      decisions,
      isDivergent: usageSet.size > 1
    }
  })
})

const divergentEdgesCount = computed(() => {
  return edgeDecisionRows.value.filter(r => r.isDivergent).length
})

const filteredEdgeRows = computed(() => {
  if (!showOnlyDivergent.value) return edgeDecisionRows.value
  return edgeDecisionRows.value.filter(r => r.isDivergent)
})
</script>

<style scoped>
.comparison-panel {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.comparison-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-3);
  flex-wrap: wrap;
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.comparison-heading {
  font-size: var(--text-sm);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.comparison-subtitle {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

/* Abas Superiores */
.section-tabs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.section-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.38rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  transition: all var(--transition-fast);
}

.section-tab-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-light);
}

.section-tab-btn.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

/* Estado Vazio */
.empty-comparison-state {
  padding: var(--spacing-6) var(--spacing-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-2);
}

.empty-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 22px;
  height: 22px;
}

.empty-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.empty-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  max-width: 540px;
  line-height: 1.5;
}

.comparison-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Cards de Diferenças Detectadas */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: var(--spacing-3);
}

.insight-card {
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-left: 3.5px solid var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.insight-card.tone-blue { border-left-color: #0ea5e9; }
.insight-card.tone-purple { border-left-color: #8b5cf6; }
.insight-card.tone-emerald,
.insight-card.tone-green { border-left-color: #10b981; }
.insight-card.tone-amber { border-left-color: #f59e0b; }

.insight-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.insight-tag {
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.insight-badge {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.insight-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}

.insight-text {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

/* Blocos de Tabela */
.comparison-section-block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.block-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.block-hint {
  font-size: 0.71rem;
  color: var(--text-secondary);
}

.algo-cell {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.algo-color-bar {
  width: 4px;
  height: 28px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.cell-sub {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.text-xs {
  font-size: 0.75rem;
}

.steps-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 64px;
}

.steps-mini-bar {
  height: 5px;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.steps-mini-fill {
  height: 100%;
  border-radius: var(--radius-full);
}

.route-flow {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.route-metrics {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.order-sequence {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.seq-mini-chip {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.38rem;
  border-radius: 4px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.seq-more {
  font-size: 0.66rem;
  color: var(--text-muted);
}

/* Matriz de Arestas */
.filter-pills {
  display: flex;
  gap: 0.3rem;
}

.filter-pill-btn {
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
}

.filter-pill-btn.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.col-algo-head {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.clickable-edge-row {
  cursor: pointer;
}

.clickable-edge-row.is-divergent-row td:first-child {
  border-left: 3px solid var(--color-warning);
}

.clickable-edge-row.is-selected-row td {
  background: var(--bg-subtle) !important;
  outline: none;
}

.edge-select-indicator {
  color: var(--text-muted);
  margin-right: 0.4rem;
  font-size: 0.72rem;
}

.is-selected-row .edge-select-indicator {
  color: var(--text-primary);
  font-weight: 800;
}

.badge-cyan {
  background: var(--color-path-bg);
  color: var(--color-path);
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.badge-muted {
  background: var(--bg-subtle);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.empty-divergence-box {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  text-align: center;
}

.individual-report-wrapper {
  padding-top: var(--spacing-1);
}

.icon-xs { width: 13px; height: 13px; }
.icon-sm { width: 16px; height: 16px; }
</style>

