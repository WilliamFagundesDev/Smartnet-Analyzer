import { AdjacencyList } from './adjacencyList.js'

/**
 * Módulo de Métricas e Propriedades Reais do Grafo
 * Todos os cálculos são derivados estritamente da estrutura do grafo.
 */

/**
 * Calcula todas as métricas topológicas fundamentais do grafo
 * @param {import('./graphModel.js').GraphModel} graph
 * @returns {Object}
 */
export function calculateGraphMetrics(graph) {
  const V = graph.vertices.length
  const E = graph.edges.length

  if (V === 0) {
    return {
      vertexCount: 0,
      edgeCount: 0,
      density: 0,
      connectedComponentsCount: 0,
      isConnected: false,
      isolatedCount: 0,
      isolatedVertices: [],
      minDegree: 0,
      maxDegree: 0,
      avgDegree: 0,
      totalWeight: 0
    }
  }

  // Densidade
  let density = 0
  if (V > 1) {
    const maxEdges = graph.directed ? V * (V - 1) : (V * (V - 1)) / 2
    density = maxEdges > 0 ? Number((E / maxEdges).toFixed(4)) : 0
  }

  // Graus dos vértices
  const degrees = new Map()
  graph.vertices.forEach(v => degrees.set(v.id, 0))

  graph.edges.forEach(e => {
    degrees.set(e.source, (degrees.get(e.source) || 0) + 1)
    if (!graph.directed && e.source !== e.target) {
      degrees.set(e.target, (degrees.get(e.target) || 0) + 1)
    }
  })

  const degValues = Array.from(degrees.values())
  const minDegree = Math.min(...degValues)
  const maxDegree = Math.max(...degValues)
  const avgDegree = Number((degValues.reduce((a, b) => a + b, 0) / V).toFixed(2))

  // Vértices isolados (grau 0)
  const isolatedVertices = graph.vertices
    .filter(v => (degrees.get(v.id) || 0) === 0)
    .map(v => v.id)

  // Componentes conexos (calculados através de percurso BFS)
  const componentsCount = computeConnectedComponentsCount(graph)
  const isConnected = V > 0 && componentsCount === 1

  // Soma dos pesos das arestas
  const totalWeight = graph.edges.reduce((sum, e) => sum + (Number(e.weight) || 0), 0)

  return {
    vertexCount: V,
    edgeCount: E,
    density,
    connectedComponentsCount: componentsCount,
    isConnected,
    isolatedCount: isolatedVertices.length,
    isolatedVertices,
    minDegree,
    maxDegree,
    avgDegree,
    totalWeight: Number(totalWeight.toFixed(2))
  }
}

/**
 * Determina o número de componentes conexos no grafo
 * Para grafos direcionados, calcula componentes fracamente conexos (tratando arestas como bidirecionais).
 * @param {import('./graphModel.js').GraphModel} graph
 * @returns {number}
 */
export function computeConnectedComponentsCount(graph) {
  if (graph.vertices.length === 0) return 0

  // Cria estrutura bidirecional temporária para componente conexo
  const adj = new Map()
  graph.vertices.forEach(v => adj.set(v.id, []))

  graph.edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source).push(e.target)
      adj.get(e.target).push(e.source)
    }
  })

  const visited = new Set()
  let components = 0

  for (const vertex of graph.vertices) {
    if (!visited.has(vertex.id)) {
      components++
      // BFS simples para marcar todos do componente
      const queue = [vertex.id]
      visited.add(vertex.id)

      while (queue.length > 0) {
        const current = queue.shift()
        const neighbors = adj.get(current) || []
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }
    }
  }

  return components
}
