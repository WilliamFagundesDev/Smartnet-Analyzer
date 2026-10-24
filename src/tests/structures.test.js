import { describe, it, expect } from 'vitest'
import { PriorityQueue } from '../algorithms/priorityQueue.js'
import { UnionFind } from '../algorithms/unionFind.js'
import { GraphModel } from '../graph/graphModel.js'
import { AdjacencyList } from '../graph/adjacencyList.js'
import { AdjacencyMatrix } from '../graph/adjacencyMatrix.js'

describe('Estruturas de Dados Fundamentais', () => {
  describe('PriorityQueue (Min-Heap Binário)', () => {
    it('deve inserir elementos e extrair na ordem de menor prioridade (min-heap)', () => {
      const pq = new PriorityQueue()
      expect(pq.isEmpty()).toBe(true)

      pq.enqueue('B', 10)
      pq.enqueue('A', 2)
      pq.enqueue('C', 5)
      pq.enqueue('D', 1)

      expect(pq.size()).toBe(4)
      expect(pq.peek().element).toBe('D')

      expect(pq.dequeue().element).toBe('D') // prioridade 1
      expect(pq.dequeue().element).toBe('A') // prioridade 2
      expect(pq.dequeue().element).toBe('C') // prioridade 5
      expect(pq.dequeue().element).toBe('B') // prioridade 10
      expect(pq.isEmpty()).toBe(true)
      expect(pq.dequeue()).toBeNull()
    })

    it('deve lançar erro se prioridade não for número', () => {
      const pq = new PriorityQueue()
      expect(() => pq.enqueue('X', 'invalido')).toThrow()
    })
  })

  describe('UnionFind (DSU com Compressão de Caminho e Rank)', () => {
    it('deve gerenciar conjuntos disjuntos e detectar ciclos', () => {
      const dsu = new UnionFind(['A', 'B', 'C', 'D'])
      expect(dsu.getComponentCount()).toBe(4)

      // Conecta A e B
      expect(dsu.union('A', 'B')).toBe(true)
      expect(dsu.connected('A', 'B')).toBe(true)
      expect(dsu.getComponentCount()).toBe(3)

      // Conecta B e C -> A, B, C no mesmo conjunto
      expect(dsu.union('B', 'C')).toBe(true)
      expect(dsu.connected('A', 'C')).toBe(true)
      expect(dsu.getComponentCount()).toBe(2)

      // Tentar conectar A e C novamente deve retornar false (ciclo detectado!)
      expect(dsu.union('A', 'C')).toBe(false)
      expect(dsu.getComponentCount()).toBe(2)

      // Conecta D
      expect(dsu.union('C', 'D')).toBe(true)
      expect(dsu.getComponentCount()).toBe(1)
    })
  })

  describe('Lista de Adjacência', () => {
    it('deve representar conexões bidirecionais em grafos não direcionados', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'X' }, { id: 'Y' }],
        edges: [{ source: 'X', target: 'Y', weight: 8 }]
      })
      const adj = new AdjacencyList(g)

      const xNeighbors = adj.getNeighbors('X')
      const yNeighbors = adj.getNeighbors('Y')

      expect(xNeighbors).toHaveLength(1)
      expect(xNeighbors[0].vertex).toBe('Y')
      expect(xNeighbors[0].weight).toBe(8)

      expect(yNeighbors).toHaveLength(1)
      expect(yNeighbors[0].vertex).toBe('X')
      expect(yNeighbors[0].weight).toBe(8)
    })

    it('deve respeitar a direção em grafos direcionados', () => {
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'X' }, { id: 'Y' }],
        edges: [{ source: 'X', target: 'Y', weight: 4 }]
      })
      const adj = new AdjacencyList(g)

      expect(adj.getNeighbors('X')).toHaveLength(1)
      expect(adj.getNeighbors('X')[0].vertex).toBe('Y')
      expect(adj.getNeighbors('Y')).toHaveLength(0)
    })

    it('deve identificar vértices isolados', () => {
      const g = new GraphModel({
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'ISOLADO' }],
        edges: [{ source: 'A', target: 'B', weight: 1 }]
      })
      const adj = new AdjacencyList(g)
      expect(adj.getIsolatedVertices()).toContain('ISOLADO')
      expect(adj.getIsolatedVertices()).not.toContain('A')
    })
  })

  describe('Matriz de Adjacência', () => {
    it('deve preencher valores e representar ausência explicitamente com null, sem confundir com 0', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
        edges: [
          { source: 'A', target: 'B', weight: 0 }, // Peso ZERO real!
          { source: 'B', target: 'C', weight: 12 }
        ]
      })
      const matrix = new AdjacencyMatrix(g)

      // Diagonal: nós para si mesmos são 0
      expect(matrix.get('A', 'A')).toBe(0)
      expect(matrix.get('B', 'B')).toBe(0)
      expect(matrix.get('C', 'C')).toBe(0)

      // Peso zero real preservado entre A e B
      expect(matrix.get('A', 'B')).toBe(0)
      expect(matrix.get('B', 'A')).toBe(0)

      // Conexão B - C
      expect(matrix.get('B', 'C')).toBe(12)
      expect(matrix.get('C', 'B')).toBe(12)

      // Ausência entre A e C é estritamente null
      expect(matrix.get('A', 'C')).toBeNull()
      expect(matrix.get('C', 'A')).toBeNull()
    })
  })
})
