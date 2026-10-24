# SmartNet Analyzer
## Central Avançada de Análise e Visualização 3D de Grafos e Infraestrutura Urbana

[![Deploy to GitHub Pages](https://github.com/WilliamFagundesDev/Smartnet-Analyzer/actions/workflows/deploy.yml/badge.svg)](https://github.com/WilliamFagundesDev/Smartnet-Analyzer/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/Demo-Online_no_GitHub_Pages-2563eb?style=flat&logo=github)](https://williamfagundesdev.github.io/Smartnet-Analyzer/)

🌐 **Acesse a Aplicação no Ar:** [https://williamfagundesdev.github.io/Smartnet-Analyzer/](https://williamfagundesdev.github.io/Smartnet-Analyzer/)

Aplicação acadêmica desenvolvida para a disciplina **Análise e Complexidade de Algoritmos**, combinando engenharia de software de alto padrão, algoritmos clássicos de grafos implementados do zero em JavaScript puro, e visualização tridimensional interativa com Three.js e Vue.js 3.

---

## 1. Identificação Acadêmica do Projeto

> **Aviso para Apresentação Universitária:** Os campos com colchetes devem ser preenchidos pelos membros da equipe antes da submissão final do trabalho.

- **Instituição:** `[ Preencher: Nome da Universidade / Faculdade ]`
- **Curso:** `[ Preencher: Bacharelado em Ciência da Computação / Engenharia de Software ]`
- **Disciplina:** Análise e Complexidade de Algoritmos
- **Professor(a):** `[ Preencher: Nome do(a) Professor(a) ]`
- **Período / Semestre:** `[ Preencher: Ex: 2026/1 ]`

### Integrantes da Equipe
1. **Nome:** `[ Preencher Nome Completo Aluno 1 ]` &mdash; **Matrícula:** `[ Preencher Matrícula ]`
2. **Nome:** `[ Preencher Nome Completo Aluno 2 ]` &mdash; **Matrícula:** `[ Preencher Matrícula ]`
3. **Nome:** `[ Preencher Nome Completo Aluno 3 ]` &mdash; **Matrícula:** `[ Preencher Matrícula ]`
4. **Nome:** `[ Preencher Nome Completo Aluno 4 ]` &mdash; **Matrícula:** `[ Preencher Matrícula ]`

---

## 2. Metáfora de Domínio & Objetivo Acadêmico

O **SmartNet Analyzer** simula o centro de comando e monitoramento da infraestrutura digital e física de uma metrópole inteligente (*Smart City*).

### Modelagem Matemática do Grafo Urbano:
- **Vértices ($V$):** Representam instalações estratégicas:
  - `hub`: Nós centrais de distribuição de fluxo e roteadores metropolitanos.
  - `datacenter`: Centros de computação em nuvem e processamento municipal.
  - `sensor`: Estações de sensoriamento IoT (tráfego, qualidade do ar, malha hídrica).
  - `standard`: Bairros, terminais de passageiros e subestações elétricas.
- **Arestas ($E$):** Canais físicos e enlaces lógicos (redes de fibra óptica, avenidas arteriais, dutos subterrâneos ou conexões de micro-ondas).
- **Pesos ($W$):** Métricas de custo físico ou financeiro (distância em km, latência de transmissão em milissegundos, tempo de trajeto ou custo monetário de implantação).
- **Direcionamento:** Modela fluxos estritamente orientados (vias de mão única, canais de broadcast) ou bidirecionais simétricos (cabos de fibra óptica duplex, rodovias de pista dupla).

---

## 3. Tecnologias Utilizadas & Regras Inegociáveis

- **Vue.js 3:** Framework reativo moderno utilizando a **Composition API** e a sintaxe `<script setup>`.
- **JavaScript Puro (ECMAScript Moderno):** **100% isento de TypeScript**, sem nenhum arquivo `.ts` ou dependência compilada de tipagem estática, garantindo portabilidade nativa.
- **Vite:** Ferramenta de build ultrarrápida com Hot Module Replacement (HMR).
- **Three.js:** Motor de computação gráfica 3D para renderização de nós esféricos, conexões tubulares, cones direcionais, iluminação, raycasting e animações de percurso.
- **Vue Router 4:** Gerenciamento do fluxo de navegação entre as visões analíticas.
- **Vitest:** Framework de testes unitários automatizados para validação matemática dos algoritmos e estruturas.
- **HTML5 & CSS3 Moderno:** Design system baseado em variáveis CSS (CSS Tokens), paleta temática *dark mode cyber-command* e layout responsivo com suporte a `prefers-reduced-motion`.
- **Lucide Icons:** Conjunto consistente de ícones vetoriais.
- **Canvas-Confetti:** Feedback comemorativo ao atingir conclusões ótimas de algoritmos.

---

## 4. Funcionalidades do Sistema

1. **Visão Geral & Telemetria em Tempo Real:**
   - Métricas topológicas derivadas estritamente da estrutura do grafo (sem valores fictícios): Quantidade de Vértices $|V|$, Quantidade de Arestas $|E|$, Densidade do Grafo $D$, Componentes Conexos, Grau Mínimo, Grau Máximo, Grau Médio e Peso Total da Malha.
2. **Editor Completo de Grafos:**
   - Adição, edição e remoção de vértices com coordenadas 3D $(x, y, z)$.
   - Adição, edição e remoção de arestas com seleção de nós e definição de pesos.
   - Alternância dinâmica entre grafo **Direcionado** e **Não-Direcionado**.
   - Alternância entre grafo **Ponderado** e **Não-Ponderado**.
   - Limpeza total com confirmação de segurança.
   - Validações em tempo real: rejeição de vértices duplicados, arestas para nós inexistentes, arestas paralelas e detecção de laços.
3. **Visualização 3D Interativa (Three.js):**
   - Rotação orbital com botão esquerdo do mouse.
   - Pan/arrasto espacial com botão direito do mouse.
   - Zoom suave com a roda do mouse (*wheel*).
   - *Raycasting* de precisão para seleção interativa de vértices e arestas ao clicar.
   - Botão **Enquadrar** (*Fit Camera*) que calcula a esfera delimitadora dos nós e reposiciona a câmera perfeitamente.
   - Botão **Restaurar** para voltar ao ângulo inicial.
   - Botão **Auto Rotação** para visualização panorâmica contínua.
   - Algoritmo de **Reorganização Espacial 3D (Force-Directed Relaxation)**: simula leis de Coulomb e Hooke em 3D para equilibrar esteticamente a disposição dos nós sem alterar a topologia matemática.
   - Alternância para **Modo 2D Técnico (HTML5 Canvas)** como alternativa leve e acessível caso a aceleração WebGL não esteja disponível.
4. **Laboratório Algorítmico com Animação Didática Passo a Passo:**
   - Geração pura de eventos/snapshots para reprodução desacoplada.
   - Controles de reprodução: Play, Pause, Avançar Passo, Retroceder Passo, Reiniciar e seletor de velocidade (0.5x, 1x, 2x).
   - Destaque cromático dinâmico dos nós e arestas conforme o estado do algoritmo (Atual, Na Fila, Visitado, Árvore, Ciclo Rejeitado, Menor Caminho).
5. **Estrutura de Dados & Inspeção de Memória:**
   - Visualização didática da **Lista de Adjacência** (representação principal em memória com Map e listas de conexões).
   - Tabela interativa da **Matriz de Adjacência $V \times V$** com representação explícita de ausência via `null` (&mdash;), preservando a distinção do peso `0`.
   - Comparativo teórico de complexidade de espaço e operações entre Lista e Matriz.
6. **Importação e Exportação JSON:**
   - Exportação do grafo com formatação legível e download de arquivo `.json`.
   - Cópia direta para a área de transferência.
   - Importação via upload de arquivo ou colagem de texto com validação prévia de esquema antes da substituição do grafo ativo.
7. **Persistência Segura com LocalStorage:**
   - Preservação do grafo de trabalho entre recargas do navegador.
   - Invalidação automática dos resultados de algoritmos quando o grafo sofre mutação estrutural.
8. **Botão Funcional "Finalizar Aplicação":**
   - Implementação de encerramento seguro (*graceful termination*): solicita confirmação, interrompe timers e animações, libera os contextos gráficos WebGL do Three.js, suspende ouvintes de eventos e exibe uma tela de encerramento com opções de retomada ou reinicialização.

---

## 5. Algoritmos Implementados do Zero

Todos os quatro algoritmos foram desenvolvidos em módulos JavaScript puros (`src/algorithms/`), sem recorrer a bibliotecas externas de grafos:

### 5.1. DFS &mdash; Depth-First Search (Busca em Profundidade)
- **Arquivo:** `src/algorithms/dfs.js`
- **Funcionamento:** Percorre o grafo em profundidade através de uma pilha de execução controlada. Registra a ordem exata de visitação, as arestas que compõem a árvore de busca e identifica vértices inalcançáveis a partir da raiz.
- **Suporte a Floresta:** Opção configurável na interface para explorar todos os componentes desconexos.
- **Complexidade:** Temporal $O(V + E)$ | Espacial Auxiliar $O(V)$.

### 5.2. BFS &mdash; Breadth-First Search (Busca em Largura)
- **Arquivo:** `src/algorithms/bfs.js`
- **Funcionamento:** Utiliza uma fila FIFO real implementada em JavaScript. Descobre e visita os vértices em ondas concêntricas por níveis de distância mínima em **número de arestas (saltos)**. Reconstrói o menor caminho em arestas caso um destino seja indicado.
- **Complexidade:** Temporal $O(V + E)$ | Espacial Auxiliar $O(V)$.

### 5.3. Dijkstra &mdash; Menor Caminho Ponderado Não-Negativo
- **Arquivo:** `src/algorithms/dijkstra.js`
- **Estrutura Auxiliar:** Min-Heap Binário (`src/algorithms/priorityQueue.js`) desenvolvido do zero, garantindo inserção e extração do mínimo em $O(\log V)$.
- **Validação de Pesos:** Rejeita estritamente arestas com pesos negativos com mensagem clara (uma vez que Dijkstra assume gulosamente que distâncias fixadas não diminuirão).
- **Resultados:** Tabela detalhada de distâncias acumuladas, predecessores e reconstrução vetorial do caminho ótimo até o destino.
- **Complexidade:** Temporal $O((V + E) \log V)$ | Espacial Auxiliar $O(V)$.

### 5.4. Kruskal &mdash; Árvore Geradora Mínima (AGM / MST)
- **Arquivo:** `src/algorithms/kruskal.js`
- **Estrutura Auxiliar:** *Disjoint Set Union* / Union-Find (`src/algorithms/unionFind.js`) com as duas otimizações canônicas:
  1. **Compressão de Caminho** (*Path Compression* no método `find`).
  2. **União por Rank** (*Union by Rank* no método `union`).
- **Funcionamento:** Ordena as arestas por peso em ordem não-decrescente (desempate consistente por ID). Avalia cada aresta de forma gulosa: conecta componentes disjuntos e rejeita explicitamente conexões que formariam ciclos.
- **Detecção de Conectividade:** Informa se o resultado obtido é uma Árvore Geradora Mínima única ($|V| - 1$ arestas conectando todos os nós) ou uma Floresta Geradora Mínima (quando o grafo original é desconexo).
- **Validação:** Bloqueia execução em grafos direcionados, com opção na interface para conversão imediata para não-direcionado.
- **Complexidade:** Temporal $O(E \log E)$ | Espacial Auxiliar $O(V + E)$.

---

## 6. Quadro Comparativo de Complexidade

| Componente / Algoritmo | Complexidade Temporal | Espaço Auxiliar | Estrutura de Dados Utilizada |
| :--- | :--- | :--- | :--- |
| **Lista de Adjacência** | $O(\text{grau}(v))$ para vizinhos | $O(V + E)$ | `Map<string, Array>` |
| **Matriz de Adjacência** | $O(1)$ para consulta $M[u][v]$ | $O(V^2)$ | Array bidimensional com `null` |
| **DFS** | $O(V + E)$ | $O(V)$ | Lista de Adjacência e Pilha |
| **BFS** | $O(V + E)$ | $O(V)$ | Lista de Adjacência e Fila FIFO |
| **Dijkstra** | $O((V + E) \log V)$ | $O(V)$ | Lista de Adjacência e Min-Heap Binário |
| **Kruskal** | $O(E \log E)$ | $O(V + E)$ | Union-Find (DSU com Rank e Compressão) |

---

## 7. Formato JSON dos Grafos

O sistema adota a seguinte estrutura JSON padronizada:

```json
{
  "name": "Rede Metropolitana SmartNet",
  "directed": false,
  "weighted": true,
  "vertices": [
    {
      "id": "A",
      "label": "Bairro Centro (A)",
      "x": -20,
      "y": 15,
      "z": 0,
      "type": "hub"
    },
    {
      "id": "B",
      "label": "Polo Tecnológico (B)",
      "x": 20,
      "y": 15,
      "z": 10,
      "type": "datacenter"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "A",
      "target": "B",
      "weight": 4,
      "label": "4"
    }
  ]
}
```

---

## 8. Estrutura de Arquivos do Projeto

```text
Smartnet-Analyzer/
├── dist/                          # Build de produção gerado pelo Vite
├── src/
│   ├── algorithms/                # Módulos matemáticos dos algoritmos
│   │   ├── priorityQueue.js       # Min-Heap Binário
│   │   ├── unionFind.js           # DSU com compressão e união por rank
│   │   ├── dfs.js                 # Busca em Profundidade com gerador de eventos
│   │   ├── bfs.js                 # Busca em Largura com fila FIFO e eventos
│   │   ├── dijkstra.js            # Menor caminho ponderado com heap
│   │   └── kruskal.js             # Árvore geradora mínima e florestas
│   ├── graph/                     # Modelo e estruturas de dados do grafo
│   │   ├── graphModel.js          # Modelo de grafo orientado a objetos
│   │   ├── adjacencyList.js       # Implementação da Lista de Adjacência
│   │   ├── adjacencyMatrix.js     # Implementação da Matriz de Adjacência
│   │   ├── graphValidation.js     # Validações estruturais e algorítmicas
│   │   ├── graphMetrics.js        # Cálculo de densidade, componentes e graus
│   │   └── defaultPresets.js      # Grafos predefinidos para apresentação ao vivo
│   ├── visualization/             # Computação gráfica 3D e espacial
│   │   ├── threeScene.js          # Cena Three.js, luzes, materiais e raycasting
│   │   └── graphLayout.js         # Layout Force-Directed 3D estético
│   ├── composables/               # Gerenciamento de estado reativo (Vue 3)
│   │   ├── useGraph.js            # Estado do grafo, LocalStorage e logs
│   │   ├── useAlgorithmRunner.js  # Execução de algoritmos e playback didático
│   │   └── useAppLifecycle.js     # Controle do ciclo de vida e finalização
│   ├── components/                # Componentes de interface modulares
│   │   ├── layout/                # Header, Sidebar, Console e Encerramento
│   │   ├── graph/                 # Canvas 3D e detalhes do vértice
│   │   ├── editor/                # Modais de vértice, aresta e importação
│   │   ├── algorithms/            # Controles de playback e tabelas de resultados
│   │   └── dataStructures/        # Inspetores visuais de lista e matriz
│   ├── views/                     # Páginas da aplicação (Vue Router)
│   │   ├── DashboardView.vue      # Visão geral e métricas
│   │   ├── GraphEditorView.vue    # Editor de vértices e arestas
│   │   ├── GraphExplorerView.vue  # Exploração 3D em tela cheia
│   │   ├── AlgorithmLabView.vue   # Laboratório com 3D e passo a passo
│   │   ├── DataStructureView.vue  # Inspeção de lista e matriz
│   │   ├── ComplexityView.vue     # Guia acadêmico de complexidade Big-O
│   │   └── DocumentationView.vue  # Documentação e identificação do grupo
│   ├── styles/                    # Folhas de estilo globais e tokens
│   │   ├── tokens.css             # Paleta cyberpunk, variáveis e sombras
│   │   └── global.css             # Resets, botões, tabelas e acessibilidade
│   ├── router/
│   │   └── index.js               # Rotas do Vue Router 4
│   ├── tests/                     # Testes automatizados com Vitest
│   │   ├── structures.test.js     # Testes de heap, DSU, lista e matriz
│   │   ├── graphModel.test.js     # Testes de mutação, métricas e JSON
│   │   └── algorithms.test.js     # 22 testes cobrindo todos os cenários exigidos
│   ├── App.vue                    # Shell principal da interface
│   └── main.js                    # Ponto de entrada JavaScript
├── index.html                     # HTML5 raiz com fontes do Google
├── package.json                   # Dependências e scripts npm
├── vite.config.js                 # Configuração do Vite
├── vitest.config.js               # Configuração do Vitest
└── README.md                      # Documentação completa em português
```

---

## 9. Instalação e Execução

### Pré-requisitos
- **Node.js:** Versão 18.x ou superior (testado com Node v24.12.0).
- **npm:** Versão 9.x ou superior.

### Passo a Passo

1. **Instalar as dependências do projeto:**
   ```bash
   npm install
   ```

2. **Executar a aplicação em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação será disponibilizada localmente no endereço exibido no terminal (tipicamente `http://localhost:5173/`).

3. **Executar a suíte de testes automatizados:**
   ```bash
   npm test
   ```
   Todos os 37 testes unitários serão executados via Vitest, validando o comportamento matemático dos algoritmos e estruturas.

4. **Gerar o build otimizado de produção:**
   ```bash
   npm run build
   ```
   Os arquivos compilados serão gerados no diretório `dist/`.

5. **Visualizar o build de produção localmente:**
   ```bash
   npm run preview
   ```

---

## 10. Guia de Demonstração para Apresentação ao Vivo

Durante a avaliação com a banca ou professor, siga o seguinte roteiro didático:

1. **Demonstração Rápida com Exemplo Padrão (A, B, C, D):**
   - Acesse **Visão Geral** ou **Laboratório de Algoritmos**. O exemplo canônico com 4 vértices já vem carregado.
   - Execute o **Kruskal**: demonstre que das 5 arestas, exatamente 3 ($V - 1$) são selecionadas para compor a AGM com custo 9, e a aresta $(C, D)$ de peso 6 é rejeitada por formar ciclo.
2. **Demonstração do Dilema BFS vs Dijkstra:**
   - Na barra lateral, selecione o exemplo **"2. Caminhos Alternativos (Dijkstra vs BFS)"**.
   - No laboratório, execute a **BFS** de $A$ para $D$: mostre que a BFS escolhe a conexão direta $A \to D$ (1 salto / aresta), ignorando que seu peso é 15.
   - Em seguida, selecione **Dijkstra** de $A$ para $D$: mostre que Dijkstra encontra o caminho de menor custo $A \to B \to C \to D$ (3 arestas, porém custo acumulado $2 + 3 + 1 = 6 < 15$).
3. **Demonstração de Kruskal em Grafo Desconexo (Floresta):**
   - Carregue o exemplo **"4. Grafo Desconexo e Sensores Isolados"**.
   - Execute o Kruskal: mostre que o algoritmo gera uma **Floresta Geradora Mínima** com 2 componentes, explicando claramente que não existe uma árvore única que conecte nós isolados.
4. **Demonstração de Validações ao Vivo:**
   - No **Editor de Grafos**, adicione uma aresta com peso negativo (ex: $-5$).
   - Tente executar o Dijkstra: observe a rejeição imediata com alerta didático sobre a quebra da propriedade gulosa.
   - Configure o grafo como direcionado e tente executar o Kruskal: observe o bloqueio imediato com botão para conversão.
5. **Inspeção da Memória:**
   - Acesse a seção **Estrutura de Dados**: mostre a Lista de Adjacência em tempo real e a Matriz de Adjacência, destacando as células com `null` (&mdash;) como ausência de aresta e o peso zero preservado.
6. **Finalização da Aplicação:**
   - Clique no botão vermelho **"Finalizar Aplicação"** no cabeçalho.
   - Confirme no modal: observe a liberação dos contextos gráficos do Three.js, a interrupção dos timers e a tela futurista de suspensão do sistema, demonstrando o botão "Retomar Aplicação".

---

## 11. Decisões de Arquitetura e Limitações Conhecidas

1. **Botão "Finalizar Aplicação":**
   - Por questões de segurança dos navegadores web modernos, scripts não têm permissão para fechar compulsoriamente abas que não foram abertas via `window.open()`.
   - A decisão técnica adotada foi implementar um encerramento real e gracioso da sessão (*graceful shutdown*): cancelamento de todos os loops de animação (`cancelAnimationFrame`), liberação de buffers de geometria e materiais WebGL (`dispose()`), perda forçada de contexto gráfico (`forceContextLoss()`) e suspensão dos ouvintes de eventos do mouse/teclado, acompanhada de tela informativa de encerramento com restauração controlada.
2. **Política para Arestas Paralelas e Laços:**
   - Conforme a boa prática matemática em grafos simples e ponderados, o sistema rejeita arestas paralelas idênticas entre o mesmo par de vértices na mesma direção, evitando ambiguidades de custo.
   - Auto-laços (*self-loops*, $u \to u$) são tratados com aviso de alerta, pois não contribuem para caminhos mínimos nem para árvores geradoras mínimas.
3. **Persistência Limpa:**
   - Apenas o modelo puro de dados matemáticos (vértices, posições, arestas e configurações) é persistido no `localStorage`. Objetos pesados da cena gráfica do Three.js (malhas, câmeras, renderizadores) são sempre recriados dinamicamente no ciclo de vida do Vue para evitar vazamentos de memória.
