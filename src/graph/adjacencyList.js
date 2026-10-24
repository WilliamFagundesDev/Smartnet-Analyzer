/**
 * Estrutura de Lista de Adjacência do SmartNet Analyzer
 * Implementação manual em JavaScript puro utilizando Map e Arrays.
 * Complexidade de Espaço: O(V + E)
 * Complexidade para iterar vizinhos de v: O(grau(v))
 */
export class AdjacencyList {
  /**
   * Constrói a lista de adjacência a partir de uma instância de GraphModel
   * @param {import('./graphModel.js').GraphModel} graph
   */
  constructor(graph) {
    this.directed = graph.directed
    this.weighted = graph.weighted
    /** @type {Map<string, Array<{ vertex: string, weight: number, edgeId: string, direction: 'outgoing'|'bidirectional' }>>} */
    this.adj = new Map()

    // Inicializa todos os vértices, mesmo os isolados
    for (const v of graph.vertices) {
      this.adj.set(v.id, [])
    }

    // Preenche as conexões conforme a direção do grafo
    for (const edge of graph.edges) {
      const u = edge.source
      const v = edge.target
      const weight = graph.weighted ? edge.weight : 1

      // Aresta u -> v
      if (this.adj.has(u)) {
        this.adj.get(u).push({
          vertex: v,
          weight,
          edgeId: edge.id,
          direction: this.directed ? 'outgoing' : 'bidirectional'
        })
      }

      // Se não-direcionado e não for auto-laço, adiciona também v -> u
      if (!this.directed && u !== v) {
        if (this.adj.has(v)) {
          this.adj.get(v).push({
            vertex: u,
            weight,
            edgeId: edge.id,
            direction: 'bidirectional'
          })
        }
      }
    }
  }

  /**
   * Retorna os vizinhos acessíveis a partir de um vértice
   * @param {string} vertexId
   * @returns {Array<{ vertex: string, weight: number, edgeId: string, direction: string }>}
   */
  getNeighbors(vertexId) {
    return this.adj.get(vertexId) || []
  }

  /**
   * Verifica se existe conexão de u para v
   * @param {string} u
   * @param {string} v
   * @returns {boolean}
   */
  hasEdge(u, v) {
    const neighbors = this.getNeighbors(u)
    return neighbors.some(n => n.vertex === v)
  }

  /**
   * Retorna o peso da aresta de u para v, ou null se não houver conexão
   * @param {string} u
   * @param {string} v
   * @returns {number|null}
   */
  getEdgeWeight(u, v) {
    const neighbors = this.getNeighbors(u)
    const found = neighbors.find(n => n.vertex === v)
    return found ? found.weight : null
  }

  /**
   * Retorna todos os identificadores de vértices presentes na lista
   * @returns {string[]}
   */
  getVertices() {
    return Array.from(this.adj.keys())
  }

  /**
   * Retorna o grau de saída do vértice (ou grau total no caso não direcionado)
   * @param {string} vertexId
   * @returns {number}
   */
  getOutDegree(vertexId) {
    return (this.adj.get(vertexId) || []).length
  }

  /**
   * Identifica vértices isolados (sem vizinhos nem conexões incidentes)
   * @returns {string[]}
   */
  getIsolatedVertices() {
    const incidentCount = new Map()
    for (const v of this.getVertices()) {
      incidentCount.set(v, 0)
    }

    for (const [u, neighbors] of this.adj.entries()) {
      incidentCount.set(u, incidentCount.get(u) + neighbors.length)
      if (this.directed) {
        for (const n of neighbors) {
          incidentCount.set(n.vertex, incidentCount.get(n.vertex) + 1)
        }
      }
    }

    const isolated = []
    for (const [v, count] of incidentCount.entries()) {
      if (count === 0) isolated.push(v)
    }
    return isolated
  }

  /**
   * Retorna representação estruturada para renderização visual e didática
   * @returns {Array<{ vertex: string, neighbors: Array<{ vertex: string, weight: number, edgeId: string }> }>}
   */
  toInspectionData() {
    const result = []
    for (const [vertex, neighbors] of this.adj.entries()) {
      result.push({
        vertex,
        neighbors: neighbors.map(n => ({
          vertex: n.vertex,
          weight: n.weight,
          edgeId: n.edgeId,
          direction: n.direction
        }))
      })
    }
    return result
  }
}
