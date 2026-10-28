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

const undoStack = ref([])
const redoStack = ref([])

function takeSnapshot() {
  try {
    const serialized = JSON.stringify(graph.value.toJSON())
    const len = undoStack.value.length
    if (len === 0 || undoStack.value[len - 1] !== serialized) {
      undoStack.value.push(serialized)
      if (undoStack.value.length > 50) undoStack.value.shift()
      redoStack.value = []
    }
  } catch (err) {
    console.error('Falha ao registrar snapshot de histórico:', err)
  }
}

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

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function undo() {
    if (undoStack.value.length === 0) return false
    try {
      const currentSerialized = JSON.stringify(graph.value.toJSON())
      redoStack.value.push(currentSerialized)
      const prevSerialized = undoStack.value.pop()
      const parsed = JSON.parse(prevSerialized)
      graph.value = GraphModel.fromJSON(parsed)
      selectedVertexId.value = null
      selectedEdgeId.value = null
      notifyGraphModified('Ação desfeita (Undo).')
      return true
    } catch (err) {
      console.error('Falha ao executar undo:', err)
      return false
    }
  }

  function redo() {
    if (redoStack.value.length === 0) return false
    try {
      const currentSerialized = JSON.stringify(graph.value.toJSON())
      undoStack.value.push(currentSerialized)
      const nextSerialized = redoStack.value.pop()
      const parsed = JSON.parse(nextSerialized)
      graph.value = GraphModel.fromJSON(parsed)
      selectedVertexId.value = null
      selectedEdgeId.value = null
      notifyGraphModified('Ação refeita (Redo).')
      return true
    } catch (err) {
      console.error('Falha ao executar redo:', err)
      return false
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

  // Geração inteligente de ID sequencial (A, B, C... AA, AB... V1, V2...)
  function generateNextVertexId() {
    const existing = new Set(graph.value.vertices.map(v => String(v.id).trim().toUpperCase()))
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i)
      if (!existing.has(char)) return char
    }
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        const candidate = `${String.fromCharCode(65 + i)}${String.fromCharCode(65 + j)}`
        if (!existing.has(candidate)) return candidate
      }
    }
    let count = 1
    while (true) {
      const candidate = `V${count}`
      if (!existing.has(candidate.toUpperCase())) return candidate
      count++
    }
  }

  // Operações em Vértices
  function addVertex(vertexData) {
    try {
      takeSnapshot()
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
      takeSnapshot()
      const v = graph.value.updateVertex(id, updates)
      notifyGraphModified(`Vértice "${id}" atualizado com sucesso.`)
      return { success: true, vertex: v }
    } catch (err) {
      addLog('error', `Falha ao atualizar vértice: ${err.message}`)
      return { success: false, error: err.message }
    }
  }

  function moveVertex(id, x, y, z = 0, shouldRecordHistory = false) {
    const v = graph.value.getVertex(id)
    if (!v) return false
    if (shouldRecordHistory) {
      takeSnapshot()
    }
    v.x = typeof x === 'number' ? Number(x.toFixed(2)) : v.x
    v.y = typeof y === 'number' ? Number(y.toFixed(2)) : v.y
    if (z !== undefined && z !== null) {
      v.z = typeof z === 'number' ? Number(z.toFixed(2)) : v.z
    }
    graphVersion.value++
    saveGraph()
    return true
  }

  function duplicateVertex(id) {
    const v = graph.value.getVertex(id)
    if (!v) return null
    const newId = generateNextVertexId()
    const offset = 12
    const clone = {
      id: newId,
      label: `${v.label || v.id} (Cópia)`,
      type: v.type || 'standard',
      x: (v.x || 0) + offset,
      y: (v.y || 0) + offset,
      z: v.z || 0
    }
    return addVertex(clone)
  }

  function removeVertex(id) {
    try {
      takeSnapshot()
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
      takeSnapshot()
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
      takeSnapshot()
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
      takeSnapshot()
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
    takeSnapshot()
    graph.value.setDirected(directed)
    notifyGraphModified(`Modo do grafo alterado para: ${directed ? 'DIRECIONADO' : 'NÃO-DIRECIONADO'}.`)
  }

  function setWeighted(weighted) {
    takeSnapshot()
    graph.value.setWeighted(weighted)
    notifyGraphModified(`Ponderação do grafo alterada para: ${weighted ? 'PONDERADO' : 'NÃO-PONDERADO'}.`)
  }

  function setName(name) {
    takeSnapshot()
    graph.value.setName(name)
    notifyGraphModified(`Nome do grafo alterado para: "${name}".`)
  }

  function clearGraph() {
    takeSnapshot()
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
    takeSnapshot()
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
      takeSnapshot()
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
    takeSnapshot,
    canUndo,
    canRedo,
    undo,
    redo,
    generateNextVertexId,
    moveVertex,
    duplicateVertex,
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
