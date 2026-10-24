/**
 * Módulo de Validação Estrutural e Algorítmica de Grafos
 * Oferece verificações rigorosas antes de manipulação e execução de algoritmos.
 */

/**
 * Validação geral da estrutura do grafo
 * @param {import('./graphModel.js').GraphModel} graph
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateGraphStructure(graph) {
  const errors = []
  const warnings = []

  if (!graph) {
    return { isValid: false, errors: ['Objeto do grafo é nulo ou indefinido.'], warnings: [] }
  }

  // 1. Vértices
  const vertexSet = new Set()
  for (const v of graph.vertices) {
    if (!v.id || String(v.id).trim() === '') {
      errors.push('Foi detectado um vértice sem identificador válido.')
    } else if (vertexSet.has(v.id)) {
      errors.push(`Identificador de vértice duplicado encontrado: "${v.id}".`)
    } else {
      vertexSet.add(v.id)
    }
  }

  if (graph.vertices.length === 0) {
    warnings.push('O grafo está vazio (0 vértices). Adicione vértices para realizar análises.')
  } else if (graph.vertices.length === 1) {
    warnings.push('O grafo possui apenas um vértice isolado.')
  }

  // 2. Arestas
  const edgePairSet = new Set()
  let hasSelfLoop = false

  for (const e of graph.edges) {
    if (!e.source || !e.target) {
      errors.push(`Aresta inválida detectada (origem ou destino nulos): ${JSON.stringify(e)}.`)
      continue
    }

    if (!vertexSet.has(e.source)) {
      errors.push(`Aresta refere-se a uma origem inexistente: "${e.source}".`)
    }
    if (!vertexSet.has(e.target)) {
      errors.push(`Aresta refere-se a um destino inexistente: "${e.target}".`)
    }

    if (e.source === e.target) {
      hasSelfLoop = true
      warnings.push(`Auto-laço detectado no vértice "${e.source}".`)
    }

    // Checagem de arestas paralelas
    const pairKey = graph.directed
      ? `${e.source}->${e.target}`
      : [e.source, e.target].sort().join('<->')

    if (edgePairSet.has(pairKey)) {
      errors.push(`Aresta paralela detectada entre "${e.source}" e "${e.target}". Apenas uma conexão é permitida por par de nós.`)
    } else {
      edgePairSet.add(pairKey)
    }

    // Checagem de peso
    if (graph.weighted) {
      if (typeof e.weight !== 'number' || isNaN(e.weight) || !isFinite(e.weight)) {
        errors.push(`Peso inválido detectado na aresta (${e.source} -> ${e.target}): ${e.weight}. Deve ser um número finito.`)
      }
    }
  }

  // 3. Vértices isolados
  const connectedVertices = new Set()
  for (const e of graph.edges) {
    connectedVertices.add(e.source)
    connectedVertices.add(e.target)
  }
  const isolated = graph.vertices.filter(v => !connectedVertices.has(v.id))
  if (isolated.length > 0 && graph.vertices.length > 1) {
    warnings.push(`Existem ${isolated.length} vértice(s) isolado(s): ${isolated.map(v => v.id).join(', ')}.`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validação específica para o algoritmo de Dijkstra
 * @param {import('./graphModel.js').GraphModel} graph
 * @param {string} startVertexId
 * @returns {{ canRun: boolean, message?: string }}
 */
export function validateDijkstra(graph, startVertexId) {
  if (!graph || graph.vertices.length === 0) {
    return { canRun: false, message: 'Não é possível executar Dijkstra em um grafo vazio.' }
  }

  if (!startVertexId || !graph.hasVertex(startVertexId)) {
    return { canRun: false, message: `Vértice de origem "${startVertexId}" não existe no grafo.` }
  }

  // Dijkstra não suporta pesos negativos
  if (graph.weighted) {
    const negativeEdge = graph.edges.find(e => e.weight < 0)
    if (negativeEdge) {
      return {
        canRun: false,
        message: `Dijkstra requer pesos estritamente não-negativos. Detectada aresta (${negativeEdge.source} -> ${negativeEdge.target}) com peso negativo: ${negativeEdge.weight}.`
      }
    }
  }

  return { canRun: true }
}

/**
 * Validação específica para o algoritmo de Kruskal
 * @param {import('./graphModel.js').GraphModel} graph
 * @returns {{ canRun: boolean, message?: string, isDirectedWarning?: boolean }}
 */
export function validateKruskal(graph) {
  if (!graph || graph.vertices.length === 0) {
    return { canRun: false, message: 'Não é possível executar Kruskal em um grafo vazio.' }
  }

  // Kruskal exige grafo não-direcionado
  if (graph.directed) {
    return {
      canRun: false,
      message: 'O algoritmo de Kruskal é formulado exclusivamente para grafos NÃO-DIRECIONADOS. Converta o grafo para não-direcionado ou selecione um grafo adequado.',
      isDirectedWarning: true
    }
  }

  return { canRun: true }
}

/**
 * Validação de dados JSON para importação
 * @param {*} data
 * @returns {{ isValid: boolean, error?: string, parsed?: any }}
 */
export function validateJSONImport(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'O arquivo JSON deve conter um objeto na raiz.' }
  }

  if (!Array.isArray(data.vertices)) {
    return { isValid: false, error: 'O JSON deve conter um array "vertices".' }
  }

  if (!Array.isArray(data.edges)) {
    return { isValid: false, error: 'O JSON deve conter um array "edges".' }
  }

  const vertexIds = new Set()
  for (let i = 0; i < data.vertices.length; i++) {
    const v = data.vertices[i]
    if (!v || !v.id) {
      return { isValid: false, error: `Vértice no índice ${i} não possui o campo "id".` }
    }
    const id = String(v.id).trim()
    if (vertexIds.has(id)) {
      return { isValid: false, error: `ID de vértice duplicado no JSON: "${id}".` }
    }
    vertexIds.add(id)
  }

  for (let i = 0; i < data.edges.length; i++) {
    const e = data.edges[i]
    if (!e || !e.source || !e.target) {
      return { isValid: false, error: `Aresta no índice ${i} deve conter "source" e "target".` }
    }
    if (!vertexIds.has(String(e.source).trim())) {
      return { isValid: false, error: `Aresta no índice ${i} referencia source inexistente: "${e.source}".` }
    }
    if (!vertexIds.has(String(e.target).trim())) {
      return { isValid: false, error: `Aresta no índice ${i} referencia target inexistente: "${e.target}".` }
    }
  }

  return { isValid: true }
}
