import { computed, ref, watch } from 'vue'
import { useGraph } from './useGraph.js'

export function useGraphChallenges() {
  const { graph, metrics, graphVersion } = useGraph()

  // IDs de desafios já comemorados para evitar toasts repetidos
  const notifiedChallenges = ref(new Set())

  const challenges = computed(() => {
    // Força dependência reativa do graphVersion
    if (!graphVersion.value) return []

    const m = metrics.value || {}
    const V = graph.value.vertices.length
    const E = graph.value.edges.length
    const isDirected = graph.value.directed
    const isWeighted = graph.value.weighted
    const maxDegree = m.maxDegree || 0
    const components = m.connectedComponentsCount || (V > 0 ? 1 : 0)

    const hasCustomWeight = isWeighted && graph.value.edges.some(e => typeof e.weight === 'number' && e.weight !== 1)

    return [
      {
        id: 'genesis',
        title: 'Gênesis da Rede',
        icon: 'Sparkles',
        badge: 'Iniciação',
        description: 'Crie o primeiro vértice no mapa topológico.',
        hint: 'Use a ferramenta de nó (atalho N) ou clique na área de trabalho.',
        current: Math.min(V, 1),
        target: 1,
        isCompleted: V >= 1
      },
      {
        id: 'first_link',
        title: 'Primeiro Enlace',
        icon: 'Share2',
        badge: 'Conectividade',
        description: 'Conecte dois nós através de uma aresta.',
        hint: 'Use a ferramenta de conexão (E) clicando na origem e no destino.',
        current: Math.min(E, 1),
        target: 1,
        isCompleted: E >= 1
      },
      {
        id: 'expansion',
        title: 'Rede Urbana em Expansão',
        icon: 'Network',
        badge: 'Topologia',
        description: 'Monte um grafo com pelo menos 5 vértices e 5 conexões.',
        hint: 'Adicione nós de sensores, hubs e datacenters conectados.',
        current: Math.min(V, 5) + Math.min(E, 5),
        target: 10,
        isCompleted: V >= 5 && E >= 5
      },
      {
        id: 'weighted_links',
        title: 'Roteamento Ponderado',
        icon: 'Scale',
        badge: 'Métricas',
        description: 'Ative a ponderação e atribua um peso customizado (≠ 1) a uma aresta.',
        hint: 'Altere o peso de uma conexão pelo painel contextual ou duplo clique no rótulo.',
        current: hasCustomWeight ? 1 : 0,
        target: 1,
        isCompleted: hasCustomWeight
      },
      {
        id: 'directed_flow',
        title: 'Fluxo Unidirecional',
        icon: 'ArrowRight',
        badge: 'Direcionamento',
        description: 'Configure o grafo como direcionado com pelo menos 3 canais de mão única.',
        hint: 'Ative a opção Direcionado na barra de configurações superior.',
        current: isDirected ? Math.min(E, 3) : 0,
        target: 3,
        isCompleted: isDirected && E >= 3
      },
      {
        id: 'isolated_islands',
        title: 'Ilhas de Sensores (Desconexo)',
        icon: 'Grid',
        badge: 'Partição',
        description: 'Construa ou carregue uma rede com 2 ou mais componentes desconexos.',
        hint: 'Crie grupos de vértices sem caminhos conectando-os entre si.',
        current: Math.min(components, 2),
        target: 2,
        isCompleted: V >= 2 && components >= 2
      },
      {
        id: 'super_hub',
        title: 'Super Hub de Telecomunicações',
        icon: 'Cpu',
        badge: 'Centralidade',
        description: 'Crie um nó central de alta densidade com grau de conexão de pelo menos 4.',
        hint: 'Conecte pelo menos 4 arestas incidentes em um mesmo vértice (ex: Hub Central).',
        current: Math.min(maxDegree, 4),
        target: 4,
        isCompleted: maxDegree >= 4
      }
    ]
  })

  const completedCount = computed(() => challenges.value.filter(c => c.isCompleted).length)
  const totalCount = computed(() => challenges.value.length)
  const progressPercent = computed(() => Math.round((completedCount.value / totalCount.value) * 100))
  const allCompleted = computed(() => completedCount.value === totalCount.value)

  return {
    challenges,
    completedCount,
    totalCount,
    progressPercent,
    allCompleted,
    notifiedChallenges
  }
}
