import { ref, computed, watch } from 'vue'
import confetti from 'canvas-confetti'
import { useGraph } from './useGraph.js'
import { runDFS } from '../algorithms/dfs.js'
import { runBFS } from '../algorithms/bfs.js'
import { runDijkstra } from '../algorithms/dijkstra.js'
import { runKruskal } from '../algorithms/kruskal.js'
import { validateDijkstra, validateKruskal } from '../graph/graphValidation.js'

// Estado Reativo Compartilhado
const selectedAlgorithm = ref('DFS')
const startVertexId = ref('')
const targetVertexId = ref('')
const exploreAllComponents = ref(false)

const result = ref(null)
const error = ref(null)
const isRunning = ref(false)

// Estado da Reprodução Didática Passo a Passo
const events = ref([])
const currentStepIndex = ref(-1)
const isPlaying = ref(false)
const playbackSpeed = ref(600) // ms por passo
let timerId = null

export function useAlgorithmRunner() {
  const { graph, graphVersion, addLog } = useGraph()

  // Invalida resultados automaticamente se o grafo for alterado
  watch(graphVersion, () => {
    if (result.value || events.value.length > 0) {
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

  function executeCalculation() {
    error.value = null
    result.value = null
    events.value = []
    currentStepIndex.value = -1
    pause()

    try {
      let res = null
      switch (selectedAlgorithm.value) {
        case 'DFS':
          res = runDFS(graph.value, startVertexId.value, {
            exploreAllComponents: exploreAllComponents.value
          })
          break

        case 'BFS':
          res = runBFS(
            graph.value,
            startVertexId.value,
            targetVertexId.value || null
          )
          break

        case 'DIJKSTRA': {
          const val = validateDijkstra(graph.value, startVertexId.value)
          if (!val.canRun) {
            throw new Error(val.message)
          }
          res = runDijkstra(
            graph.value,
            startVertexId.value,
            targetVertexId.value || null
          )
          break
        }

        case 'KRUSKAL': {
          const val = validateKruskal(graph.value)
          if (!val.canRun) {
            throw new Error(val.message)
          }
          res = runKruskal(graph.value)
          break
        }

        default:
          throw new Error(`Algoritmo "${selectedAlgorithm.value}" não reconhecido.`)
      }

      result.value = res
      events.value = res.events || []
      addLog('success', `Algoritmo ${res.algorithm} executado com sucesso.`)
      return res
    } catch (err) {
      error.value = err.message
      addLog('error', `Erro na execução de ${selectedAlgorithm.value}: ${err.message}`)
      return null
    }
  }

  function runInstant() {
    const res = executeCalculation()
    if (res && events.value.length > 0) {
      // Vai direto para o último passo (concluído)
      currentStepIndex.value = events.value.length - 1
      triggerCelebration()
    }
  }

  function runStepByStep() {
    const res = executeCalculation()
    if (res && events.value.length > 0) {
      currentStepIndex.value = 0
    }
  }

  // Controles de Reprodução
  function play() {
    if (isPlaying.value) return
    if (events.value.length === 0) {
      runStepByStep()
    }
    if (currentStepIndex.value >= events.value.length - 1) {
      currentStepIndex.value = 0
    }

    isPlaying.value = true
    timerId = setInterval(() => {
      if (currentStepIndex.value < events.value.length - 1) {
        currentStepIndex.value++
      } else {
        pause()
        triggerCelebration()
      }
    }, playbackSpeed.value)
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
    if (events.value.length === 0) {
      runStepByStep()
      return
    }
    if (currentStepIndex.value < events.value.length - 1) {
      currentStepIndex.value++
      if (currentStepIndex.value === events.value.length - 1) {
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
    if (events.value.length > 0) {
      currentStepIndex.value = 0
    }
  }

  function jumpToStep(index) {
    pause()
    if (index >= 0 && index < events.value.length) {
      currentStepIndex.value = index
    }
  }

  function clearResult() {
    pause()
    result.value = null
    error.value = null
    events.value = []
    currentStepIndex.value = -1
  }

  // Destaques Visuais no Passo Atual (Consumido pelo ThreeScene e Canvas 2D)
  const currentStepEvent = computed(() => {
    if (currentStepIndex.value >= 0 && currentStepIndex.value < events.value.length) {
      return events.value[currentStepIndex.value]
    }
    return null
  })

  const visualHighlights = computed(() => {
    const vertexStatus = {} // { [id]: 'current' | 'visited' | 'queued' | 'settled' | 'path' | 'source' | 'target' }
    const edgeStatus = {}   // { [id]: 'tree' | 'cycle' | 'examining' | 'path' }

    if (startVertexId.value) {
      vertexStatus[startVertexId.value] = 'source'
    }
    if (targetVertexId.value) {
      vertexStatus[targetVertexId.value] = 'target'
    }

    const ev = currentStepEvent.value

    if (ev) {
      // 1. Vértices Visitados
      if (ev.visited) {
        ev.visited.forEach(vId => {
          vertexStatus[vId] = 'visited'
        })
      }

      // 2. Vértices no Heap/Fila
      if (ev.queue) {
        ev.queue.forEach(vId => {
          vertexStatus[vId] = 'queued'
        })
      }
      if (ev.pqState) {
        ev.pqState.forEach(item => {
          vertexStatus[item.vertex] = 'queued'
        })
      }

      // 3. Vértices Fixados em Dijkstra
      if (ev.settled) {
        ev.settled.forEach(vId => {
          vertexStatus[vId] = 'settled'
        })
      }

      // 4. Arestas de Árvore ou Aceitas
      if (ev.treeEdges) {
        ev.treeEdges.forEach(e => {
          if (e.edgeId) edgeStatus[e.edgeId] = 'tree'
          edgeStatus[`${e.source}->${e.target}`] = 'tree'
          edgeStatus[`${e.target}->${e.source}`] = 'tree'
        })
      }
      if (ev.acceptedEdges) {
        ev.acceptedEdges.forEach(e => {
          if (e.id) edgeStatus[e.id] = 'tree'
          edgeStatus[`${e.source}->${e.target}`] = 'tree'
          edgeStatus[`${e.target}->${e.source}`] = 'tree'
        })
      }

      // 5. Arestas Rejeitadas (Kruskal)
      if (ev.rejectedEdges) {
        ev.rejectedEdges.forEach(e => {
          if (e.id) edgeStatus[e.id] = 'cycle'
          edgeStatus[`${e.source}->${e.target}`] = 'cycle'
          edgeStatus[`${e.target}->${e.source}`] = 'cycle'
        })
      }

      // 6. Aresta em Exame Ativo
      if (ev.edge) {
        const e = ev.edge
        if (e.id || e.edgeId) edgeStatus[e.id || e.edgeId] = 'examining'
        edgeStatus[`${e.source}->${e.target}`] = 'examining'
        edgeStatus[`${e.target}->${e.source}`] = 'examining'
      }

      // 7. Vértice Atual
      if (ev.currentVertex) {
        vertexStatus[ev.currentVertex] = 'current'
      }

      // 8. Caminho Final (se concluído)
      if (result.value) {
        if (result.value.shortestPath) {
          result.value.shortestPath.forEach(vId => {
            vertexStatus[vId] = 'path'
          })
        }
        if (result.value.targetPath) {
          result.value.targetPath.forEach(vId => {
            vertexStatus[vId] = 'path'
          })
        }
      }
    } else if (result.value) {
      // Se já temos resultado final completo
      if (result.value.visitedOrder) {
        result.value.visitedOrder.forEach(vId => {
          vertexStatus[vId] = 'visited'
        })
      }
      if (result.value.treeEdges) {
        result.value.treeEdges.forEach(e => {
          if (e.edgeId) edgeStatus[e.edgeId] = 'tree'
          edgeStatus[`${e.source}->${e.target}`] = 'tree'
          edgeStatus[`${e.target}->${e.source}`] = 'tree'
        })
      }
      if (result.value.mstEdges) {
        result.value.mstEdges.forEach(e => {
          if (e.id) edgeStatus[e.id] = 'tree'
          edgeStatus[`${e.source}->${e.target}`] = 'tree'
          edgeStatus[`${e.target}->${e.source}`] = 'tree'
        })
      }
      if (result.value.rejectedEdges) {
        result.value.rejectedEdges.forEach(e => {
          if (e.id) edgeStatus[e.id] = 'cycle'
          edgeStatus[`${e.source}->${e.target}`] = 'cycle'
          edgeStatus[`${e.target}->${e.source}`] = 'cycle'
        })
      }
      if (result.value.shortestPath) {
        result.value.shortestPath.forEach(vId => {
          vertexStatus[vId] = 'path'
        })
      }
      if (result.value.targetPath) {
        result.value.targetPath.forEach(vId => {
          vertexStatus[vId] = 'path'
        })
      }
    }

    return { vertexStatus, edgeStatus }
  })

  return {
    selectedAlgorithm,
    startVertexId,
    targetVertexId,
    exploreAllComponents,
    result,
    error,
    isRunning,
    events,
    currentStepIndex,
    currentStepEvent,
    isPlaying,
    playbackSpeed,
    visualHighlights,
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
