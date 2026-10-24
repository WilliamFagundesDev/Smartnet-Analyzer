import { UnionFind } from './unionFind.js'

/**
 * Algoritmo de Kruskal para Árvore Geradora Mínima (AGM / MST)
 * Utiliza estrutura Union-Find (DSU) com compressão de caminho e união por rank.
 * 
 * Complexidade:
 *  - Temporal: O(E log E) para ordenação das arestas + O(E * α(V)) para operações DSU
 *  - Espacial: O(V + E) para armazenamento das arestas e conjuntos disjuntos
 * 
 * @param {import('../graph/graphModel.js').GraphModel} graph
 * @returns {Object} Arestas da AGM, arestas rejeitadas, custo total e trilha de eventos
 */
export function runKruskal(graph) {
  if (!graph || graph.vertices.length === 0) {
    throw new Error('Não é possível executar Kruskal em um grafo vazio.')
  }

  // Validação estrita: Kruskal exige grafo não-direcionado
  if (graph.directed) {
    throw new Error(
      'O Algoritmo de Kruskal é definido para grafos NÃO-DIRECIONADOS. Converta o grafo nas configurações ou selecione um grafo compatível.'
    )
  }

  const V = graph.vertices.length
  const events = []
  let step = 0
  const mstEdges = []
  const rejectedEdges = []
  let totalCost = 0

  function addEvent(type, payload = {}) {
    step++
    events.push({
      step,
      type,
      timestamp: Date.now(),
      description: payload.description || '',
      edge: payload.edge || null,
      acceptedEdges: [...(payload.acceptedEdges || mstEdges)],
      rejectedEdges: [...(payload.rejectedEdges || rejectedEdges)],
      currentComponents: payload.currentComponents || dsu.getComponentCount(),
      totalCost
    })
  }

  // 1. Inicializa o DSU com todos os vértices
  const vertexIds = graph.vertices.map(v => v.id)
  const dsu = new UnionFind(vertexIds)

  // 2. Coleta e normaliza as arestas únicas (evitando duplicatas reversas)
  const edgesList = graph.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    weight: typeof e.weight === 'number' ? e.weight : 1,
    label: e.label
  }))

  // 3. Ordenação das arestas por peso (não-decrescente)
  // Em caso de empate de peso, desempate consistente pelo ID da aresta
  const sortedEdges = [...edgesList].sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight
    return a.id.localeCompare(b.id)
  })

  addEvent('START', {
    description: `Início do Algoritmo de Kruskal. Grafo possui ${V} vértices e ${sortedEdges.length} arestas.`
  })

  addEvent('SORT_EDGES', {
    description: `Arestas ordenadas em ordem não-decrescente de peso. Menor peso: ${sortedEdges[0]?.weight ?? 'N/A'}, Maior peso: ${sortedEdges[sortedEdges.length - 1]?.weight ?? 'N/A'}.`
  })

  // 4. Processamento guloso das arestas
  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i]
    const u = edge.source
    const v = edge.target

    addEvent('EXAMINE_EDGE', {
      edge,
      description: `[${i + 1}/${sortedEdges.length}] Avaliando aresta (${u} - ${v}, peso: ${edge.weight}). Verificando conjuntos DSU.`
    })

    // Se u e v já estão no mesmo conjunto, a aresta formaria ciclo
    if (dsu.connected(u, v)) {
      const rejectedEdge = { ...edge, reason: 'CYCLE' }
      rejectedEdges.push(rejectedEdge)

      addEvent('REJECT_CYCLE', {
        edge: rejectedEdge,
        description: `REJEITADA: Nós "${u}" e "${v}" já pertencem ao mesmo componente. Conexão formaria um ciclo indesejado.`
      })
    } else {
      // Une os conjuntos
      dsu.union(u, v)
      mstEdges.push(edge)
      totalCost += edge.weight

      addEvent('ACCEPT_EDGE', {
        edge,
        description: `ACEITA: Aresta (${u} - ${v}) conecta componentes disjuntos. Adicionada à AGM. Custo acumulado: ${totalCost.toFixed(2)}.`
      })

      // Se a árvore já conectou todos os vértices, as próximas arestas formarão ciclos e serão registradas
    }
  }

  const finalComponents = dsu.getComponentCount()
  const isSpanningTree = V > 0 && (V === 1 || mstEdges.length === V - 1) && finalComponents === 1
  const isForest = finalComponents > 1

  addEvent('COMPLETE', {
    description: isSpanningTree
      ? `Árvore Geradora Mínima (AGM) completa obtida com ${mstEdges.length} arestas e custo total de ${totalCost.toFixed(2)}.`
      : `Floresta Geradora Mínima obtida com ${mstEdges.length} arestas em ${finalComponents} componentes desconexos. Custo: ${totalCost.toFixed(2)}.`
  })

  return {
    algorithm: 'Kruskal',
    mstEdges,
    rejectedEdges,
    totalCost: Number(totalCost.toFixed(2)),
    sortedEdges,
    edgeCountInMST: mstEdges.length,
    expectedEdgesForSingleTree: Math.max(0, V - 1),
    isSpanningTree,
    isForest,
    componentCount: finalComponents,
    events,
    complexity: {
      time: 'O(E log E)',
      space: 'O(V + E)',
      dataStructure: 'Union-Find (DSU com Compressão de Caminho e Rank) e Ordenação'
    }
  }
}
