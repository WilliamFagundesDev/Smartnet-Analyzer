/**
 * Min-Priority Queue implementada com Min-Heap Binário
 * Utilizada para otimizar a extração do vértice de menor distância no algoritmo de Dijkstra.
 * Complexidade:
 *  - Inserção (enqueue): O(log N)
 *  - Extração do mínimo (dequeue): O(log N)
 *  - Consulta ao topo (peek): O(1)
 */
export class PriorityQueue {
  constructor() {
    this.heap = []
  }

  /**
   * Enfileira um elemento com sua prioridade (peso/distância)
   * @param {*} element Identificador ou carga útil do nó
   * @param {number} priority Valor numérico da prioridade (menor = maior prioridade)
   */
  enqueue(element, priority) {
    if (typeof priority !== 'number' || isNaN(priority)) {
      throw new Error(`Prioridade inválida fornecida à fila: ${priority}`)
    }
    const node = { element, priority }
    this.heap.push(node)
    this._bubbleUp(this.heap.length - 1)
  }

  /**
   * Remove e retorna o elemento de menor prioridade
   * @returns {{ element: *, priority: number } | null}
   */
  dequeue() {
    if (this.isEmpty()) return null
    const min = this.heap[0]
    const end = this.heap.pop()
    if (this.heap.length > 0) {
      this.heap[0] = end
      this._sinkDown(0)
    }
    return min
  }

  /**
   * Consulta o elemento de menor prioridade sem removê-lo
   */
  peek() {
    return this.isEmpty() ? null : this.heap[0]
  }

  /**
   * Verifica se a fila está vazia
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0
  }

  /**
   * Quantidade de itens na fila
   * @returns {number}
   */
  size() {
    return this.heap.length
  }

  /**
   * Retorna um snapshot legível dos elementos na fila
   * @returns {Array<{ element: *, priority: number }>}
   */
  toArray() {
    return this.heap.map(item => ({ ...item }))
  }

  /**
   * Limpa a fila
   */
  clear() {
    this.heap = []
  }

  // --- Métodos Internos do Min-Heap ---

  _bubbleUp(index) {
    const node = this.heap[index]
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const parent = this.heap[parentIndex]
      if (node.priority >= parent.priority) break
      this.heap[index] = parent
      index = parentIndex
    }
    this.heap[index] = node
  }

  _sinkDown(index) {
    const length = this.heap.length
    const node = this.heap[index]

    while (true) {
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2
      let swapIndex = null

      if (leftChildIndex < length) {
        if (this.heap[leftChildIndex].priority < node.priority) {
          swapIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const comparePriority = swapIndex === null ? node.priority : this.heap[leftChildIndex].priority
        if (this.heap[rightChildIndex].priority < comparePriority) {
          swapIndex = rightChildIndex
        }
      }

      if (swapIndex === null) break

      this.heap[index] = this.heap[swapIndex]
      index = swapIndex
    }
    this.heap[index] = node
  }
}
