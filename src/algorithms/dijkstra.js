import { AdjacencyList } from '../graph/adjacencyList.js'
import { PriorityQueue } from './priorityQueue.js'

/**
 * Algoritmo de Dijkstra para Menor Caminho em Grafos com Pesos Não-Negativos
 * Utiliza Min-Heap Binário (PriorityQueue) e Lista de Adjacência.
 * 
 * Complexidade:
 *  - Temporal: O((V + E) log V)
 *  - Espacial: O(V) para distâncias, predecessores e heap
 * 
 * @param {import('../graph/graphModel.js').GraphModel} graph
 * @param {string} startVertexId Vértice de origem
 * @param {string} [targetVertexId] Vértice de destino opcional
 * @returns {Object} Menores distâncias, caminhos reconstruídos e trilha didática
 */
export function runDijkstra(graph, startVertexId, targetVertexId = null) {
  if (!graph || graph.vertices.length === 0) {
    throw new Error('Não é possível executar Dijkstra em um grafo vazio.')
  }
  if (!startVertexId || !graph.hasVertex(startVertexId)) {
    throw new Error(`Vértice de origem "${startVertexId}" não existe no grafo.`)
  }
  if (targetVertexId && !graph.hasVertex(targetVertexId)) {
    throw new Error(`Vértice de destino "${targetVertexId}" não existe no grafo.`)
  }

  // Validação estrita de pesos não-negativos
  const negativeEdge = graph.edges.find(e => Number(e.weight) < 0)
  if (negativeEdge) {
    throw new Error(
      `O Algoritmo de Dijkstra não suporta pesos negativos. Aresta (${negativeEdge.source} -> ${negativeEdge.target}) possui peso ${negativeEdge.weight}. Para pesos negativos, utilize algoritmos como Bellman-Ford.`
    )
  }

  const adjList = new AdjacencyList(graph)
  const distances = {}
  const predecessors = {}
  const settled = new Set()
  const settledOrder = []
  const pq = new PriorityQueue()
  const events = []
  let step = 0

  function addEvent(type, payload = {}) {
    step++
    events.push({
      step,
      type,
      timestamp: Date.now(),
      description: payload.description || '',
      currentVertex: payload.currentVertex || null,
      targetVertex: payload.targetVertex || null,
      edge: payload.edge || null,
      distances: { ...distances },
      predecessors: { ...predecessors },
      settled: [...settledOrder],
      pqState: pq.toArray().map(item => ({ vertex: item.element, dist: item.priority }))
    })
  }

  // 1. Inicialização
  for (const v of graph.vertices) {
    distances[v.id] = Infinity
    predecessors[v.id] = null
  }
  distances[startVertexId] = 0
  pq.enqueue(startVertexId, 0)

  addEvent('INIT', {
    currentVertex: startVertexId,
    description: `Inicialização de Dijkstra: dist[${startVertexId}] = 0, demais distâncias definidas como ∞. Raiz enfileirada no Min-Heap.`
  })

  while (!pq.isEmpty()) {
    const { element: u, priority: currentDist } = pq.dequeue()

    // Se já foi processado definitivamente com custo menor, ignora duplicata lazy do heap
    if (settled.has(u)) {
      continue
    }

    settled.add(u)
    settledOrder.push(u)

    addEvent('EXTRACT_MIN', {
      currentVertex: u,
      description: `Extraído nó "${u}" do Min-Heap com menor distância provada: ${currentDist}. Vértice fixado como permanente.`
    })

    if (targetVertexId && u === targetVertexId) {
      addEvent('DESTINATION_REACHED', {
        currentVertex: u,
        description: `Destino "${targetVertexId}" alcançado com custo ótimo mínimo de ${currentDist}!`
      })
      break
    }

    const neighbors = adjList.getNeighbors(u)

    for (const edgeInfo of neighbors) {
      const v = edgeInfo.vertex
      const weight = edgeInfo.weight

      addEvent('EXAMINE_EDGE', {
        currentVertex: u,
        targetVertex: v,
        edge: { source: u, target: v, weight, edgeId: edgeInfo.edgeId },
        description: `Avaliando relaxamento da aresta (${u} -> ${v}, peso: ${weight}). Custo atual para "${v}": ${distances[v] === Infinity ? '∞' : distances[v]}.`
      })

      if (settled.has(v)) {
        addEvent('NO_RELAX', {
          currentVertex: u,
          targetVertex: v,
          description: `Vértice "${v}" já está definitivamente fixado. Nenhuma atualização necessária.`
        })
        continue
      }

      const newDist = distances[u] + weight

      if (newDist < distances[v]) {
        const oldDist = distances[v]
        distances[v] = newDist
        predecessors[v] = u
        pq.enqueue(v, newDist)

        addEvent('RELAX_EDGE', {
          currentVertex: u,
          targetVertex: v,
          edge: { source: u, target: v, weight, edgeId: edgeInfo.edgeId },
          description: `RELAXAMENTO: Caminho via "${u}" é mais curto (${newDist} < ${oldDist === Infinity ? '∞' : oldDist}). Atualizado dist[${v}] = ${newDist}.`
        })
      } else {
        addEvent('NO_RELAX', {
          currentVertex: u,
          targetVertex: v,
          description: `Caminho via "${u}" (${newDist}) não é melhor que a melhor distância conhecida (${distances[v]}).`
        })
      }
    }
  }

  // Reconstrução do caminho para o destino se fornecido
  let targetPath = null
  let targetCost = null

  if (targetVertexId) {
    if (distances[targetVertexId] !== Infinity) {
      targetPath = []
      let curr = targetVertexId
      while (curr !== null) {
        targetPath.unshift(curr)
        curr = predecessors[curr]
      }
      targetCost = distances[targetVertexId]
    }
  }

  // Tabela completa de destinos e caminhos
  const distancesTable = graph.vertices.map(v => {
    const isReachable = distances[v.id] !== Infinity
    let path = []
    if (isReachable) {
      let curr = v.id
      while (curr !== null) {
        path.unshift(curr)
        curr = predecessors[curr]
      }
    }
    return {
      vertexId: v.id,
      label: v.label,
      distance: isReachable ? distances[v.id] : null,
      isReachable,
      predecessor: predecessors[v.id],
      pathString: isReachable ? path.join(' ➔ ') : 'Inalcançável',
      path
    }
  })

  const unreachableVertices = graph.vertices
    .filter(v => distances[v.id] === Infinity)
    .map(v => v.id)

  addEvent('COMPLETE', {
    description: `Execução de Dijkstra concluída. Calculados menores caminhos a partir de "${startVertexId}".`
  })

  return {
    algorithm: 'Dijkstra',
    startVertexId,
    targetVertexId,
    distances,
    predecessors,
    settledOrder,
    targetPath,
    targetCost,
    distancesTable,
    unreachableVertices,
    events,
    complexity: {
      time: 'O((V + E) log V)',
      space: 'O(V)',
      dataStructure: 'Lista de Adjacência e Min-Heap Binário'
    }
  }
}
