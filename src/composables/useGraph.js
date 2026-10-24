import { ref, computed, watch } from 'vue'
import { GraphModel } from '../graph/graphModel.js'
import { AdjacencyList } from '../graph/adjacencyList.js'
import { AdjacencyMatrix } from '../graph/adjacencyMatrix.js'
import { calculateGraphMetrics } from '../graph/graphMetrics.js'
import { validateGraphStructure, validateJSONImport } from '../graph/graphValidation.js'
import { PRESET_GRAPHS } from '../graph/defaultPresets.js'

const STORAGE_KEY = 'smartnet_analyzer_active_graph_v1'

// Estado Reativo Compartilhado (Singleton Composable)
const graph = ref(loadInitialGraph())
const selectedVertexId = ref(null)
const selectedEdgeId = ref(null)
const graphVersion = ref(1) // Incrementado para invalidar resultados de algoritmos
const logs = ref([
  {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    type: 'info',
    message: 'Sistema SmartNet Analyzer inicializado com sucesso.'
  }
])

function loadInitialGraph() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const validation = validateJSONImport(parsed)
      if (validation.isValid) {
        return GraphModel.fromJSON(parsed)
      }
    }
  } catch (err) {
    console.warn('Falha ao restaurar grafo do LocalStorage. Utilizando padrão universitário.', err)
  }
  return GraphModel.fromJSON(PRESET_GRAPHS[0])
}

function saveGraph() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph.value.toJSON()))
  } catch (err) {
    console.error('Falha ao salvar no LocalStorage:', err)
  }
}

export function useGraph() {
  function addLog(type, message) {
    logs.value.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    })
    if (logs.value.length > 80) logs.value.pop()
  }

  function notifyGraphModified(actionDesc) {
    graphVersion.value++
    saveGraph()
    if (actionDesc) {
      addLog('info', actionDesc)
    }
  }

  // Métricas derivadas em tempo real
  const metrics = computed(() => {
    // Força dependência reativa do graphVersion
    if (!graphVersion.value) return null
    return calculateGraphMetrics(graph.value)
  })

  // Lista de adjacência derivada
  const adjacencyList = computed(() => {
    if (!graphVersion.value) return null
    return new AdjacencyList(graph.value)
  })

  // Matriz de adjacência derivada
  const adjacencyMatrix = computed(() => {
    if (!graphVersion.value) return null
    return new AdjacencyMatrix(graph.value)
  })

  // Validação estrutural do grafo
  const validation = computed(() => {
    if (!graphVersion.value) return null
    return validateGraphStructure(graph.value)
  })

  // Operações em Vértices
  function addVertex(vertexData) {
    try {
      const v = graph.value.addVertex(vertexData)
      notifyGraphModified(`Vértice "${v.id}" (${v.label}) adicionado à infraestrutura.`)
      return { success: true, vertex: v }
    } catch (err) {
      addLog('error', `Falha ao adicionar vértice: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  function updateVertex(id, updates) {
    try {
      const v = graph.value.updateVertex(id, updates)
      notifyGraphModified(`Vértice "${id}" atualizado com sucesso.`)
      return { success: true, vertex: v }
    } catch (err) {
      addLog('error', `Falha ao atualizar vértice: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  function removeVertex(id) {
    try {
      const removed = graph.value.removeVertex(id)
      if (removed) {
        if (selectedVertexId.value === id) selectedVertexId.value = null
        notifyGraphModified(`Vértice "${id}" e arestas incidentes foram removidos.`)
        return { success: true }
      }
      return { success: false, error: 'Vértice não encontrado.' }
    } catch (err) {
      addLog('error', `Falha ao remover vértice: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  // Operações em Arestas
  function addEdge(edgeData) {
    try {
      const e = graph.value.addEdge(edgeData)
      notifyGraphModified(`Conexão (${e.source} ➔ ${e.target}, peso: ${e.weight}) inserida.`)
      return { success: true, edge: e }
    } catch (err) {
      addLog('error', `Falha ao adicionar conexão: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  function updateEdge(id, updates) {
    try {
      const e = graph.value.updateEdge(id, updates)
      notifyGraphModified(`Conexão "${id}" atualizada com sucesso.`)
      return { success: true, edge: e }
    } catch (err) {
      addLog('error', `Falha ao atualizar conexão: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  function removeEdge(id) {
    try {
      const removed = graph.value.removeEdge(id)
      if (removed) {
        if (selectedEdgeId.value === id) selectedEdgeId.value = null
        notifyGraphModified(`Conexão "${id}" removida.`)
        return { success: true }
      }
      return { success: false, error: 'Aresta não encontrada.' }
    } catch (err) {
      addLog('error', `Falha ao remover conexão: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  // Configurações do Grafo
  function setDirected(directed) {
    graph.value.setDirected(directed)
    notifyGraphModified(`Modo do grafo alterado para: ${directed ? 'DIRECIONADO' : 'NÃO-DIRECIONADO'}.`)
  }

  function setWeighted(weighted) {
    graph.value.setWeighted(weighted)
    notifyGraphModified(`Ponderação do grafo alterada para: ${weighted ? 'PONDERADO' : 'NÃO-PONDERADO'}.`)
  }

  function setName(name) {
    graph.value.setName(name)
    notifyGraphModified(`Nome do grafo alterado para: "${name}".`)
  }

  function clearGraph() {
    graph.value.clear()
    selectedVertexId.value = null
    selectedEdgeId.value = null
    notifyGraphModified('O grafo atual foi completamente limpo.')
  }

  function loadPreset(presetId) {
    const preset = PRESET_GRAPHS.find(p => p.id === presetId)
    if (!preset) {
      addLog('error', `Predefinição "${presetId}" não encontrada.`)
      return false
    }
    graph.value = GraphModel.fromJSON(preset)
    selectedVertexId.value = null
    selectedEdgeId.value = null
    notifyGraphModified(`Predefinição "${preset.name}" carregada com sucesso.`)
    return true
  }

  function importFromJSON(jsonText) {
    try {
      const data = JSON.parse(jsonText)
      const val = validateJSONImport(data)
      if (!val.isValid) {
        addLog('error', `Arquivo JSON inválido: ${val.error}`)
        return { success: false, error: val.error }
      }
      graph.value = GraphModel.fromJSON(data)
      selectedVertexId.value = null
      selectedEdgeId.value = null
      notifyGraphModified(`Grafo "${graph.value.name}" importado com sucesso via JSON.`)
      return { success: true }
    } catch (err) {
      addLog('error', `Erro na sintaxe JSON: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  function exportToJSON() {
    return JSON.stringify(graph.value.toJSON(), null, 2)
  }

  function selectVertex(id) {
    selectedVertexId.value = id
    selectedEdgeId.value = null
  }

  function selectEdge(id) {
    selectedEdgeId.value = id
    selectedVertexId.value = null
  }

  return {
    graph,
    graphVersion,
    metrics,
    adjacencyList,
    adjacencyMatrix,
    validation,
    selectedVertexId,
    selectedEdgeId,
    logs,
    addLog,
    addVertex,
    updateVertex,
    removeVertex,
    addEdge,
    updateEdge,
    removeEdge,
    setDirected,
    setWeighted,
    setName,
    clearGraph,
    loadPreset,
    importFromJSON,
    exportToJSON,
    selectVertex,
    selectEdge,
    presets: PRESET_GRAPHS
  }
}
