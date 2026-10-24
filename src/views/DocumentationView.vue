<template>
  <div class="view-container documentation-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">DOCUMENTAÇÃO ACADÊMICA & GUIA DO SISTEMA</h1>
        <p class="view-subtitle">Especificação formal, guia de apresentação ao vivo e campos avaliativos</p>
      </div>

      <div class="badge-group">
        <span class="badge badge-blue">Análise e Complexidade de Algoritmos</span>
      </div>
    </div>

    <!-- Identificação do Grupo e Avaliação -->
    <div class="card-elevated section-card">
      <h3 class="section-title">1. IDENTIFICAÇÃO DO PROJETO & INTEGRANTES DO GRUPO</h3>
      <p class="section-text">
        Os campos abaixo foram estruturados para identificação do grupo na entrega formal e durante a apresentação ao vivo:
      </p>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">DISCIPLINA:</span>
          <span class="info-value font-mono">Análise e Complexidade de Algoritmos</span>
        </div>
        <div class="info-item">
          <span class="info-label">CURSO:</span>
          <span class="info-value">[ Preencher: Bacharelado em Ciência da Computação / Eng. Software ]</span>
        </div>
        <div class="info-item">
          <span class="info-label">PROFESSOR(A):</span>
          <span class="info-value">[ Preencher: Nome do(a) Professor(a) ]</span>
        </div>
        <div class="info-item">
          <span class="info-label">INSTITUIÇÃO:</span>
          <span class="info-value">[ Preencher: Universidade / Faculdade ]</span>
        </div>
        <div class="info-item full-width">
          <span class="info-label">INTEGRANTES DO GRUPO (NOME E MATRÍCULA):</span>
          <div class="student-placeholder-box font-mono">
            1. [ Preencher Nome Completo do Aluno 1 - Matrícula: XXXXXXX ]<br />
            2. [ Preencher Nome Completo do Aluno 2 - Matrícula: XXXXXXX ]<br />
            3. [ Preencher Nome Completo do Aluno 3 - Matrícula: XXXXXXX ]<br />
            4. [ Preencher Nome Completo do Aluno 4 - Matrícula: XXXXXXX ]
          </div>
        </div>
      </div>
    </div>

    <!-- Metáfora de Cidade Inteligente -->
    <div class="card-elevated section-card">
      <h3 class="section-title">2. METÁFORA DE CIDADE INTELIGENTE (SMARTNET)</h3>
      <p class="section-text">
        O sistema modela a infraestrutura cibernética e de conectividade física de uma metrópole:
      </p>
      <div class="metaphor-grid">
        <div class="metaphor-box">
          <span class="metaphor-title text-blue">&bull; Vértices (Pontos Urbanos):</span>
          <p>Representam polos de processamento (Datacenters), nós centrais de roteamento (Hubs), pontos municipais padrão e nós periféricos de sensoriamento IoT.</p>
        </div>
        <div class="metaphor-box">
          <span class="metaphor-title text-purple">&bull; Arestas (Canais de Comunicação):</span>
          <p>Representam cabos submarinos/aéreos de fibra óptica, avenidas de tráfego veicular, enlaces de rádio micro-ondas ou tubulações inteligentes.</p>
        </div>
        <div class="metaphor-box">
          <span class="metaphor-title text-green">&bull; Pesos das Arestas:</span>
          <p>Quantificam grandezas físicas como distância linear (km), latência de transmissão (ms), custo de implantação financeira ($) ou tempo de trajeto.</p>
        </div>
        <div class="metaphor-box">
          <span class="metaphor-title text-amber">&bull; Direcionamento:</span>
          <p>Diferencia canais bidirecionais simétricos (ex: vias de mão dupla) de fluxos unidirecionais restritos (ex: canais de broadcast ou vias de sentido único).</p>
        </div>
      </div>
    </div>

    <!-- Guia de Operação dos Algoritmos -->
    <div class="card-elevated section-card">
      <h3 class="section-title">3. GUIA DIDÁTICO DE EXECUÇÃO DOS ALGORITMOS</h3>
      <div class="steps-flow">
        <div class="step-card">
          <div class="step-num font-mono">01</div>
          <div class="step-body">
            <h4 class="step-title">Busca em Profundidade (DFS)</h4>
            <p>Selecione a raiz. O algoritmo avança recursivamente pelo caminho mais profundo antes de retroceder (backtracking). Perfeito para detectar percursos, componentes e conectividade global.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num font-mono">02</div>
          <div class="step-body">
            <h4 class="step-title">Busca em Largura (BFS)</h4>
            <p>Utiliza uma fila FIFO para expandir ondas concêntricas por níveis. Encontra com rigor o <strong>menor número de arestas (saltos)</strong> entre nós.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num font-mono">03</div>
          <div class="step-body">
            <h4 class="step-title">Dijkstra (Caminho Mínimo Ponderado)</h4>
            <p>Utiliza o Min-Heap para fixar gulosamente o vértice mais próximo. Requer pesos não-negativos e encontra o caminho de <strong>menor custo total acumulado</strong>.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num font-mono">04</div>
          <div class="step-body">
            <h4 class="step-title">Kruskal (Árvore Geradora Mínima - AGM)</h4>
            <p>Ordena as arestas por peso e utiliza a estrutura Union-Find para conectar componentes disjuntos sem formar ciclos. Conecta toda a cidade com o menor custo financeiro possível.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Especificação do Formato JSON -->
    <div class="card-elevated section-card">
      <h3 class="section-title">4. ESQUEMA JSON DOCUMENTADO DE IMPORTAÇÃO & EXPORTAÇÃO</h3>
      <p class="section-text">
        O sistema exporta e importa grafos através de uma estrutura JSON estrita e padronizada:
      </p>
      <pre class="json-code-box font-mono">{
  "name": "Nome da Rede Metropolitana",
  "directed": false,
  "weighted": true,
  "vertices": [
    { "id": "A", "label": "Bairro Centro", "x": -20, "y": 15, "z": 0, "type": "hub" },
    { "id": "B", "label": "Polo Tecnológico", "x": 20, "y": 15, "z": 10, "type": "datacenter" }
  ],
  "edges": [
    { "id": "e1", "source": "A", "target": "B", "weight": 5, "label": "5" }
  ]
}</pre>
    </div>

    <!-- Espaçador garantido de respiro inferior no final da rolagem -->
    <div class="scroll-bottom-spacer"></div>
  </div>
</template>

<style scoped>
.documentation-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  padding: var(--spacing-5);
  height: 100%;
  overflow-y: auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.view-title {
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: 0.05em;
}

.view-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.section-card {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.section-title {
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-2);
}

.section-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.info-item {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.info-value {
  font-size: var(--text-xs);
  color: var(--color-primary);
}

.student-placeholder-box {
  background: var(--bg-subtle);
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-3);
  color: var(--text-primary);
  line-height: 1.6;
  font-size: var(--text-xs);
}

.metaphor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-3);
}

.metaphor-box {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

.metaphor-title {
  font-weight: 700;
  margin-bottom: 0.35rem;
  display: block;
}

.steps-flow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-3);
}

.step-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  gap: var(--spacing-3);
}

.step-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-title {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-primary);
}

.step-body p {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.json-code-box {
  background: var(--code-bg);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  color: var(--color-path);
  font-size: 0.78rem;
  overflow-x: auto;
}

.text-blue { color: var(--color-primary); }
.text-purple { color: var(--color-purple); }
.text-green { color: var(--color-success); }
.text-amber { color: var(--color-warning); }

@media (max-width: 768px) {
  .documentation-view {
    padding: var(--spacing-3);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .doc-section {
    padding: var(--spacing-4);
  }

  .info-grid,
  .metaphor-grid,
  .steps-flow {
    grid-template-columns: 1fr;
  }
}
</style>
