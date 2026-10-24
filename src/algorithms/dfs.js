import { AdjacencyList } from '../graph/adjacencyList.js'

/**
 * Algoritmo Depth-First Search (Busca em Profundidade)
 * Implementação didática com geração de eventos passo a passo para visualização e reprodução.
 * 
 * Complexidade:
 *  - Temporal: O(V + E) utilizando Lista de Adjacência
 *  - Espacial: O(V) para a pilha de recursão/visita e conjunto de visitados
 * 
 * @param {import('../graph/graphModel.js').GraphModel} graph
 * @param {string} startVertexId Identificador da raiz de busca
 * @param {Object} [options]
 * @param {boolean} [options.exploreAllComponents=false] Percorrer floresta completa
 * @returns {Object} Resultado matemático e trilha de eventos
 */
export function runDFS(graph, startVertexId, options = {}) {
  const { exploreAllComponents = false } = options

  if (!graph || graph.vertices.length === 0) {
    throw new Error('Não é possível executar DFS em um grafo vazio.')
  }
  if (!startVertexId || !graph.hasVertex(startVertexId)) {
    throw new Error(`Vértice de origem "${startVertexId}" não existe no grafo.`)
  }

  const adjList = new AdjacencyList(graph)
  const visited = new Set()
  const visitedOrder = []
  const treeEdges = []
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
      stack: payload.stack ? [...payload.stack] : [],
      visited: [...visitedOrder],
      treeEdges: [...treeEdges]
    })
  }

  addEvent('START', {
    currentVertex: startVertexId,
    description: `Início da Busca em Profundidade (DFS) a partir do nó "${startVertexId}".`
  })

  // Pilha explícita para controle rigoroso e geração fiel de eventos
  // Cada quadro armazena: { u, neighbors, nextIndex, fromEdge }
  const callStack = []

  function exploreFrom(rootId) {
    visited.add(rootId)
    visitedOrder.push(rootId)

    callStack.push({
      vertex: rootId,
      neighbors: adjList.getNeighbors(rootId),
      nextNeighborIndex: 0,
      parentEdge: null
    })

    addEvent('VISIT', {
      currentVertex: rootId,
      stack: callStack.map(f => f.vertex),
      description: `Vértice "${rootId}" marcado como visitado (Ordem #${visitedOrder.length}).`
    })

    while (callStack.length > 0) {
      const topFrame = callStack[callStack.length - 1]
      const u = topFrame.vertex
      const neighbors = topFrame.neighbors

      if (topFrame.nextNeighborIndex < neighbors.length) {
        const edgeInfo = neighbors[topFrame.nextNeighborIndex]
        topFrame.nextNeighborIndex++
        const v = edgeInfo.vertex

        addEvent('EXAMINE_EDGE', {
          currentVertex: u,
          targetVertex: v,
          edge: { source: u, target: v, weight: edgeInfo.weight, edgeId: edgeInfo.edgeId },
          stack: callStack.map(f => f.vertex),
          description: `Examinando conexão (${u} -> ${v}, peso: ${edgeInfo.weight}).`
        })

        if (!visited.has(v)) {
          // Aresta de árvore
          visited.add(v)
          visitedOrder.push(v)
          const treeEdge = { source: u, target: v, weight: edgeInfo.weight, edgeId: edgeInfo.edgeId }
          treeEdges.push(treeEdge)

          addEvent('TREE_EDGE', {
            currentVertex: u,
            targetVertex: v,
            edge: treeEdge,
            stack: callStack.map(f => f.vertex),
            description: `Aresta (${u} -> ${v}) adicionada à árvore de busca DFS. Descendo para "${v}".`
          })

          callStack.push({
            vertex: v,
            neighbors: adjList.getNeighbors(v),
            nextNeighborIndex: 0,
            parentEdge: treeEdge
          })

          addEvent('VISIT', {
            currentVertex: v,
            stack: callStack.map(f => f.vertex),
            description: `Vértice "${v}" marcado como visitado (Ordem #${visitedOrder.length}).`
          })
        } else {
          // Já visitado: aresta de retorno / avanço / cruzamento
          addEvent('BACK_EDGE', {
            currentVertex: u,
            targetVertex: v,
            edge: { source: u, target: v, weight: edgeInfo.weight },
            stack: callStack.map(f => f.vertex),
            description: `Vértice vizinho "${v}" já foi visitado previamente. Retornando da aresta (${u} -> ${v}).`
          })
        }
      } else {
        // Concluiu todos os vizinhos de u: retrocede (backtrack)
        callStack.pop()
        addEvent('BACKTRACK', {
          currentVertex: u,
          stack: callStack.map(f => f.vertex),
          description: `Todos os vizinhos de "${u}" foram explorados. Retrocedendo na pilha de recursão.`
        })
      }
    }
  }

  // Executa para o nó inicial
  exploreFrom(startVertexId)

  // Se solicitado explorar todos os componentes conexos
  if (exploreAllComponents) {
    for (const v of graph.vertices) {
      if (!visited.has(v.id)) {
        addEvent('NEW_COMPONENT', {
          currentVertex: v.id,
          description: `Iniciando nova árvore da floresta DFS para o componente desconexo a partir de "${v.id}".`
        })
        exploreFrom(v.id)
      }
    }
  }

  const unreachableVertices = graph.vertices
    .filter(v => !visited.has(v.id))
    .map(v => v.id)

  addEvent('COMPLETE', {
    description: `DFS concluída com sucesso. ${visitedOrder.length} de ${graph.vertices.length} vértices explorados.`
  })

  return {
    algorithm: 'DFS',
    startVertexId,
    visitedOrder,
    treeEdges,
    visitedCount: visitedOrder.length,
    totalVertices: graph.vertices.length,
    treeEdgeCount: treeEdges.length,
    unreachableVertices,
    isCompleteTraversal: unreachableVertices.length === 0,
    events,
    complexity: {
      time: 'O(V + E)',
      space: 'O(V)',
      dataStructure: 'Lista de Adjacência e Pilha de Execução'
    }
  }
}
