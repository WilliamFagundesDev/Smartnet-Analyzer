import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'

vi.hoisted(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map()
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear()
    }
  }
})

import { useGraph } from '../composables/useGraph.js'
import { useAlgorithmRunner, computeHighlightsForAlgorithm } from '../composables/useAlgorithmRunner.js'
import { ThreeSceneManager } from '../visualization/threeScene.js'

describe('Laboratório Multi-Algoritmos Simultâneos & Seleção Sem Mudar Cor', () => {
  const { importFromJSON } = useGraph()
  const runner = useAlgorithmRunner()

  const canonicalComparisonGraph = {
    name: 'Rede Comparativa 4 Algoritmos',
    directed: false,
    weighted: true,
    vertices: [
      { id: 'A', label: 'Origem A', x: -20, y: 0, z: 0 },
      { id: 'B', label: 'Ponte B', x: 0, y: 15, z: 0 },
      { id: 'C', label: 'Ponte C', x: 10, y: 15, z: 0 },
      { id: 'D', label: 'Destino D', x: 25, y: 0, z: 0 }
    ],
    edges: [
      { id: 'e_direct', source: 'A', target: 'D', weight: 20 },
      { id: 'e_ab', source: 'A', target: 'B', weight: 2 },
      { id: 'e_bc', source: 'B', target: 'C', weight: 3 },
      { id: 'e_cd', source: 'C', target: 'D', weight: 4 }
    ]
  }

  beforeEach(async () => {
    runner.clearResult()
    importFromJSON(JSON.stringify(canonicalComparisonGraph))
    await nextTick()
    runner.selectOnlyAlgorithm('DFS')
    runner.startVertexId.value = 'A'
    runner.targetVertexId.value = 'D'
    await nextTick()
  })

  it('deve permitir selecionar e executar 2, 3 e todos os 4 algoritmos simultaneamente', () => {
    // 2 algoritmos (BFS + Dijkstra)
    runner.selectOnlyAlgorithm('BFS')
    runner.toggleAlgorithm('DIJKSTRA')
    expect(runner.selectedAlgorithms.value).toEqual(['BFS', 'DIJKSTRA'])
    expect(runner.isMultiMode.value).toBe(true)

    runner.runInstant()
    expect(runner.getAlgoRun('BFS')?.result?.shortestPath).toEqual(['A', 'D'])
    expect(runner.getAlgoRun('DIJKSTRA')?.result?.targetPath).toEqual(['A', 'B', 'C', 'D'])

    // 3 algoritmos (DFS + BFS + Dijkstra)
    runner.toggleAlgorithm('DFS')
    expect(runner.selectedAlgorithms.value).toEqual(['DFS', 'BFS', 'DIJKSTRA'])
    runner.runInstant()
    expect(runner.getAlgoRun('DFS')?.result).toBeTruthy()
    expect(runner.getAlgoRun('BFS')?.result).toBeTruthy()
    expect(runner.getAlgoRun('DIJKSTRA')?.result).toBeTruthy()

    // Todos os 4 algoritmos simultâneos (DFS + BFS + Dijkstra + Kruskal)
    runner.selectAllAlgorithms()
    expect(runner.selectedAlgorithms.value).toEqual(['DFS', 'BFS', 'DIJKSTRA', 'KRUSKAL'])

    runner.runInstant()
    expect(runner.getAlgoRun('DFS')?.result?.algorithm).toBe('DFS')
    expect(runner.getAlgoRun('BFS')?.result?.algorithm).toBe('BFS')
    expect(runner.getAlgoRun('DIJKSTRA')?.result?.algorithm).toBe('Dijkstra')
    expect(runner.getAlgoRun('KRUSKAL')?.result?.algorithm).toBe('Kruskal')
    expect(runner.getAlgoRun('KRUSKAL')?.result?.totalCost).toBe(9)
    expect(runner.getAlgoRun('KRUSKAL')?.result?.rejectedEdges.map(e => e.id)).toContain('e_direct')
  })

  it('deve sincronizar passo a passo entre os 4 algoritmos e expor o que cada um está fazendo', () => {
    runner.selectAllAlgorithms()
    runner.runStepByStep(false)

    expect(runner.currentStepIndex.value).toBe(0)
    expect(runner.totalSteps.value).toBeGreaterThan(5)

    // No passo inicial, todos os 4 possuem resumo vivo estruturado
    for (const key of ['DFS', 'BFS', 'DIJKSTRA', 'KRUSKAL']) {
      const summary = runner.getAlgoLiveSummary(key)
      expect(summary).toBeTruthy()
      expect(summary.stepNumber).toBe(1)
      expect(summary.description.length).toBeGreaterThan(5)
    }

    // Avança para o último passo global: algoritmos com menos eventos ficam concluídos sem estourar índice
    runner.jumpToStep(runner.totalSteps.value - 1)
    for (const key of ['DFS', 'BFS', 'DIJKSTRA', 'KRUSKAL']) {
      expect(runner.getAlgoExecutionStatus(key)).toBe('completed')
      const summary = runner.getAlgoLiveSummary(key)
      expect(summary.isDone).toBe(true)
      expect(summary.stepNumber).toBe(summary.totalSteps)
    }
  })

  it('deve gerar destaques 3D distintos por algoritmo evidenciando divergências visuais', () => {
    runner.selectAllAlgorithms()
    runner.runInstant()

    const highlights = runner.algoHighlightsMap.value

    // BFS destaca a aresta direta e_direct como menor caminho ('path' em saltos)
    expect(highlights.BFS.edgeStatus['e_direct']).toBe('path')

    // Dijkstra destaca o caminho ponderado e_ab, e_bc, e_cd como 'path', e ignora e_direct
    expect(highlights.DIJKSTRA.edgeStatus['e_ab']).toBe('path')
    expect(highlights.DIJKSTRA.edgeStatus['e_bc']).toBe('path')
    expect(highlights.DIJKSTRA.edgeStatus['e_cd']).toBe('path')
    expect(highlights.DIJKSTRA.edgeStatus['e_direct']).toBeUndefined()

    // Kruskal destaca e_ab, e_bc, e_cd como AGM ('tree'), rejeita e_direct como ciclo ('cycle')
    // e não marca falsamente origem/destino nos vértices
    expect(highlights.KRUSKAL.edgeStatus['e_ab']).toBe('tree')
    expect(highlights.KRUSKAL.edgeStatus['e_direct']).toBe('cycle')
    expect(highlights.KRUSKAL.vertexStatus['A']).not.toBe('source')
    expect(highlights.KRUSKAL.vertexStatus['D']).not.toBe('target')
  })

  it('em grafo direcionado com 4 selecionados, deve executar DFS/BFS/Dijkstra e isolar erro apenas no Kruskal', async () => {
    const { setDirected } = useGraph()
    setDirected(true)
    await nextTick()

    runner.selectAllAlgorithms()
    runner.startVertexId.value = 'A'
    runner.targetVertexId.value = 'D'
    await nextTick()

    runner.runInstant()

    expect(runner.getAlgoRun('DFS')?.result).toBeTruthy()
    expect(runner.getAlgoRun('BFS')?.result).toBeTruthy()
    expect(runner.getAlgoRun('DIJKSTRA')?.result).toBeTruthy()
    expect(runner.getAlgoRun('KRUSKAL')?.result).toBeNull()
    expect(runner.getAlgoRun('KRUSKAL')?.error).toMatch(/não-direcionado/i)
  })

  it('não deve alterar a cor semântica da aresta no ThreeSceneManager quando selecionada', () => {
    const fakeInstance = { theme: 'light' }
    const getEdgeColor = ThreeSceneManager.prototype._getEdgeColor.bind(fakeInstance)

    // Verifica que _getEdgeColor depende exclusivamente do status semântico (nunca de seleção)
    expect(getEdgeColor.length).toBe(1)
    expect(getEdgeColor(null).base).toBe(0x94a3b8)
    expect(getEdgeColor('tree').base).toBe(0x10b981)
    expect(getEdgeColor('cycle').base).toBe(0xef4444)
    expect(getEdgeColor('examining').base).toBe(0xf59e0b)
    expect(getEdgeColor('path').base).toBe(0x0ea5e9)

    // computeHighlightsForAlgorithm jamais injeta status artificial por seleção
    const { graph } = useGraph()
    const cleanHighlights = computeHighlightsForAlgorithm('BFS', graph.value, null, -1, 'A', 'D')
    expect(cleanHighlights.edgeStatus).toEqual({})
  })
})
