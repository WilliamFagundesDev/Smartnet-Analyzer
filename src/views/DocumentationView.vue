<template>
  <div class="view-container documentation-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Documentação Acadêmica & Especificação</h1>
        <p class="view-subtitle">Fundamentação conceitual, modelagem SmartNet, protocolo JSON e roteiro de avaliação</p>
      </div>

      <div class="badge-group">
        <span class="badge badge-blue">Análise e Complexidade de Algoritmos</span>
      </div>
    </div>

    <!-- Identificação do Grupo e Avaliação -->
    <div class="card-elevated section-card">
      <div class="card-heading-group">
        <span class="step-num-pill font-mono">01</span>
        <h3 class="section-title">Identificação do Projeto & Integrantes</h3>
      </div>
      <p class="section-text">
        Estruturação padronizada para apresentação formal em banca avaliadora universitária:
      </p>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">DISCIPLINA:</span>
          <span class="info-value font-mono">Análise e Complexidade de Algoritmos</span>
        </div>
        <div class="info-item">
          <span class="info-label">CURSO:</span>
          <span class="info-value">[ Bacharelado em Ciência da Computação / Eng. Software ]</span>
        </div>
        <div class="info-item">
          <span class="info-label">PROFESSOR(A):</span>
          <span class="info-value">[ Nome do(a) Docente Avaliador(a) ]</span>
        </div>
        <div class="info-item">
          <span class="info-label">INSTITUIÇÃO:</span>
          <span class="info-value">[ Universidade / Centro Universitário ]</span>
        </div>
        <div class="info-item full-width">
          <span class="info-label">INTEGRANTES DO GRUPO (NOME E MATRÍCULA):</span>
          <div class="student-placeholder-box font-mono">
            1. William Fagundes — Desenvolvedor & Autor do Projeto<br />
            2. [ Integrante 2 — Matrícula: XXXXXXX ]<br />
            3. [ Integrante 3 — Matrícula: XXXXXXX ]<br />
            4. [ Integrante 4 — Matrícula: XXXXXXX ]
          </div>
        </div>
      </div>
    </div>

    <!-- Metáfora de Cidade Inteligente -->
    <div class="card-elevated section-card">
      <div class="card-heading-group">
        <span class="step-num-pill font-mono">02</span>
        <h3 class="section-title">Metáfora de Cidade Inteligente (SmartNet)</h3>
      </div>
      <p class="section-text">
        O sistema modela computacionalmente a infraestrutura cibernética e de conectividade física de uma metrópole:
      </p>
      <div class="metaphor-grid">
        <div class="metaphor-box">
          <span class="metaphor-title text-blue">&bull; Vértices (Pontos Urbanos):</span>
          <p>Representam polos de processamento (Datacenters), nós centrais de roteamento (Hubs), pontos municipais padrão e nós periféricos de sensoriamento IoT.</p>
        </div>
        <div class="metaphor-box">
          <span class="metaphor-title text-purple">&bull; Arestas (Canais de Comunicação):</span>
          <p>Representam cabos aéreos/subterrâneos de fibra óptica, avenidas de tráfego veicular, enlaces de rádio micro-ondas ou tubulações inteligentes.</p>
        </div>
        <div class="metaphor-box">
          <span class="metaphor-title text-green">&bull; Pesos das Arestas:</span>
          <p>Quantificam grandezas físicas como distância linear (km), latência de transmissão (ms), custo financeiro de implantação ($) ou tempo de trajeto.</p>
        </div>
        <div class="metaphor-box">
          <span class="metaphor-title text-amber">&bull; Direcionamento:</span>
          <p>Diferencia canais bidirecionais simétricos (vias de mão dupla) de fluxos unidirecionais restritos (canais de telemetria ou vias de sentido único).</p>
        </div>
      </div>
    </div>

    <!-- Guia Didático de Operação dos Algoritmos -->
    <div class="card-elevated section-card">
      <div class="card-heading-group">
        <span class="step-num-pill font-mono">03</span>
        <h3 class="section-title">Guia Didático dos Algoritmos</h3>
      </div>
      <div class="steps-flow">
        <div class="step-card">
          <div class="step-num font-mono">DFS</div>
          <div class="step-body">
            <h4 class="step-title">Busca em Profundidade</h4>
            <p>Avança recursivamente pelo caminho mais profundo antes do retrocesso (backtracking). Essencial para detectar percursos, ciclos e componentes conectados.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num font-mono">BFS</div>
          <div class="step-body">
            <h4 class="step-title">Busca em Largura</h4>
            <p>Utiliza uma fila FIFO real para expandir ondas concêntricas por níveis. Encontra com rigor o <strong>menor número de arestas (saltos)</strong> entre nós.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num font-mono">DIJ</div>
          <div class="step-body">
            <h4 class="step-title">Dijkstra (Menor Custo)</h4>
            <p>Utiliza o Min-Heap para fixar gulosamente o vértice de menor distância. Requer pesos não-negativos e encontra o caminho de <strong>menor custo total acumulado</strong>.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num font-mono">KRU</div>
          <div class="step-body">
            <h4 class="step-title">Kruskal (Árvore Mínima)</h4>
            <p>Ordena as arestas por peso e utiliza a estrutura Union-Find para conectar componentes disjuntos sem formar ciclos, minimizando o custo total da rede.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Especificação do Formato JSON -->
    <div class="card-elevated section-card">
      <div class="card-heading-group">
        <span class="step-num-pill font-mono">04</span>
        <h3 class="section-title">Especificação JSON Padronizada</h3>
      </div>
      <p class="section-text">
        O sistema exporta e importa topologias através de uma especificação JSON estrita e padronizada:
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
  gap: var(--spacing-4);
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
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.view-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.section-card {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.card-heading-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-2);
}

.step-num-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
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
  margin-top: var(--spacing-1);
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
  font-weight: 600;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-3);
}

.step-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.step-num {
  font-size: 0.85rem;
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
  line-height: 1.5;
}

.text-blue { color: var(--color-primary); }
.text-purple { color: var(--color-purple); }
.text-green { color: var(--color-success); }
.text-amber { color: var(--color-warning); }

@media (max-width: 768px) {
  .documentation-view {
    padding: var(--spacing-3);
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .info-grid,
  .metaphor-grid,
  .steps-flow {
    grid-template-columns: 1fr;
  }
}
</style>
