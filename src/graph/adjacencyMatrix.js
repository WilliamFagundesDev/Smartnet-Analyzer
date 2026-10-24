/**
 * Estrutura de Matriz de Adjacência do SmartNet Analyzer
 * Implementação manual em JavaScript para fins analíticos e didáticos.
 * 
 * Convenção de representação de ausência:
 * - A ausência de aresta é representada por `null`.
 * - Não utilizamos 0 como ausência, garantindo que conexões reais de custo/peso zero
 *   sejam representadas com precisão matemática inequívoca.
 * - A diagonal (M[i][i]) representa auto-laço se houver peso, ou 0 indicando distância nula a si próprio.
 * 
 * Complexidade de Espaço: O(V²)
 * Complexidade de Consulta M[u][v]: O(1)
 */
export class AdjacencyMatrix {
  /**
   * Constrói a matriz de adjacência a partir do GraphModel
   * @param {import('./graphModel.js').GraphModel} graph
   */
  constructor(graph) {
    this.directed = graph.directed
    this.weighted = graph.weighted

    // Ordenação consistente dos vértices para os índices
    this.vertexIds = graph.vertices.map(v => v.id)
    this.indexMap = new Map()
    this.vertexIds.forEach((id, index) => {
      this.indexMap.set(id, index)
    })

    const size = this.vertexIds.length

    // Criação da matriz quadrada V x V inicializada com null
    this.matrix = Array.from({ length: size }, () => Array(size).fill(null))

    // Preenche a diagonal com 0 (distância de um nó a ele mesmo)
    for (let i = 0; i < size; i++) {
      this.matrix[i][i] = 0
    }

    // Preenche as arestas reais
    for (const edge of graph.edges) {
      const uIndex = this.indexMap.get(edge.source)
      const vIndex = this.indexMap.get(edge.target)

      if (uIndex !== undefined && vIndex !== undefined) {
        const weight = graph.weighted ? edge.weight : 1

        this.matrix[uIndex][vIndex] = weight

        // Em grafos não-direcionados a matriz é simétrica
        if (!this.directed) {
          this.matrix[vIndex][uIndex] = weight
        }
      }
    }
  }

  /**
   * Consulta o valor da conexão entre dois vértices
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {number|null} Peso numérico ou null se inexistente
   */
  get(sourceId, targetId) {
    const u = this.indexMap.get(sourceId)
    const v = this.indexMap.get(targetId)
    if (u === undefined || v === undefined) return null
    return this.matrix[u][v]
  }

  /**
   * Verifica se existe aresta entre source e target (desconsiderando diagonal padrão)
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {boolean}
   */
  hasEdge(sourceId, targetId) {
    const val = this.get(sourceId, targetId)
    if (sourceId === targetId) {
      // É auto-laço apenas se houver peso explicitamente atribuído por aresta
      return val !== null && val !== 0
    }
    return val !== null
  }

  /**
   * Retorna os rótulos dos vértices correspondentes às linhas e colunas
   * @returns {string[]}
   */
  getHeaders() {
    return [...this.vertexIds]
  }

  /**
   * Retorna os dados em formato de grade 2D para exibição em tabelas
   * @returns {Array<{ rowId: string, cells: Array<{ colId: string, value: number|null, isDiagonal: boolean, hasConnection: boolean }> }>}
   */
  toGridData() {
    return this.vertexIds.map((rowId, i) => ({
      rowId,
      cells: this.vertexIds.map((colId, j) => {
        const value = this.matrix[i][j]
        const isDiagonal = i === j
        const hasConnection = isDiagonal ? value !== 0 : value !== null
        return {
          colId,
          value,
          isDiagonal,
          hasConnection
        }
      })
    }))
  }
}
