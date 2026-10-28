<template>
  <div class="view-container data-structure-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Estruturas de Dados em Memória</h1>
        <p class="view-subtitle">Inspeção direta da representação interna do grafo (Lista de Adjacência vs Matriz de Adjacência)</p>
      </div>

      <!-- Seletor de Abas em Cápsula Segmentada -->
      <div class="tab-segmented-capsule">
        <button
          class="capsule-btn"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          <span>Lista de Adjacência</span>
          <span class="complexity-badge font-mono">O(V + E)</span>
        </button>
        <button
          class="capsule-btn"
          :class="{ active: activeTab === 'matrix' }"
          @click="activeTab = 'matrix'"
        >
          <span>Matriz de Adjacência</span>
          <span class="complexity-badge font-mono">O(V²)</span>
        </button>
        <button
          class="capsule-btn"
          :class="{ active: activeTab === 'compare' }"
          @click="activeTab = 'compare'"
        >
          <span>Comparativo Teórico</span>
        </button>
      </div>
    </div>

    <!-- Conteúdo da Aba Selecionada -->
    <div class="tab-view-body">
      <div v-if="activeTab === 'list'">
        <AdjacencyListVisualizer />
      </div>

      <div v-else-if="activeTab === 'matrix'">
        <AdjacencyMatrixVisualizer />
      </div>

      <div v-else-if="activeTab === 'compare'" class="compare-card card-elevated">
        <div class="compare-header">
          <h3 class="compare-title">Análise Comparativa de Representação em Memória</h3>
          <p class="compare-intro">
            A escolha da estrutura de dados fundamental para representar um grafo impacta diretamente tanto o consumo de memória principal quanto o tempo de execução dos algoritmos que operam sobre ele.
          </p>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Critério de Avaliação</th>
                <th>Lista de Adjacência (Padrão)</th>
                <th>Matriz de Adjacência (Alternativa)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold">Complexidade Espacial (Memória)</td>
                <td class="text-green font-mono font-bold">O(V + E) &mdash; Ótima para grafos esparsos</td>
                <td class="text-amber font-mono font-bold">O(V²) &mdash; Independe da quantidade de arestas E</td>
              </tr>
              <tr>
                <td class="font-bold">Verificar se Existe Aresta (u, v)</td>
                <td class="font-mono">O(grau(u)) &mdash; Percorre lista de vizinhos de u</td>
                <td class="text-green font-mono font-bold">O(1) &mdash; Acesso indexado direto M[u][v]</td>
              </tr>
              <tr>
                <td class="font-bold">Iterar Todos os Vizinhos de u</td>
                <td class="text-green font-mono font-bold">O(grau(u)) &mdash; Itera apenas conexões reais</td>
                <td class="font-mono">O(V) &mdash; Varrer toda a linha u da grade</td>
              </tr>
              <tr>
                <td class="font-bold">Adicionar um Novo Vértice</td>
                <td class="text-green font-mono font-bold">O(1) &mdash; Adiciona entrada no Map</td>
                <td class="font-mono">O(V) ou realocação V² &mdash; Redimensionamento da grade</td>
              </tr>
              <tr>
                <td class="font-bold">Remover um Vértice</td>
                <td class="font-mono">O(V + E) &mdash; Remove nó e arestas incidentes</td>
                <td class="font-mono">O(V²) &mdash; Reconstrução de linhas/colunas</td>
              </tr>
              <tr>
                <td class="font-bold">Adequação Prática</td>
                <td>Excelente para redes urbanas, estradas, fibras ópticas e roteadores reais onde E &ll; V².</td>
                <td>Adequada para grafos densos onde E &asymp; V² ou quando consultas de adjacência instantânea O(1) são críticas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Espaçador garantido de respiro inferior no final da rolagem -->
    <div class="scroll-bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdjacencyListVisualizer from '../components/dataStructures/AdjacencyListVisualizer.vue'
import AdjacencyMatrixVisualizer from '../components/dataStructures/AdjacencyMatrixVisualizer.vue'

const activeTab = ref('list')
</script>

<style scoped>
.data-structure-view {
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
  gap: var(--spacing-3);
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

.tab-segmented-capsule {
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 3px;
  box-shadow: var(--shadow-xs);
}

.capsule-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.capsule-btn:hover {
  color: var(--text-primary);
}

.capsule-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: var(--shadow-xs);
}

.complexity-badge {
  font-size: 0.65rem;
  padding: 0.05rem 0.35rem;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  color: var(--text-muted);
}

.capsule-btn.active .complexity-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.tab-view-body {
  flex: 1;
}

.compare-card {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.compare-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.compare-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.compare-intro {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .data-structure-view {
    padding: var(--spacing-3);
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .tab-segmented-capsule {
    width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-md);
  }

  .capsule-btn {
    flex: 1;
    white-space: nowrap;
    justify-content: center;
    padding: 0.4rem;
  }
}
</style>
