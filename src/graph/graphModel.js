/**
 * Modelo Fundamental do Grafo do SmartNet Analyzer
 * Responsável por armazenar vértices e arestas, gerenciar suas propriedades
 * e fornecer métodos de manipulação estrutural com garantia de consistência.
 */
export class GraphModel {
  /**
   * @param {Object} options
   * @param {string} [options.id]
   * @param {string} [options.name]
   * @param {boolean} [options.directed=false]
   * @param {boolean} [options.weighted=true]
   * @param {Array} [options.vertices=[]]
   * @param {Array} [options.edges=[]]
   */
  constructor({
    id = `graph-${Date.now()}`,
    name = 'Rede Metropolitana SmartNet',
    directed = false,
    weighted = true,
    vertices = [],
    edges = []
  } = {}) {
    this.id = id
    this.name = name
    this.directed = !!directed
    this.weighted = !!weighted
    this.vertices = []
    this.edges = []

    // Inicialização segura
    if (Array.isArray(vertices)) {
      vertices.forEach(v => this.addVertex(v))
    }
    if (Array.isArray(edges)) {
      edges.forEach(e => this.addEdge(e))
    }
  }

  // --- VÉRTICES ---

  /**
   * Adiciona um vértice ao grafo
   * @param {Object} vertex
   * @param {string} vertex.id Identificador único
   * @param {string} [vertex.label] Nome de exibição
   * @param {number} [vertex.x] Posição 3D X
   * @param {number} [vertex.y] Posição 3D Y
   * @param {number} [vertex.z] Posição 3D Z
   * @returns {Object} Vértice inserido
   */
  addVertex(vertex) {
    if (!vertex || !vertex.id) {
      throw new Error('Identificador de vértice inválido ou ausente.')
    }
    const cleanId = String(vertex.id).trim()
    if (!cleanId) {
      throw new Error('Identificador de vértice não pode ser vazio.')
    }
    if (this.hasVertex(cleanId)) {
      throw new Error(`Vértice com ID "${cleanId}" já existe no grafo.`)
    }

    const newVertex = {
      id: cleanId,
      label: vertex.label && String(vertex.label).trim() ? String(vertex.label).trim() : cleanId,
      x: typeof vertex.x === 'number' ? vertex.x : (Math.random() - 0.5) * 40,
      y: typeof vertex.y === 'number' ? vertex.y : (Math.random() - 0.5) * 40,
      z: typeof vertex.z === 'number' ? vertex.z : (Math.random() - 0.5) * 40,
      type: vertex.type || 'standard' // 'hub', 'sensor', 'datacenter', 'standard'
    }

    this.vertices.push(newVertex)
    return newVertex
  }

  hasVertex(id) {
    const cleanId = String(id).trim()
    return this.vertices.some(v => v.id === cleanId)
  }

  getVertex(id) {
    const cleanId = String(id).trim()
    return this.vertices.find(v => v.id === cleanId) || null
  }

  updateVertex(id, updates = {}) {
    const v = this.getVertex(id)
    if (!v) {
      throw new Error(`Vértice com ID "${id}" não encontrado para atualização.`)
    }

    if (updates.newId && updates.newId !== id) {
      const cleanNewId = String(updates.newId).trim()
      if (this.hasVertex(cleanNewId)) {
        throw new Error(`Novo ID "${cleanNewId}" já está em uso por outro vértice.`)
      }
      // Atualiza referências nas arestas
      this.edges.forEach(edge => {
        if (edge.source === id) edge.source = cleanNewId
        if (edge.target === id) edge.target = cleanNewId
      })
      v.id = cleanNewId
    }

    if (updates.label !== undefined) v.label = String(updates.label).trim() || v.id
    if (typeof updates.x === 'number') v.x = updates.x
    if (typeof updates.y === 'number') v.y = updates.y
    if (typeof updates.z === 'number') v.z = updates.z
    if (updates.type) v.type = updates.type

    return v
  }

  /**
   * Remove um vértice e todas as arestas incidentes
   * @param {string} id
   * @returns {boolean}
   */
  removeVertex(id) {
    const cleanId = String(id).trim()
    const index = this.vertices.findIndex(v => v.id === cleanId)
    if (index === -1) return false

    this.vertices.splice(index, 1)
    // Remove arestas conectadas (origem ou destino)
    this.edges = this.edges.filter(e => e.source !== cleanId && e.target !== cleanId)
    return true
  }

  // --- ARESTAS ---

  /**
   * Adiciona uma aresta ao grafo
   * Política para arestas paralelas: rejeita duplicatas idênticas (mesmo par e direção).
   * Política para laços (self-loops): permitidos apenas se source === target, mas avisado.
   * @param {Object} edge
   * @param {string} [edge.id] Identificador
   * @param {string} edge.source Vértice de origem
   * @param {string} edge.target Vértice de destino
   * @param {number} [edge.weight=1] Peso da aresta
   * @returns {Object} Aresta inserida
   */
  addEdge(edge) {
    if (!edge || !edge.source || !edge.target) {
      throw new Error('Aresta inválida: origem e destino são obrigatórios.')
    }
    const source = String(edge.source).trim()
    const target = String(edge.target).trim()

    if (!this.hasVertex(source)) {
      throw new Error(`Vértice de origem "${source}" não existe no grafo.`)
    }
    if (!this.hasVertex(target)) {
      throw new Error(`Vértice de destino "${target}" não existe no grafo.`)
    }

    // Tratamento de peso
    let weight = 1
    if (this.weighted) {
      if (typeof edge.weight === 'number' && !isNaN(edge.weight)) {
        weight = edge.weight
      } else if (edge.weight !== undefined && !isNaN(Number(edge.weight))) {
        weight = Number(edge.weight)
      }
    }

    // Validação de aresta duplicada
    const isDuplicate = this.edges.some(existing => {
      if (this.directed) {
        return existing.source === source && existing.target === target
      } else {
        return (
          (existing.source === source && existing.target === target) ||
          (existing.source === target && existing.target === source)
        )
      }
    })

    if (isDuplicate) {
      throw new Error(
        `Já existe uma conexão entre "${source}" e "${target}" ${this.directed ? '(direcionada)' : '(não-direcionada)'}.`
      )
    }

    const edgeId = edge.id ? String(edge.id).trim() : `e-${source}-${target}-${Date.now().toString(36)}`
    const newEdge = {
      id: edgeId,
      source,
      target,
      weight,
      label: edge.label || (this.weighted ? `${weight}` : '')
    }

    this.edges.push(newEdge)
    return newEdge
  }

  hasEdge(id) {
    return this.edges.some(e => e.id === id)
  }

  getEdge(id) {
    return this.edges.find(e => e.id === id) || null
  }

  updateEdge(id, updates = {}) {
    const edge = this.getEdge(id)
    if (!edge) {
      throw new Error(`Aresta "${id}" não encontrada.`)
    }

    if (updates.weight !== undefined) {
      const numWeight = Number(updates.weight)
      if (isNaN(numWeight)) throw new Error('O peso da aresta deve ser um número válido.')
      edge.weight = numWeight
      edge.label = String(numWeight)
    }
    if (updates.label !== undefined) {
      edge.label = updates.label
    }
    return edge
  }

  removeEdge(id) {
    const index = this.edges.findIndex(e => e.id === id)
    if (index === -1) return false
    this.edges.splice(index, 1)
    return true
  }

  // --- CONFIGURAÇÕES DO GRAFO ---

  setDirected(directed) {
    this.directed = !!directed
  }

  setWeighted(weighted) {
    this.weighted = !!weighted
    if (!this.weighted) {
      // Normaliza pesos para 1 quando não ponderado
      this.edges.forEach(e => {
        e.weight = 1
        e.label = ''
      })
    }
  }

  setName(name) {
    if (name && String(name).trim()) {
      this.name = String(name).trim()
    }
  }

  clear() {
    this.vertices = []
    this.edges = []
  }

  // --- MÉTODOS DE CONSULTA ---

  getIncidentEdges(vertexId) {
    const cleanId = String(vertexId).trim()
    return this.edges.filter(e => e.source === cleanId || e.target === cleanId)
  }

  getOutgoingEdges(vertexId) {
    const cleanId = String(vertexId).trim()
    if (this.directed) {
      return this.edges.filter(e => e.source === cleanId)
    }
    return this.edges.filter(e => e.source === cleanId || e.target === cleanId)
  }

  // --- SERIALIZAÇÃO & CLONAGEM ---

  toJSON() {
    return {
      name: this.name,
      directed: this.directed,
      weighted: this.weighted,
      vertices: this.vertices.map(v => ({
        id: v.id,
        label: v.label,
        x: Number(v.x?.toFixed(2) || 0),
        y: Number(v.y?.toFixed(2) || 0),
        z: Number(v.z?.toFixed(2) || 0),
        type: v.type || 'standard'
      })),
      edges: this.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        weight: e.weight,
        label: e.label
      }))
    }
  }

  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados JSON inválidos para criação do grafo.')
    }
    const graph = new GraphModel({
      name: data.name || 'Grafo Importado',
      directed: !!data.directed,
      weighted: data.weighted !== undefined ? !!data.weighted : true
    })

    if (Array.isArray(data.vertices)) {
      data.vertices.forEach(v => graph.addVertex(v))
    }
    if (Array.isArray(data.edges)) {
      data.edges.forEach(e => graph.addEdge(e))
    }
    return graph
  }

  clone() {
    return GraphModel.fromJSON(this.toJSON())
  }
}
