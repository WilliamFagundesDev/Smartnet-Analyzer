import { ref, computed, watch } from 'vue'
import confetti from 'canvas-confetti'
import { useGraph } from './useGraph.js'
import { runDFS } from '../algorithms/dfs.js'
import { runBFS } from '../algorithms/bfs.js'
import { runDijkstra } from '../algorithms/dijkstra.js'
import { runKruskal } from '../algorithms/kruskal.js'
import { validateDijkstra, validateKruskal } from '../graph/graphValidation.js'

export const ALGORITHMS_CATALOG = [
  {
    key: 'DFS',
    name: 'DFS',
    fullName: 'Busca em Profundidade (DFS)',
    category: 'Profundidade',
    objective: 'Exploração exaustiva e conectividade',
    structure: 'Pilha LIFO',
    complexityTime: 'O(V + E)',
    complexitySpace: 'O(V)',
    accent: '#4f63f6'
  },
  {
    key: 'BFS',
    name: 'BFS',
    fullName: 'Busca em Largura (BFS)',
    category: 'Largura',
    objective: 'Menor número de saltos em arestas',
    structure: 'Fila FIFO',
    complexityTime: 'O(V + E)',
    complexitySpace: 'O(V)',
    accent: '#0ea5e9'
  },
  {
    key: 'DIJKSTRA',
    name: 'Dijkstra',
    fullName: 'Caminho Mínimo de Dijkstra',
    category: 'Menor Custo',
    objective: 'Caminho ótimo ponderado (Min-Heap)',
    structure: 'Min-Heap Binário',
    complexityTime: 'O((V + E) log V)',
    complexitySpace: 'O(V)',
    accent: '#8b5cf6'
  },
  {
    key: 'KRUSKAL',
    name: 'Kruskal',
    fullName: 'Árvore Geradora Mínima (Kruskal)',
    category: 'Árvore Mínima',
    objective: 'Árvore Geradora Mínima global (DSU)',
    structure: 'Union-Find (DSU)',
    complexityTime: 'O(E log E)',
    complexitySpace: 'O(V + E)',
    accent: '#10b981'
  }
]

const CANONICAL_ORDER = ['DFS', 'BFS', 'DIJKSTRA', 'KRUSKAL']

// Estado Reativo Compartilhado (Singleton Composable)
const selectedAlgorithms = ref(['DFS'])
const startVertexId = ref('')
const targetVertexId = ref('')
const exploreAllComponents = ref(false)

// Mapa de execuções simultâneas: { [algoKey]: { key, result, error, events } }
const runs = ref({})
const error = ref(null)
const isRunning = ref(false)

// Estado da Reprodução Didática Passo a Passo Sincronizada
const currentStepIndex = ref(-1)
const isPlaying = ref(false)
const playbackSpeed = ref(600) // ms por passo
let timerId = null
let watcherInitialized = false

function setEdgeHighlight(edgeStatus, graphObj, u, v, explicitId, status) {
  if (explicitId) {
    edgeStatus[explicitId] = status
  }
  if (!u || !v || !graphObj) return

  if (graphObj.directed) {
    const match = graphObj.edges.find(e => e.source === u && e.target === v)
    if (match) edgeStatus[match.id] = status
    edgeStatus[`${u}->${v}`] = status
  } else {
    const match = graphObj.edges.find(
      e => (e.source === u && e.target === v) || (e.source === v && e.target === u)
    )
    if (match) edgeStatus[match.id] = status
    edgeStatus[`${u}->${v}`] = status
    edgeStatus[`${v}->${u}`] = status
  }
}

export function computeHighlightsForAlgorithm(
  algoKey,
  graphObj,
  runObj,
  globalStepIndex,
  originId,
  destId
) {
  const vertexStatus = {}
  const edgeStatus = {}

  if (!graphObj) return { vertexStatus, edgeStatus }

  // Kruskal é global e não depende de origem ou destino
  if (algoKey !== 'KRUSKAL') {
    if (originId && graphObj.hasVertex(originId)) {
      vertexStatus[originId] = 'source'
    }
    if ((algoKey === 'BFS' || algoKey === 'DIJKSTRA') && destId && destId !== originId && graphObj.hasVertex(destId)) {
      vertexStatus[destId] = 'target'
    }
  }

  if (!runObj || !runObj.result) {
    return { vertexStatus, edgeStatus }
  }

  const algoEvents = runObj.events || []
  const hasStep = globalStepIndex >= 0 && algoEvents.length > 0
  const effIdx = hasStep ? Math.min(globalStepIndex, algoEvents.length - 1) : -1
  const ev = effIdx >= 0 ? algoEvents[effIdx] : null

  if (ev) {
    const isAtFinalOrTarget =
      effIdx >= algoEvents.length - 1 ||
      ev.type === 'COMPLETE' ||
      ev.type === 'TARGET_REACHED' ||
      ev.type === 'DESTINATION_REACHED'

    // 1. Vértices Visitados
    if (ev.visited) {
      ev.visited.forEach(vId => {
        vertexStatus[vId] = 'visited'
      })
    }

    // 2. Vértices na Fila FIFO ou Min-Heap
    if (ev.queue) {
      ev.queue.forEach(vId => {
        if (vertexStatus[vId] !== 'visited') {
          vertexStatus[vId] = 'queued'
        }
      })
    }
    if (ev.pqState) {
      ev.pqState.forEach(item => {
        if (!ev.settled || !ev.settled.includes(item.vertex)) {
          vertexStatus[item.vertex] = 'queued'
        }
      })
    }

    // 3. Vértices Fixados (Dijkstra)
    if (ev.settled) {
      ev.settled.forEach(vId => {
        vertexStatus[vId] = 'settled'
      })
    }

    // 4. Arestas de Árvore (DFS), Predecessores (BFS/Dijkstra) ou Aceitas na AGM (Kruskal)
    if (ev.treeEdges) {
      ev.treeEdges.forEach(e => {
        setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.edgeId || e.id, 'tree')
      })
    }
    if (ev.predecessors) {
      Object.entries(ev.predecessors).forEach(([vId, predId]) => {
        if (predId !== null && predId !== undefined) {
          setEdgeHighlight(edgeStatus, graphObj, predId, vId, null, 'tree')
        }
      })
    }
    if (ev.acceptedEdges) {
      ev.acceptedEdges.forEach(e => {
        setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.id || e.edgeId, 'tree')
        vertexStatus[e.source] = 'visited'
        vertexStatus[e.target] = 'visited'
      })
    }

    // 5. Arestas Rejeitadas por Ciclo (Kruskal)
    if (ev.rejectedEdges) {
      ev.rejectedEdges.forEach(e => {
        setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.id || e.edgeId, 'cycle')
      })
    }

    // 6. Aresta Sendo Examinada/Processada no Passo Atual
    if (ev.edge) {
      const e = ev.edge
      let activeEdgeType = 'examining'
      if (ev.type === 'TREE_EDGE' || ev.type === 'ACCEPT_EDGE') {
        activeEdgeType = 'tree'
      } else if (ev.type === 'REJECT_CYCLE' || ev.type === 'BACK_EDGE') {
        activeEdgeType = 'cycle'
      }
      setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.id || e.edgeId, activeEdgeType)
    }

    // 7. Vértice Atual em Processamento
    if (ev.currentVertex && ev.type !== 'COMPLETE') {
      vertexStatus[ev.currentVertex] = 'current'
    }

    // 8. Caminho Mínimo Final (BFS / Dijkstra) quando alcança destino ou conclui
    if (isAtFinalOrTarget) {
      const optPath = runObj.result.shortestPath || runObj.result.targetPath || null
      if (optPath && optPath.length > 0) {
        optPath.forEach(vId => {
          vertexStatus[vId] = 'path'
        })
        for (let i = 0; i < optPath.length - 1; i++) {
          setEdgeHighlight(edgeStatus, graphObj, optPath[i], optPath[i + 1], null, 'path')
        }
      }
    }
  } else {
    // Fallback caso resultado exista sem eventos
    const res = runObj.result
    if (res.visitedOrder) {
      res.visitedOrder.forEach(vId => {
        vertexStatus[vId] = 'visited'
      })
    }
    if (res.settledOrder) {
      res.settledOrder.forEach(vId => {
        vertexStatus[vId] = 'settled'
      })
    }
    if (res.treeEdges) {
      res.treeEdges.forEach(e => {
        setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.edgeId || e.id, 'tree')
      })
    }
    if (res.predecessors) {
      Object.entries(res.predecessors).forEach(([vId, predId]) => {
        if (predId !== null && predId !== undefined) {
          setEdgeHighlight(edgeStatus, graphObj, predId, vId, null, 'tree')
        }
      })
    }
    if (res.mstEdges) {
      res.mstEdges.forEach(e => {
        setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.id, 'tree')
        vertexStatus[e.source] = 'visited'
        vertexStatus[e.target] = 'visited'
      })
    }
    if (res.rejectedEdges) {
      res.rejectedEdges.forEach(e => {
        setEdgeHighlight(edgeStatus, graphObj, e.source, e.target, e.id, 'cycle')
      })
    }
    const optPath = res.shortestPath || res.targetPath || null
    if (optPath && optPath.length > 0) {
      optPath.forEach(vId => {
        vertexStatus[vId] = 'path'
      })
      for (let i = 0; i < optPath.length - 1; i++) {
        setEdgeHighlight(edgeStatus, graphObj, optPath[i], optPath[i + 1], null, 'path')
      }
    }
  }

  return { vertexStatus, edgeStatus }
}

export function useAlgorithmRunner() {
  const { graph, graphVersion, addLog } = useGraph()

  // Retrocompatibilidade para consumidores de algoritmo único (ex: DashboardView)
  const selectedAlgorithm = computed({
    get: () => selectedAlgorithms.value[0] || 'DFS',
    set: (val) => {
      if (val && CANONICAL_ORDER.includes(val)) {
        selectedAlgorithms.value = [val]
      }
    }
  })

  const isMultiMode = computed(() => selectedAlgorithms.value.length > 1)

  const totalSteps = computed(() => {
    let maxLen = 0
    for (const key of selectedAlgorithms.value) {
      const len = runs.value[key]?.events?.length || 0
      if (len > maxLen) maxLen = len
    }
    return maxLen
  })

  const hasAnyRun = computed(() => Object.keys(runs.value).length > 0)
  const hasAnyValidResult = computed(() =>
    selectedAlgorithms.value.some(k => Boolean(runs.value[k]?.result))
  )

  const result = computed(() => {
    const primary = runs.value[selectedAlgorithm.value]?.result
    if (primary) return primary
    for (const key of selectedAlgorithms.value) {
      if (runs.value[key]?.result) return runs.value[key].result
    }
    return null
  })

  const events = computed(() => {
    if (!isMultiMode.value) {
      return runs.value[selectedAlgorithm.value]?.events || []
    }
    // Array virtual de passos globais para compatibilidade com barra de progresso
    return Array.from({ length: totalSteps.value }, (_, idx) => ({ step: idx + 1 }))
  })

  function clearResult() {
    pause()
    runs.value = {}
    error.value = null
    currentStepIndex.value = -1
  }

  if (!watcherInitialized) {
    watcherInitialized = true

    // Invalida resultados automaticamente se o grafo for alterado
    watch(graphVersion, () => {
      if (Object.keys(runs.value).length > 0 || currentStepIndex.value >= 0) {
        clearResult()
        addLog('info', 'Resultados dos algoritmos invalidados devido à alteração do grafo.')
      }
    })

    // Sincroniza nós padrão de origem e destino
    watch(
      () => graph.value.vertices,
      newVertices => {
        if (newVertices.length > 0) {
          if (!startVertexId.value || !graph.value.hasVertex(startVertexId.value)) {
            startVertexId.value = newVertices[0].id
          }
          if (newVertices.length > 1) {
            if (!targetVertexId.value || !graph.value.hasVertex(targetVertexId.value)) {
              targetVertexId.value = newVertices[newVertices.length - 1].id
            }
          } else {
            targetVertexId.value = ''
          }
        } else {
          startVertexId.value = ''
          targetVertexId.value = ''
        }
      },
      { immediate: true, deep: true }
    )

    // Invalida resultados anteriores ao trocar origem, destino ou opção de componentes
    watch([startVertexId, targetVertexId, exploreAllComponents], () => {
      if (Object.keys(runs.value).length > 0 || currentStepIndex.value >= 0) {
        clearResult()
      }
    })

    // Atualiza intervalo em tempo real se o usuário trocar a velocidade durante a reprodução
    watch(playbackSpeed, (newSpeed) => {
      if (isPlaying.value) {
        if (timerId) clearInterval(timerId)
        timerId = setInterval(() => {
          advancePlaybackTick()
        }, newSpeed)
      }
    })
  }

  // Seleção de 1, 2, 3 ou 4 Algoritmos
  function toggleAlgorithm(key) {
    if (!CANONICAL_ORDER.includes(key)) return
    const exists = selectedAlgorithms.value.includes(key)
    if (exists) {
      if (selectedAlgorithms.value.length <= 1) return // Mantém ao menos 1 selecionado
      selectedAlgorithms.value = selectedAlgorithms.value.filter(k => k !== key)
    } else {
      const nextSet = new Set([...selectedAlgorithms.value, key])
      selectedAlgorithms.value = CANONICAL_ORDER.filter(k => nextSet.has(k))
    }
    clearResult()
  }

  function selectOnlyAlgorithm(key) {
    if (!CANONICAL_ORDER.includes(key)) return
    selectedAlgorithms.value = [key]
    clearResult()
  }

  function selectAllAlgorithms() {
    selectedAlgorithms.value = [...CANONICAL_ORDER]
    clearResult()
  }

  function triggerCelebration() {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#3b82f6', '#a855f7', '#10b981']
      })
    } catch (e) {
      // Ignora silenciosamente se o ambiente não suportar
    }
  }

  function runSingleAlgorithmKey(algoKey) {
    switch (algoKey) {
      case 'DFS':
        return runDFS(graph.value, startVertexId.value, {
          exploreAllComponents: exploreAllComponents.value
        })

      case 'BFS':
        return runBFS(
          graph.value,
          startVertexId.value,
          targetVertexId.value || null
        )

      case 'DIJKSTRA': {
        const val = validateDijkstra(graph.value, startVertexId.value)
        if (!val.canRun) {
          throw new Error(val.message)
        }
        return runDijkstra(
          graph.value,
          startVertexId.value,
          targetVertexId.value || null
        )
      }

      case 'KRUSKAL': {
        const val = validateKruskal(graph.value)
        if (!val.canRun) {
          throw new Error(val.message)
        }
        return runKruskal(graph.value)
      }

      default:
        throw new Error(`Algoritmo "${algoKey}" não reconhecido.`)
    }
  }

  function executeCalculation() {
    error.value = null
    runs.value = {}
    currentStepIndex.value = -1
    pause()

    const nextRuns = {}
    const succeededNames = []
    const errorsList = []

    for (const algoKey of selectedAlgorithms.value) {
      try {
        const res = runSingleAlgorithmKey(algoKey)
        nextRuns[algoKey] = {
          key: algoKey,
          result: res,
          error: null,
          events: res.events || []
        }
        succeededNames.push(res.algorithm)
      } catch (err) {
        nextRuns[algoKey] = {
          key: algoKey,
          result: null,
          error: err.message,
          events: []
        }
        errorsList.push(`${algoKey}: ${err.message}`)
      }
    }

    runs.value = nextRuns

    if (succeededNames.length > 0) {
      if (succeededNames.length === 1) {
        addLog('success', `Algoritmo ${succeededNames[0]} executado com sucesso.`)
      } else {
        addLog('success', `Simulação simultânea (${succeededNames.length} modelos 3D): ${succeededNames.join(', ')}.`)
      }
    }

    if (errorsList.length > 0) {
      error.value = errorsList[0]
      if (succeededNames.length === 0) {
        addLog('error', `Erro na execução: ${errorsList.join(' | ')}`)
      } else {
        addLog('warning', `Aviso parcial na execução múltipla — ${errorsList.join(' | ')}`)
      }
    }

    return succeededNames.length > 0 ? nextRuns : null
  }

  function runInstant() {
    const executed = executeCalculation()
    if (executed && totalSteps.value > 0) {
      currentStepIndex.value = totalSteps.value - 1
      triggerCelebration()
    }
  }

  function runStepByStep(autoPlay = true) {
    const executed = executeCalculation()
    if (executed && totalSteps.value > 0) {
      currentStepIndex.value = 0
      if (autoPlay && totalSteps.value > 1) {
        startPlaybackInterval()
      }
    }
  }

  function advancePlaybackTick() {
    if (currentStepIndex.value < totalSteps.value - 1) {
      currentStepIndex.value++
    } else {
      pause()
      triggerCelebration()
    }
  }

  function startPlaybackInterval() {
    if (isPlaying.value) return
    isPlaying.value = true
    timerId = setInterval(() => {
      advancePlaybackTick()
    }, playbackSpeed.value)
  }

  function play() {
    if (isPlaying.value) return
    if (totalSteps.value === 0) {
      runStepByStep(true)
      return
    }
    if (currentStepIndex.value >= totalSteps.value - 1) {
      currentStepIndex.value = 0
    }
    startPlaybackInterval()
  }

  function pause() {
    isPlaying.value = false
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function stepNext() {
    pause()
    if (totalSteps.value === 0) {
      runStepByStep(false)
      return
    }
    if (currentStepIndex.value < totalSteps.value - 1) {
      currentStepIndex.value++
      if (currentStepIndex.value === totalSteps.value - 1) {
        triggerCelebration()
      }
    }
  }

  function stepPrev() {
    pause()
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  function reset() {
    pause()
    if (totalSteps.value > 0) {
      currentStepIndex.value = 0
    }
  }

  function jumpToStep(index) {
    pause()
    if (index >= 0 && index < totalSteps.value) {
      currentStepIndex.value = index
    }
  }

  // Consultas Individuais por Algoritmo (para os 2, 3 ou 4 Cards 3D Simultâneos)
  function getAlgoRun(algoKey) {
    return runs.value[algoKey] || null
  }

  function getAlgoStepIndex(algoKey) {
    const run = runs.value[algoKey]
    if (!run || !run.events || run.events.length === 0 || currentStepIndex.value < 0) {
      return -1
    }
    return Math.min(currentStepIndex.value, run.events.length - 1)
  }

  function getAlgoCurrentEvent(algoKey) {
    const idx = getAlgoStepIndex(algoKey)
    if (idx < 0) return null
    return runs.value[algoKey]?.events?.[idx] || null
  }

  function getAlgoExecutionStatus(algoKey) {
    const run = runs.value[algoKey]
    if (!run) return 'idle'
    if (run.error) return 'error'
    if (!run.events || run.events.length === 0 || currentStepIndex.value < 0) return 'idle'
    const idx = getAlgoStepIndex(algoKey)
    if (idx >= run.events.length - 1) return 'completed'
    return isPlaying.value ? 'running' : 'paused'
  }

  /**
   * Resumo em tempo real do que cada algoritmo está fazendo e estado interno de sua estrutura de dados
   */
  function getAlgoLiveSummary(algoKey) {
    const run = runs.value[algoKey]
    const totalV = graph.value.vertices.length
    if (!run || !run.result) return null

    const idx = getAlgoStepIndex(algoKey)
    const ev = idx >= 0 ? run.events[idx] : null
    const isDone = idx >= run.events.length - 1

    if (algoKey === 'DFS') {
      const stackItems = ev?.stack || []
      const visitedCount = ev?.visited?.length ?? run.result.visitedCount
      const treeCount = ev?.treeEdges?.length ?? run.result.treeEdgeCount
      return {
        stepNumber: idx + 1,
        totalSteps: run.events.length,
        isDone,
        eventType: ev?.type || 'COMPLETE',
        description: ev?.description || 'Execução concluída.',
        structureLabel: 'Pilha LIFO',
        structureItems: stackItems,
        emptyStructureText: isDone ? 'pilha esvaziada' : 'vazia',
        metrics: [
          { label: 'Visitados', value: `${visitedCount}/${totalV}` },
          { label: 'Árvore DFS', value: `${treeCount} arestas` }
        ]
      }
    }

    if (algoKey === 'BFS') {
      const queueItems = ev?.queue || []
      const visitedCount = ev?.visited?.length ?? run.result.visitedCount
      const currNode = ev?.currentVertex
      const currDist = currNode && ev?.distances?.[currNode] !== undefined && ev.distances[currNode] !== Infinity
        ? ev.distances[currNode]
        : null
      const metrics = [{ label: 'Alcançados', value: `${visitedCount}/${totalV}` }]
      if (isDone && run.result.shortestPath) {
        metrics.push({ label: 'Menor Salto', value: `${run.result.pathEdgeCount} arestas` })
      } else if (currDist !== null) {
        metrics.push({ label: 'Camada Atual', value: `nível ${currDist}` })
      }
      return {
        stepNumber: idx + 1,
        totalSteps: run.events.length,
        isDone,
        eventType: ev?.type || 'COMPLETE',
        description: ev?.description || 'Execução concluída.',
        structureLabel: 'Fila FIFO',
        structureItems: queueItems,
        emptyStructureText: isDone ? 'fila concluída' : 'vazia',
        metrics
      }
    }

    if (algoKey === 'DIJKSTRA') {
      const pqItems = (ev?.pqState || []).map(item => `${item.vertex}(${item.dist})`)
      const settledCount = ev?.settled?.length ?? run.result.settledOrder.length
      const metrics = [{ label: 'Fixados', value: `${settledCount}/${totalV}` }]
      if (targetVertexId.value && ev?.distances?.[targetVertexId.value] !== undefined) {
        const d = ev.distances[targetVertexId.value]
        metrics.push({
          label: `Custo p/ ${targetVertexId.value}`,
          value: d === Infinity ? '∞' : d
        })
      }
      return {
        stepNumber: idx + 1,
        totalSteps: run.events.length,
        isDone,
        eventType: ev?.type || 'COMPLETE',
        description: ev?.description || 'Execução concluída.',
        structureLabel: 'Min-Heap',
        structureItems: pqItems,
        emptyStructureText: isDone ? 'heap concluído' : 'vazio',
        metrics
      }
    }

    if (algoKey === 'KRUSKAL') {
      const comps = ev?.currentComponents ?? run.result.componentCount
      const accepted = ev?.acceptedEdges?.length ?? run.result.edgeCountInMST
      const rejected = ev?.rejectedEdges?.length ?? run.result.rejectedEdges.length
      const cost = ev?.totalCost !== undefined ? Number(ev.totalCost.toFixed(2)) : run.result.totalCost
      return {
        stepNumber: idx + 1,
        totalSteps: run.events.length,
        isDone,
        eventType: ev?.type || 'COMPLETE',
        description: ev?.description || 'Execução concluída.',
        structureLabel: 'Conjuntos DSU',
        structureItems: [`${comps} ${comps === 1 ? 'componente' : 'componentes'}`],
        emptyStructureText: '1 componente',
        metrics: [
          { label: 'AGM Aceitas', value: accepted },
          { label: 'Ciclos Rej.', value: rejected },
          { label: 'Custo AGM', value: cost }
        ]
      }
    }

    return null
  }

  const currentStepEvent = computed(() => getAlgoCurrentEvent(selectedAlgorithm.value))

  // Mapa completo de destaques 3D/2D independente por algoritmo
  const algoHighlightsMap = computed(() => {
    const map = {}
    for (const algoKey of selectedAlgorithms.value) {
      map[algoKey] = computeHighlightsForAlgorithm(
        algoKey,
        graph.value,
        runs.value[algoKey] || null,
        currentStepIndex.value,
        startVertexId.value,
        targetVertexId.value
      )
    }
    return map
  })

  // Retrocompatibilidade para cena única (Dashboard / Explorer)
  const visualHighlights = computed(() => {
    return (
      algoHighlightsMap.value[selectedAlgorithm.value] ||
      computeHighlightsForAlgorithm(
        selectedAlgorithm.value,
        graph.value,
        null,
        -1,
        startVertexId.value,
        targetVertexId.value
      )
    )
  })

  return {
    algorithmsCatalog: ALGORITHMS_CATALOG,
    selectedAlgorithms,
    selectedAlgorithm,
    isMultiMode,
    startVertexId,
    targetVertexId,
    exploreAllComponents,
    runs,
    hasAnyRun,
    hasAnyValidResult,
    result,
    error,
    isRunning,
    events,
    totalSteps,
    currentStepIndex,
    currentStepEvent,
    isPlaying,
    playbackSpeed,
    algoHighlightsMap,
    visualHighlights,
    toggleAlgorithm,
    selectOnlyAlgorithm,
    selectAllAlgorithms,
    getAlgoRun,
    getAlgoStepIndex,
    getAlgoCurrentEvent,
    getAlgoExecutionStatus,
    getAlgoLiveSummary,
    runInstant,
    runStepByStep,
    play,
    pause,
    stepNext,
    stepPrev,
    reset,
    jumpToStep,
    clearResult
  }
}
