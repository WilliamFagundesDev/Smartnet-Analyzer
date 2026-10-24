import { describe, it, expect } from 'vitest'
import { GraphModel } from '../graph/graphModel.js'
import { runDFS } from '../algorithms/dfs.js'
import { runBFS } from '../algorithms/bfs.js'
import { runDijkstra } from '../algorithms/dijkstra.js'
import { runKruskal } from '../algorithms/kruskal.js'

describe('Algoritmos de Grafos - Validação Matemática Rigorosa', () => {
  // Cenário 1: Grafo Vazio
  describe('1. Grafo Vazio', () => {
    const emptyGraph = new GraphModel()

    it('DFS deve lançar erro ao tentar executar em grafo vazio', () => {
      expect(() => runDFS(emptyGraph, 'A')).toThrow(/grafo vazio/)
    })
    it('BFS deve lançar erro ao tentar executar em grafo vazio', () => {
      expect(() => runBFS(emptyGraph, 'A')).toThrow(/grafo vazio/)
    })
    it('Dijkstra deve lançar erro ao tentar executar em grafo vazio', () => {
      expect(() => runDijkstra(emptyGraph, 'A')).toThrow(/grafo vazio/)
    })
    it('Kruskal deve lançar erro ao tentar executar em grafo vazio', () => {
      expect(() => runKruskal(emptyGraph)).toThrow(/grafo vazio/)
    })
  })

  // Cenário 2: Grafo com um único vértice isolado
  describe('2. Grafo com um Vértice Isolado', () => {
    const singleGraph = new GraphModel({
      vertices: [{ id: 'SOLO' }]
    })

    it('DFS deve visitar o único vértice e reportar 0 arestas de árvore', () => {
      const res = runDFS(singleGraph, 'SOLO')
      expect(res.visitedOrder).toEqual(['SOLO'])
      expect(res.treeEdges).toHaveLength(0)
      expect(res.unreachableVertices).toHaveLength(0)
    })

    it('BFS deve retornar distância 0 para si mesmo e caminho unitário', () => {
      const res = runBFS(singleGraph, 'SOLO', 'SOLO')
      expect(res.distances['SOLO']).toBe(0)
      expect(res.shortestPath).toEqual(['SOLO'])
      expect(res.pathEdgeCount).toBe(0)
    })

    it('Dijkstra deve retornar distância 0 e nenhum predecessor', () => {
      const res = runDijkstra(singleGraph, 'SOLO')
      expect(res.distances['SOLO']).toBe(0)
      expect(res.predecessors['SOLO']).toBeNull()
    })

    it('Kruskal deve retornar AGM vazia (0 arestas) com 1 componente e custo 0', () => {
      const res = runKruskal(singleGraph)
      expect(res.mstEdges).toHaveLength(0)
      expect(res.totalCost).toBe(0)
      expect(res.isSpanningTree).toBe(true)
      expect(res.componentCount).toBe(1)
    })
  })

  // Cenário 3 & 4: DFS - Grafo Conexo e Desconexo
  describe('3. DFS - Depth-First Search', () => {
    it('deve percorrer grafo conexo, registrar árvore de busca e evitar revisitas', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
        edges: [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 2 },
          { source: 'C', target: 'D', weight: 3 },
          { source: 'D', target: 'A', weight: 4 }
        ]
      })

      const res = runDFS(g, 'A')
      expect(res.visitedCount).toBe(4)
      expect(res.treeEdges).toHaveLength(3) // Em grafo conexo de 4 vértices, a árvore de busca tem 3 arestas
      expect(res.unreachableVertices).toHaveLength(0)
      expect(res.isCompleteTraversal).toBe(true)
    })

    it('deve identificar nós inalcançáveis em grafo desconexo', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'ISOLADO_1' }, { id: 'ISOLADO_2' }],
        edges: [{ source: 'A', target: 'B', weight: 1 }]
      })

      const res = runDFS(g, 'A', { exploreAllComponents: false })
      expect(res.visitedOrder).toEqual(['A', 'B'])
      expect(res.unreachableVertices).toEqual(['ISOLADO_1', 'ISOLADO_2'])
      expect(res.isCompleteTraversal).toBe(false)
    })

    it('deve explorar floresta completa quando exploreAllComponents for true', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
        edges: [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'C', target: 'D', weight: 2 }
        ]
      })

      const res = runDFS(g, 'A', { exploreAllComponents: true })
      expect(res.visitedCount).toBe(4)
      expect(res.unreachableVertices).toHaveLength(0)
    })
  })

  // Cenário 5 & 6: BFS - Busca em Largura e Menor Número de Arestas
  describe('4. BFS - Breadth-First Search', () => {
    it('deve calcular níveis de profundidade (hops) estritamente por número de arestas', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
        edges: [
          { source: 'A', target: 'B', weight: 100 },
          { source: 'A', target: 'C', weight: 100 },
          { source: 'B', target: 'D', weight: 100 },
          { source: 'C', target: 'E', weight: 100 }
        ]
      })

      const res = runBFS(g, 'A')
      expect(res.distances['A']).toBe(0)
      expect(res.distances['B']).toBe(1)
      expect(res.distances['C']).toBe(1)
      expect(res.distances['D']).toBe(2)
      expect(res.distances['E']).toBe(2)
    })

    it('deve respeitar a direção de grafos direcionados', () => {
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
        edges: [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 1 }
        ]
      })

      // Inicia em C (que não tem arestas saindo)
      const res = runBFS(g, 'C')
      expect(res.visitedOrder).toEqual(['C'])
      expect(res.unreachableVertices).toEqual(['A', 'B'])
      expect(res.distances['A']).toBe(Infinity)
      expect(res.distances['B']).toBe(Infinity)
    })

    it('deve reconstruir caminho mínimo em arestas até o destino', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
        edges: [
          { source: '1', target: '2', weight: 1 },
          { source: '2', target: '3', weight: 1 },
          { source: '3', target: '4', weight: 1 }
        ]
      })

      const res = runBFS(g, '1', '4')
      expect(res.shortestPath).toEqual(['1', '2', '3', '4'])
      expect(res.pathEdgeCount).toBe(3)
    })
  })

  // Cenário 7, 8, 9, 10, 11: Dijkstra e Comparação
  describe('5. Dijkstra - Menor Caminho Ponderado', () => {
    it('deve rejeitar arestas com pesos negativos estritamente', () => {
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'A' }, { id: 'B' }],
        edges: [{ source: 'A', target: 'B', weight: -3 }]
      })

      expect(() => runDijkstra(g, 'A')).toThrow(/não suporta pesos negativos/)
    })

    it('deve calcular corretamente caminhos ponderados com pesos zero', () => {
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
        edges: [
          { source: 'A', target: 'B', weight: 0 },
          { source: 'B', target: 'C', weight: 5 }
        ]
      })

      const res = runDijkstra(g, 'A')
      expect(res.distances['A']).toBe(0)
      expect(res.distances['B']).toBe(0)
      expect(res.distances['C']).toBe(5)
    })

    it('deve preferir caminho com MAIS arestas se o custo acumulado for MENOR (Dijkstra vs BFS)', () => {
      // Cenário clássico:
      // A -> D direto tem custo 15 (1 aresta)
      // A -> B (2) -> C (3) -> D (1) tem custo total 6 (3 arestas)
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
        edges: [
          { source: 'A', target: 'D', weight: 15 },
          { source: 'A', target: 'B', weight: 2 },
          { source: 'B', target: 'C', weight: 3 },
          { source: 'C', target: 'D', weight: 1 }
        ]
      })

      const bfsRes = runBFS(g, 'A', 'D')
      const dijkstraRes = runDijkstra(g, 'A', 'D')

      // BFS escolhe o caminho direto (menor número de arestas: 1)
      expect(bfsRes.shortestPath).toEqual(['A', 'D'])
      expect(bfsRes.pathEdgeCount).toBe(1)

      // Dijkstra escolhe o caminho de menor custo total (6 < 15, com 3 arestas)
      expect(dijkstraRes.targetPath).toEqual(['A', 'B', 'C', 'D'])
      expect(dijkstraRes.targetCost).toBe(6)
    })

    it('deve identificar vértices inalcançáveis com distância Infinity', () => {
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'ISOLADO' }],
        edges: [{ source: 'A', target: 'B', weight: 4 }]
      })

      const res = runDijkstra(g, 'A')
      expect(res.distances['ISOLADO']).toBe(Infinity)
      expect(res.unreachableVertices).toContain('ISOLADO')
    })
  })

  // Cenário 12, 13, 14, 15: Kruskal - Árvore Geradora Mínima
  describe('6. Kruskal - Árvore Geradora Mínima (AGM)', () => {
    it('deve rejeitar grafos direcionados com mensagem explicativa', () => {
      const g = new GraphModel({
        directed: true,
        vertices: [{ id: 'A' }, { id: 'B' }],
        edges: [{ source: 'A', target: 'B', weight: 1 }]
      })

      expect(() => runKruskal(g)).toThrow(/NÃO-DIRECIONADOS/)
    })

    it('deve calcular a AGM exata em grafo conexo (V - 1 arestas, sem ciclos e custo mínimo comprovado)', () => {
      // Grafo canônico de 4 vértices
      // Arestas:
      // (A, D, 2)
      // (B, C, 3)
      // (A, B, 4)
      // (C, D, 6)
      // (A, C, 7)
      // V = 4 -> AGM precisa de 4 - 1 = 3 arestas.
      // Arestas esperadas: (A, D, 2) + (B, C, 3) + (A, B, 4) = Custo 9.
      // Aresta (C, D, 6) é rejeitada porque A, B, C, D já estão conectados (formaria ciclo).
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
        edges: [
          { id: 'e1', source: 'A', target: 'B', weight: 4 },
          { id: 'e2', source: 'B', target: 'C', weight: 3 },
          { id: 'e3', source: 'C', target: 'D', weight: 6 },
          { id: 'e4', source: 'D', target: 'A', weight: 2 },
          { id: 'e5', source: 'A', target: 'C', weight: 7 }
        ]
      })

      const res = runKruskal(g)

      expect(res.mstEdges).toHaveLength(3)
      expect(res.totalCost).toBe(9)
      expect(res.isSpanningTree).toBe(true)
      expect(res.isForest).toBe(false)
      expect(res.componentCount).toBe(1)
      expect(res.rejectedEdges.length).toBeGreaterThan(0)
      expect(res.rejectedEdges.some(e => e.source === 'C' && e.target === 'D')).toBe(true)
    })

    it('deve produzir floresta geradora mínima em grafo desconexo', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
        edges: [
          { id: 'e1', source: 'A', target: 'B', weight: 2 },
          { id: 'e2', source: 'C', target: 'D', weight: 3 }
        ]
      })

      const res = runKruskal(g)
      expect(res.mstEdges).toHaveLength(2)
      expect(res.totalCost).toBe(5)
      expect(res.isSpanningTree).toBe(false)
      expect(res.isForest).toBe(true)
      expect(res.componentCount).toBe(2)
    })

    it('deve tratar arestas com pesos iguais de forma determinística e sem gerar ciclos', () => {
      const g = new GraphModel({
        directed: false,
        vertices: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
        edges: [
          { id: 'e1', source: 'A', target: 'B', weight: 5 },
          { id: 'e2', source: 'B', target: 'C', weight: 5 },
          { id: 'e3', source: 'A', target: 'C', weight: 5 }
        ]
      })

      const res = runKruskal(g)
      expect(res.mstEdges).toHaveLength(2) // 3 vértices -> exatamente 2 arestas na AGM
      expect(res.rejectedEdges).toHaveLength(1) // 1 aresta forma ciclo e é rejeitada
      expect(res.totalCost).toBe(10)
      expect(res.isSpanningTree).toBe(true)
    })
  })
})
