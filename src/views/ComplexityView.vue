<template>
  <div class="view-container complexity-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">ANÁLISE DE COMPLEXIDADE DOS ALGORITMOS</h1>
        <p class="view-subtitle">Fundamentação assintótica rigorosa (Big-O), justificativas matemáticas e estruturas auxiliares</p>
      </div>

      <div class="didactic-badge">
        <span class="badge badge-purple">Guia para Apresentação Oral Universitária</span>
      </div>
    </div>

    <!-- Tabela Resumo Comparativo Big-O -->
    <div class="card-elevated table-card">
      <div class="card-header-bar">
        <h3 class="card-title">MATRIZ ASSINTÓTICA DOS ALGORITMOS IMPLEMENTADOS</h3>
      </div>
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Algoritmo</th>
              <th>Complexidade Temporal</th>
              <th>Espaço Auxiliar</th>
              <th>Estrutura Principal</th>
              <th>Condições & Restrições</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-bold text-blue">DFS (Busca em Profundidade)</td>
              <td class="font-mono font-bold text-green">O(V + E)</td>
              <td class="font-mono">O(V)</td>
              <td>Lista de Adjacência + Pilha</td>
              <td>Funciona em direcionados e não-direcionados; trata grafos desconexos com floresta.</td>
            </tr>
            <tr>
              <td class="font-bold text-blue">BFS (Busca em Largura)</td>
              <td class="font-mono font-bold text-green">O(V + E)</td>
              <td class="font-mono">O(V)</td>
              <td>Lista de Adjacência + Fila FIFO</td>
              <td>Calcula caminhos mínimos em <strong>número de arestas (unweighted)</strong>.</td>
            </tr>
            <tr>
              <td class="font-bold text-blue">Dijkstra (Menor Caminho)</td>
              <td class="font-mono font-bold text-green">O((V + E) log V)</td>
              <td class="font-mono">O(V)</td>
              <td>Lista de Adjacência + Min-Heap Binário</td>
              <td>Exige pesos estritamente <strong>não-negativos (w &ge; 0)</strong>. Rejeita pesos negativos.</td>
            </tr>
            <tr>
              <td class="font-bold text-blue">Kruskal (Árvore Geradora Mínima)</td>
              <td class="font-mono font-bold text-green">O(E log E)</td>
              <td class="font-mono">O(V + E)</td>
              <td>Union-Find (DSU com Compressão e Rank)</td>
              <td>Formulado para <strong>grafos NÃO-DIRECIONADOS</strong>. Em desconexos gera Floresta Mínima.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cards de Detalhamento Didático -->
    <div class="details-grid">
      <!-- DFS Card -->
      <div class="detail-card glass-panel">
        <div class="detail-badge-row">
          <span class="badge badge-blue">DFS</span>
          <span class="font-mono text-green">O(V + E)</span>
        </div>
        <h4 class="detail-title">Busca em Profundidade</h4>
        <p class="detail-text">
          Cada vértice é marcado como visitado exatamente uma vez (custo $O(V)$). Para cada vértice $u$, todas as suas conexões na Lista de Adjacência são inspecionadas uma única vez (no caso direcionado) ou duas vezes (no caso não-direcionado), totalizando $O(E)$. O tempo total é portanto estritamente linear em relação ao tamanho da entrada: $O(V + E)$.
        </p>
        <div class="detail-list">
          <div>&bull; <strong>Espaço Auxiliar:</strong> $O(V)$ para a pilha de recursão/execução no pior caso (grafo linha).</div>
          <div>&bull; <strong>Comportamento em Desconexos:</strong> Itera sobre todos os vértices criando uma floresta DFS de componentes.</div>
        </div>
      </div>

      <!-- BFS Card -->
      <div class="detail-card glass-panel">
        <div class="detail-badge-row">
          <span class="badge badge-blue">BFS</span>
          <span class="font-mono text-green">O(V + E)</span>
        </div>
        <h4 class="detail-title">Busca em Largura</h4>
        <p class="detail-text">
          Utiliza uma fila FIFO real implementada em JavaScript. Cada vértice entra e sai da fila no máximo uma vez ($O(V)$). Ao ser desenfileirado, suas arestas incidentes são varridas ($O(E)$). Garante a descoberta dos vértices por níveis de distância mínima em número de arestas (hops).
        </p>
        <div class="detail-list">
          <div>&bull; <strong>Distinção Crucial:</strong> BFS não resolve caminhos mínimos ponderados quando pesos variam (para isso usa-se Dijkstra).</div>
          <div>&bull; <strong>Espaço Auxiliar:</strong> $O(V)$ para a fila FIFO e mapa de distâncias.</div>
        </div>
      </div>

      <!-- Dijkstra Card -->
      <div class="detail-card glass-panel">
        <div class="detail-badge-row">
          <span class="badge badge-purple">Dijkstra</span>
          <span class="font-mono text-green">O((V + E) log V)</span>
        </div>
        <h4 class="detail-title">Menor Caminho Ponderado</h4>
        <p class="detail-text">
          Implementado com Min-Heap Binário (PriorityQueue) construído do zero. A operação de extrair o vértice de menor distância (<code>dequeue</code>) ocorre no máximo $V$ vezes, com custo $O(\log V)$ cada. Cada relaxamento de aresta bem-sucedido pode inserir o nó atualizado na fila em $O(\log V)$, ocorrendo no máximo $E$ vezes. O custo acumulado é $O(V \log V + E \log V) = O((V + E) \log V)$.
        </p>
        <div class="detail-list">
          <div>&bull; <strong>Restrição Matemática:</strong> Se houver pesos negativos, a premissa gulosa de Dijkstra é invalidada (o algoritmo do sistema valida e bloqueia com erro explícito).</div>
          <div>&bull; <strong>Espaço Auxiliar:</strong> $O(V)$ para o heap e vetores de distâncias e predecessores.</div>
        </div>
      </div>

      <!-- Kruskal Card -->
      <div class="detail-card glass-panel">
        <div class="detail-badge-row">
          <span class="badge badge-purple">Kruskal</span>
          <span class="font-mono text-green">O(E log E)</span>
        </div>
        <h4 class="detail-title">Árvore Geradora Mínima (AGM)</h4>
        <p class="detail-text">
          A etapa dominante é a ordenação das $E$ arestas em ordem não-decrescente de peso, que leva $O(E \log E)$. O processamento guloso subsequente utiliza a estrutura Disjoint Set Union (DSU) com compressão de caminho e união por rank. Cada operação de <code>find</code> e <code>union</code> custa $O(\alpha(V))$, onde $\alpha$ é a inversa de Ackermann ($\alpha(V) \le 4$ para qualquer entrada realista).
        </p>
        <div class="detail-list">
          <div>&bull; <strong>Condição de Conexão:</strong> Em grafos conexos com $V$ nós, seleciona exatamente $V - 1$ arestas. Em grafos desconexos, constrói a Floresta Geradora Mínima.</div>
          <div>&bull; <strong>Grafos Direcionados:</strong> O algoritmo de Kruskal é formulado exclusivamente para grafos não-direcionados.</div>
        </div>
      </div>
    </div>

    <!-- Espaçador garantido de respiro inferior no final da rolagem -->
    <div class="scroll-bottom-spacer"></div>
  </div>
</template>

<style scoped>
.complexity-view {
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
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: 0.05em;
}

.view-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.table-card {
  overflow: hidden;
}

.card-header-bar {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-4);
}

.detail-card {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.detail-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
}

.detail-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.6;
}

.detail-list {
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: var(--spacing-3);
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.font-bold { font-weight: 700; }
.text-blue { color: var(--color-primary); }
.text-purple { color: var(--color-purple); }
.text-green { color: var(--color-success); }

@media (max-width: 768px) {
  .complexity-view {
    padding: var(--spacing-3);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-card {
    padding: var(--spacing-3);
  }
}
</style>
