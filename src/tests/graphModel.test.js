import { describe, it, expect } from 'vitest'
import { GraphModel } from '../graph/graphModel.js'
import { validateGraphStructure, validateJSONImport } from '../graph/graphValidation.js'
import { calculateGraphMetrics } from '../graph/graphMetrics.js'

describe('GraphModel, Validação e Métricas', () => {
  it('deve adicionar, buscar e remover vértices com integridade referencial nas arestas', () => {
    const g = new GraphModel()
    g.addVertex({ id: 'V1', label: 'Vértice 1' })
    g.addVertex({ id: 'V2', label: 'Vértice 2' })
    g.addEdge({ source: 'V1', target: 'V2', weight: 10 })

    expect(g.vertices).toHaveLength(2)
    expect(g.edges).toHaveLength(1)

    // Remove V1: a aresta conectada a V1 deve ser removida automaticamente
    g.removeVertex('V1')
    expect(g.vertices).toHaveLength(1)
    expect(g.edges).toHaveLength(0)
    expect(g.hasVertex('V1')).toBe(false)
  })

  it('deve rejeitar vértices duplicados', () => {
    const g = new GraphModel()
    g.addVertex({ id: 'A' })
    expect(() => g.addVertex({ id: 'A' })).toThrow(/já existe/)
  })

  it('deve rejeitar arestas para vértices inexistentes', () => {
    const g = new GraphModel()
    g.addVertex({ id: 'A' })
    expect(() => g.addEdge({ source: 'A', target: 'INEXISTENTE' })).toThrow(/não existe/)
  })

  it('deve rejeitar arestas duplicadas/paralelas', () => {
    const g = new GraphModel({ directed: false })
    g.addVertex({ id: 'A' })
    g.addVertex({ id: 'B' })
    g.addEdge({ source: 'A', target: 'B', weight: 5 })

    expect(() => g.addEdge({ source: 'B', target: 'A', weight: 9 })).toThrow(/Já existe uma conexão/)
  })

  it('deve atualizar identificador de vértice e propagar para as arestas', () => {
    const g = new GraphModel()
    g.addVertex({ id: 'OLD' })
    g.addVertex({ id: 'TARGET' })
    g.addEdge({ source: 'OLD', target: 'TARGET', weight: 3 })

    g.updateVertex('OLD', { newId: 'NEW' })
    expect(g.hasVertex('NEW')).toBe(true)
    expect(g.hasVertex('OLD')).toBe(false)

    const edge = g.edges[0]
    expect(edge.source).toBe('NEW')
    expect(edge.target).toBe('TARGET')
  })

  it('deve calcular métricas topológicas reais com precisão', () => {
    const g = new GraphModel({ directed: false })
    // Triângulo: 3 vértices, 3 arestas -> Densidade 1.0, 1 componente conexo
    g.addVertex({ id: '1' })
    g.addVertex({ id: '2' })
    g.addVertex({ id: '3' })
    g.addEdge({ source: '1', target: '2', weight: 2 })
    g.addEdge({ source: '2', target: '3', weight: 4 })
    g.addEdge({ source: '3', target: '1', weight: 6 })

    const metrics = calculateGraphMetrics(g)
    expect(metrics.vertexCount).toBe(3)
    expect(metrics.edgeCount).toBe(3)
    expect(metrics.density).toBe(1.0)
    expect(metrics.connectedComponentsCount).toBe(1)
    expect(metrics.isConnected).toBe(true)
    expect(metrics.totalWeight).toBe(12)
    expect(metrics.isolatedCount).toBe(0)
  })

  it('deve serializar e desserializar para JSON perfeitamente', () => {
    const g = new GraphModel({
      name: 'Teste JSON',
      directed: true,
      weighted: true,
      vertices: [
        { id: 'A', label: 'Alfa', x: 10, y: 20, z: 30 },
        { id: 'B', label: 'Beta', x: -5, y: 15, z: 0 }
      ],
      edges: [{ id: 'e1', source: 'A', target: 'B', weight: 15 }]
    })

    const json = g.toJSON()
    expect(validateJSONImport(json).isValid).toBe(true)

    const imported = GraphModel.fromJSON(json)
    expect(imported.name).toBe('Teste JSON')
    expect(imported.directed).toBe(true)
    expect(imported.vertices).toHaveLength(2)
    expect(imported.edges).toHaveLength(1)
    expect(imported.edges[0].weight).toBe(15)
  })

  it('deve rejeitar JSON com dados inválidos ou corrompidos', () => {
    expect(validateJSONImport(null).isValid).toBe(false)
    expect(validateJSONImport({ vertices: 'não é array' }).isValid).toBe(false)
    expect(
      validateJSONImport({
        vertices: [{ id: 'A' }],
        edges: [{ source: 'A', target: 'INEXISTENTE' }]
      }).isValid
    ).toBe(false)
  })
})
