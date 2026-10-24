/**
 * Grafos Predefinidos para Demonstração Acadêmica e Avaliação ao Vivo
 * Cada modelo é representativo de cenários clássicos de teoria dos grafos e cidades inteligentes.
 */

export const PRESET_GRAPHS = [
  {
    id: 'preset-standard-abcd',
    name: '1. Padrão Universitário (A, B, C, D)',
    description: 'Grafo canônico conexo com 4 nós e pesos distintos, ideal para demonstração rápida.',
    directed: false,
    weighted: true,
    vertices: [
      { id: 'A', label: 'Bairro Centro (A)', x: -20, y: 15, z: 0, type: 'hub' },
      { id: 'B', label: 'Polo Tecnológico (B)', x: 20, y: 15, z: 10, type: 'datacenter' },
      { id: 'C', label: 'Distrito Industrial (C)', x: 20, y: -15, z: -10, type: 'standard' },
      { id: 'D', label: 'Zona Residencial (D)', x: -20, y: -15, z: 5, type: 'sensor' }
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'B', weight: 4, label: '4' },
      { id: 'e2', source: 'B', target: 'C', weight: 3, label: '3' },
      { id: 'e3', source: 'C', target: 'D', weight: 6, label: '6' },
      { id: 'e4', source: 'D', target: 'A', weight: 2, label: '2' },
      { id: 'e5', source: 'A', target: 'C', weight: 7, label: '7' }
    ]
  },
  {
    id: 'preset-alternative-paths',
    name: '2. Caminhos Alternativos (Dijkstra vs BFS)',
    description: 'Demonstra que o caminho com menos arestas (BFS: A->D = 1 salto, peso 15) não é o de menor custo (Dijkstra: A->B->C->D = 3 saltos, custo 2+3+1=6).',
    directed: true,
    weighted: true,
    vertices: [
      { id: 'A', label: 'Central de Dados (A)', x: -30, y: 0, z: 0, type: 'datacenter' },
      { id: 'B', label: 'Roteador Bairro Norte (B)', x: -10, y: 20, z: 10, type: 'hub' },
      { id: 'C', label: 'Subestação Leste (C)', x: 10, y: 20, z: -10, type: 'standard' },
      { id: 'D', label: 'Terminal Sul (D)', x: 30, y: 0, z: 0, type: 'sensor' },
      { id: 'E', label: 'Ponto de Retransmissão (E)', x: 0, y: -20, z: 0, type: 'standard' }
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'B', weight: 2, label: '2' },
      { id: 'e2', source: 'B', target: 'C', weight: 3, label: '3' },
      { id: 'e3', source: 'C', target: 'D', weight: 1, label: '1' },
      { id: 'e4', source: 'A', target: 'D', weight: 15, label: '15' },
      { id: 'e5', source: 'A', target: 'E', weight: 8, label: '8' },
      { id: 'e6', source: 'E', target: 'D', weight: 4, label: '4' }
    ]
  },
  {
    id: 'preset-directed-flow',
    name: '3. Rede Viária Direcionada (Fluxo Urbano)',
    description: 'Grafo direcionado representando avenidas de mão única e canais unidirecionais de fibra óptica.',
    directed: true,
    weighted: true,
    vertices: [
      { id: 'Porto', label: 'Porto Logístico', x: -25, y: 15, z: -5, type: 'hub' },
      { id: 'Centro', label: 'Centro Financeiro', x: 0, y: 20, z: 10, type: 'datacenter' },
      { id: 'Aeroporto', label: 'Aeroporto Internacional', x: 25, y: 10, z: 0, type: 'hub' },
      { id: 'Campus', label: 'Campus Universitário', x: -15, y: -15, z: 15, type: 'standard' },
      { id: 'Parque', label: 'Parque Tecnológico', x: 15, y: -15, z: -15, type: 'standard' },
      { id: 'Subúrbio', label: 'Área Suburbana', x: 35, y: -20, z: 5, type: 'sensor' }
    ],
    edges: [
      { id: 'e1', source: 'Porto', target: 'Centro', weight: 6, label: '6' },
      { id: 'e2', source: 'Centro', target: 'Aeroporto', weight: 8, label: '8' },
      { id: 'e3', source: 'Porto', target: 'Campus', weight: 4, label: '4' },
      { id: 'e4', source: 'Campus', target: 'Centro', weight: 3, label: '3' },
      { id: 'e5', source: 'Centro', target: 'Parque', weight: 5, label: '5' },
      { id: 'e6', source: 'Campus', target: 'Parque', weight: 7, label: '7' },
      { id: 'e7', source: 'Parque', target: 'Aeroporto', weight: 2, label: '2' },
      { id: 'e8', source: 'Aeroporto', target: 'Subúrbio', weight: 9, label: '9' }
    ]
  },
  {
    id: 'preset-disconnected-graph',
    name: '4. Grafo Desconexo e Sensores Isolados',
    description: 'Contém múltiplos componentes conexos e nós isolados para testar percursos em floresta, nós inalcançáveis e Kruskal em floresta.',
    directed: false,
    weighted: true,
    vertices: [
      { id: 'N1', label: 'Bairro Alfa', x: -30, y: 15, z: 0, type: 'hub' },
      { id: 'N2', label: 'Bairro Beta', x: -15, y: 25, z: 5, type: 'standard' },
      { id: 'N3', label: 'Bairro Gama', x: -15, y: 5, z: -5, type: 'standard' },
      { id: 'S1', label: 'Sensor Isolado 01', x: 0, y: 25, z: 10, type: 'sensor' },
      { id: 'S2', label: 'Sensor Isolado 02', x: 0, y: -25, z: -10, type: 'sensor' },
      { id: 'C1', label: 'Ilha Sul - Centro', x: 20, y: -10, z: 5, type: 'datacenter' },
      { id: 'C2', label: 'Ilha Sul - Estação', x: 35, y: -15, z: -5, type: 'standard' }
    ],
    edges: [
      { id: 'e1', source: 'N1', target: 'N2', weight: 5, label: '5' },
      { id: 'e2', source: 'N2', target: 'N3', weight: 4, label: '4' },
      { id: 'e3', source: 'N3', target: 'N1', weight: 3, label: '3' },
      { id: 'e4', source: 'C1', target: 'C2', weight: 7, label: '7' }
    ]
  },
  {
    id: 'preset-kruskal-mst',
    name: '5. Rede Elétrica de Alta Densidade (Kruskal AGM)',
    description: 'Rede não-direcionada com múltiplos ciclos e pesos variados, perfeita para visualizar arestas aceitas vs rejeitadas por ciclos.',
    directed: false,
    weighted: true,
    vertices: [
      { id: 'Sub1', label: 'Subestação Central', x: -20, y: 20, z: 0, type: 'datacenter' },
      { id: 'Sub2', label: 'Subestação Norte', x: 10, y: 25, z: 10, type: 'hub' },
      { id: 'Sub3', label: 'Subestação Sul', x: -25, y: -15, z: -10, type: 'standard' },
      { id: 'Sub4', label: 'Subestação Leste', x: 25, y: 0, z: 5, type: 'hub' },
      { id: 'Sub5', label: 'Termoelétrica Oeste', x: 0, y: -25, z: 0, type: 'standard' },
      { id: 'Sub6', label: 'Usina Solar', x: 0, y: 0, z: 15, type: 'sensor' }
    ],
    edges: [
      { id: 'ke1', source: 'Sub1', target: 'Sub2', weight: 1, label: '1' },
      { id: 'ke2', source: 'Sub2', target: 'Sub4', weight: 2, label: '2' },
      { id: 'ke3', source: 'Sub1', target: 'Sub6', weight: 3, label: '3' },
      { id: 'ke4', source: 'Sub6', target: 'Sub4', weight: 4, label: '4' },
      { id: 'ke5', source: 'Sub1', target: 'Sub3', weight: 5, label: '5' },
      { id: 'ke6', source: 'Sub3', target: 'Sub5', weight: 6, label: '6' },
      { id: 'ke7', source: 'Sub5', target: 'Sub4', weight: 7, label: '7' },
      { id: 'ke8', source: 'Sub2', target: 'Sub6', weight: 8, label: '8' },
      { id: 'ke9', source: 'Sub3', target: 'Sub6', weight: 9, label: '9' }
    ]
  },
  {
    id: 'preset-smart-metropolis',
    name: '6. Metrópole SmartNet 3D (Infraestrutura Completa)',
    description: 'Grafo avançado de 10 nós espacialmente distribuídos representando a infraestrutura completa de uma metrópole futurista.',
    directed: false,
    weighted: true,
    vertices: [
      { id: 'CORE', label: 'Núcleo Central de IA', x: 0, y: 0, z: 0, type: 'datacenter' },
      { id: 'HUB_N', label: 'Hub Conectividade Norte', x: 0, y: 35, z: 15, type: 'hub' },
      { id: 'HUB_S', label: 'Hub Conectividade Sul', x: 0, y: -35, z: -15, type: 'hub' },
      { id: 'HUB_E', label: 'Hub Conectividade Leste', x: 35, y: 0, z: 15, type: 'hub' },
      { id: 'HUB_W', label: 'Hub Conectividade Oeste', x: -35, y: 0, z: -15, type: 'hub' },
      { id: 'SENS_1', label: 'Malha Sensores Tráfego', x: -20, y: 25, z: -20, type: 'sensor' },
      { id: 'SENS_2', label: 'Monitoramento Ambiental', x: 20, y: 25, z: 20, type: 'sensor' },
      { id: 'SENS_3', label: 'Rede Hidráulica IoT', x: 20, y: -25, z: -20, type: 'sensor' },
      { id: 'SENS_4', label: 'Smart Grid Energética', x: -20, y: -25, z: 20, type: 'sensor' },
      { id: 'CLOUD', label: 'Nuvem Governamental', x: 0, y: 15, z: 35, type: 'datacenter' }
    ],
    edges: [
      { id: 'me1', source: 'CORE', target: 'HUB_N', weight: 3, label: '3' },
      { id: 'me2', source: 'CORE', target: 'HUB_S', weight: 3, label: '3' },
      { id: 'me3', source: 'CORE', target: 'HUB_E', weight: 4, label: '4' },
      { id: 'me4', source: 'CORE', target: 'HUB_W', weight: 4, label: '4' },
      { id: 'me5', source: 'CORE', target: 'CLOUD', weight: 2, label: '2' },
      { id: 'me6', source: 'HUB_N', target: 'SENS_1', weight: 5, label: '5' },
      { id: 'me7', source: 'HUB_N', target: 'SENS_2', weight: 5, label: '5' },
      { id: 'me8', source: 'HUB_E', target: 'SENS_2', weight: 6, label: '6' },
      { id: 'me9', source: 'HUB_E', target: 'SENS_3', weight: 6, label: '6' },
      { id: 'me10', source: 'HUB_S', target: 'SENS_3', weight: 4, label: '4' },
      { id: 'me11', source: 'HUB_S', target: 'SENS_4', weight: 5, label: '5' },
      { id: 'me12', source: 'HUB_W', target: 'SENS_4', weight: 4, label: '4' },
      { id: 'me13', source: 'HUB_W', target: 'SENS_1', weight: 6, label: '6' },
      { id: 'me14', source: 'CLOUD', target: 'HUB_N', weight: 3, label: '3' }
    ]
  }
]
