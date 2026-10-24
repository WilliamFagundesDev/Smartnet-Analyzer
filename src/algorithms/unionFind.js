/**
 * Estrutura Disjoint Set Union (Union-Find)
 * Utilizada no algoritmo de Kruskal para detectar ciclos e gerenciar componentes conexos em tempo quase linear.
 * Otimizações:
 *  - Compressão de caminho (Path Compression)
 *  - União por rank / tamanho (Union by Rank)
 * Complexidade de tempo: O(α(V)) por operação, onde α é a função inversa de Ackermann (efetivamente constante ≤ 4).
 */
export class UnionFind {
  /**
   * Inicializa o DSU com uma lista de identificadores de vértices
   * @param {Iterable<string>} elements Lista de IDs
   */
  constructor(elements = []) {
    this.parent = new Map()
    this.rank = new Map()
    this.numComponents = 0

    for (const el of elements) {
      this.makeSet(el)
    }
  }

  /**
   * Adiciona um novo elemento como seu próprio conjunto
   * @param {string} x Identificador
   */
  makeSet(x) {
    if (!this.parent.has(x)) {
      this.parent.set(x, x)
      this.rank.set(x, 0)
      this.numComponents++
    }
  }

  /**
   * Encontra a raiz representante do conjunto contendo x, aplicando compressão de caminho.
   * @param {string} x Identificador
   * @returns {string} Raiz representante
   */
  find(x) {
    if (!this.parent.has(x)) {
      this.makeSet(x)
      return x
    }
    const currentParent = this.parent.get(x)
    if (currentParent !== x) {
      // Compressão de caminho: aponta diretamente para o representante raiz
      const root = this.find(currentParent)
      this.parent.set(x, root)
      return root
    }
    return x
  }

  /**
   * Une os conjuntos contendo x e y.
   * Retorna true se foram unidos (estavam em conjuntos distintos),
   * ou false se já pertenciam ao mesmo conjunto (formaria ciclo).
   * @param {string} x
   * @param {string} y
   * @returns {boolean} True se a união ocorreu, False se já estavam conectados
   */
  union(x, y) {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) {
      return false // Já no mesmo conjunto: adicionar aresta geraria ciclo
    }

    const rankX = this.rank.get(rootX) || 0
    const rankY = this.rank.get(rootY) || 0

    // União por rank para manter a árvore balanceada
    if (rankX < rankY) {
      this.parent.set(rootX, rootY)
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX)
    } else {
      this.parent.set(rootY, rootX)
      this.rank.set(rootX, rankX + 1)
    }

    this.numComponents--
    return true
  }

  /**
   * Verifica se x e y pertencem ao mesmo conjunto
   * @param {string} x
   * @param {string} y
   * @returns {boolean}
   */
  connected(x, y) {
    return this.find(x) === this.find(y)
  }

  /**
   * Retorna a quantidade de componentes disjuntos atuais
   * @returns {number}
   */
  getComponentCount() {
    return this.numComponents
  }

  /**
   * Retorna um mapa dos componentes e seus membros
   * @returns {Map<string, string[]>}
   */
  getComponents() {
    const groups = new Map()
    for (const key of this.parent.keys()) {
      const root = this.find(key)
      if (!groups.has(root)) {
        groups.set(root, [])
      }
      groups.get(root).push(key)
    }
    return groups
  }
}
