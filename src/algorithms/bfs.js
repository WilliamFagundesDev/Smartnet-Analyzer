import { AdjacencyList } from '../graph/adjacencyList.js'

/**
 * Algoritmo Breadth-First Search (Busca em Largura)
 * Calcula a árvore de busca e caminhos mínimos em número de arestas (distância não-ponderada).
 * Utiliza fila FIFO real e gera eventos didáticos passo a passo.
 * 
 * Complexidade:
 *  - Temporal: O(V + E) com Lista de Adjacência
 *  - Espacial: O(V) para Fila FIFO, tabela de distâncias e predecessores
 * 
 * @param {import('../graph/graphModel.js').GraphModel} graph
 * @param {string} startVertexId
 * @param {string} [targetVertexId]
 * @returns {Object} Resultado analítico e eventos
 */
export function runBFS(graph, startVertexId, targetVertexId = null) {
  if (!graph || graph.vertices.length === 0) {
    throw new Error('Não é possível executar BFS em um grafo vazio.')
  }
  if (!startVertexId || !graph.hasVertex(startVertexId)) {
    throw new Error(`Vértice de origem "${startVertexId}" não existe no grafo.`)
  }
  if (targetVertexId && !graph.hasVertex(targetVertexId)) {
    throw new Error(`Vértice de destino "${targetVertexId}" não existe no grafo.`)
  }

  const adjList = new AdjacencyList(graph)
  const visited = new Set()
  const visitedOrder = []
  const distances = {}
  const predecessors = {}
  const treeEdges = []
  const events = []
  let step = 0

  // Inicializa distâncias como Infinity e predecessores como null
  for (const v of graph.vertices) {
    distances[v.id] = Infinity
    predecessors[v.id] = null
  }

  /** @type {string[]} Fila FIFO real */
  const queue = []

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
      queue: [...queue],
      visited: [...visitedOrder],
      distances: { ...distances },
      predecessors: { ...predecessors }
    })
  }

  // Inicialização na raiz
  visited.add(startVertexId)
  distances[startVertexId] = 0
  queue.push(startVertexId)

  addEvent('START', {
    currentVertex: startVertexId,
    description: `BFS iniciada a partir de "${startVertexId}". Distância inicial: 0 arestas.`
  })

  addEvent('ENQUEUE', {
    currentVertex: startVertexId,
    description: `Nó raiz "${startVertexId}" inserido na fila de prioridade FIFO.`
  })

  let targetFound = false

  while (queue.length > 0) {
    const u = queue.shift()
    visitedOrder.push(u)

    addEvent('DEQUEUE', {
      currentVertex: u,
      description: `Desenfileirando "${u}" para processar seus vizinhos (Nível de profundidade: ${distances[u]} arestas).`
    })

    if (targetVertexId && u === targetVertexId) {
      targetFound = true
      addEvent('TARGET_REACHED', {
        currentVertex: u,
        description: `Destino desejado "${targetVertexId}" alcançado em ${distances[u]} arestas!`
      })
      break
    }

    const neighbors = adjList.getNeighbors(u)

    for (const edgeInfo of neighbors) {
      const v = edgeInfo.vertex

      addEvent('EXAMINE_EDGE', {
        currentVertex: u,
        targetVertex: v,
        edge: { source: u, target: v, weight: edgeInfo.weight, edgeId: edgeInfo.edgeId },
        description: `Examinando conexão (${u} -> ${v}).`
      })

      if (!visited.has(v)) {
        visited.add(v)
        distances[v] = distances[u] + 1
        predecessors[v] = u
        queue.push(v)

        const treeEdge = { source: u, target: v, weight: edgeInfo.weight, edgeId: edgeInfo.edgeId }
        treeEdges.push(treeEdge)

        addEvent('TREE_EDGE', {
          currentVertex: u,
          targetVertex: v,
          edge: treeEdge,
          description: `Vértice "${v}" descoberto pela primeira vez no nível ${distances[v]}. Enfileirado na FIFO.`
        })
      } else {
        addEvent('ALREADY_SEEN', {
          currentVertex: u,
          targetVertex: v,
          description: `Vértice vizinho "${v}" já foi descoberto anteriormente no nível ${distances[v]}. Conexão ignorada na árvore BFS.`
        })
      }
    }
  }

  // Reconstrução do caminho mínimo em arestas caso targetVertexId tenha sido fornecido
  let shortestPath = null
  let pathEdgeCount = null

  if (targetVertexId) {
    if (distances[targetVertexId] !== Infinity) {
      shortestPath = []
      let curr = targetVertexId
      while (curr !== null) {
        shortestPath.unshift(curr)
        curr = predecessors[curr]
      }
      pathEdgeCount = shortestPath.length - 1
    }
  }

  const unreachableVertices = graph.vertices
    .filter(v => distances[v.id] === Infinity)
    .map(v => v.id)

  addEvent('COMPLETE', {
    description: `Busca em Largura (BFS) finalizada. ${visitedOrder.length} vértices explorados.`
  })

  return {
    algorithm: 'BFS',
    startVertexId,
    targetVertexId,
    visitedOrder,
    distances,
    predecessors,
    treeEdges,
    shortestPath,
    pathEdgeCount,
    unreachableVertices,
    visitedCount: visitedOrder.length,
    totalVertices: graph.vertices.length,
    events,
    complexity: {
      time: 'O(V + E)',
      space: 'O(V)',
      dataStructure: 'Lista de Adjacência e Fila FIFO'
    }
  }
}
