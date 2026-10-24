<template>
  <div class="view-container data-structure-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">ESTRUTURAS DE DADOS EM MEMÓRIA</h1>
        <p class="view-subtitle">Inspeção direta da representação interna do grafo em JavaScript puro (Lista vs Matriz)</p>
      </div>

      <div class="tab-pill-group">
        <button
          class="pill-btn"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          Lista de Adjacência [O(V + E)]
        </button>
        <button
          class="pill-btn"
          :class="{ active: activeTab === 'matrix' }"
          @click="activeTab = 'matrix'"
        >
          Matriz de Adjacência [O(V²)]
        </button>
        <button
          class="pill-btn"
          :class="{ active: activeTab === 'compare' }"
          @click="activeTab = 'compare'"
        >
          Comparativo Teórico
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

      <div v-else-if="activeTab === 'compare'" class="compare-card glass-panel">
        <h3 class="compare-title">ANÁLISE COMPARATIVA DE ESTRUTURAS DE REPRESENTAÇÃO</h3>
        <p class="compare-intro">
          A escolha da estrutura de dados fundamental para representar um grafo impacta diretamente tanto o consumo de memória principal quanto o tempo de execução dos algoritmos que operam sobre ele.
        </p>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Critério de Avaliação</th>
                <th>Lista de Adjacência (Implementação Principal)</th>
                <th>Matriz de Adjacência (Alternativa Visual)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold">Complexidade Espacial (Memória)</td>
                <td class="text-green font-mono"><strong>O(V + E)</strong> &mdash; Ótima para grafos esparsos</td>
                <td class="text-amber font-mono"><strong>O(V²)</strong> &mdash; Independe da quantidade de arestas E</td>
              </tr>
              <tr>
                <td class="font-bold">Verificar se Existe Aresta (u, v)</td>
                <td class="font-mono">O(grau(u)) &mdash; Percorre lista de u</td>
                <td class="text-green font-mono"><strong>O(1)</strong> &mdash; Acesso direto indexado M[u][v]</td>
              </tr>
              <tr>
                <td class="font-bold">Iterar Todos os Vizinhos de u</td>
                <td class="text-green font-mono"><strong>O(grau(u))</strong> &mdash; Itera apenas conexões reais</td>
                <td class="font-mono">O(V) &mdash; Precisa varrer toda a linha u da matriz</td>
              </tr>
              <tr>
                <td class="font-bold">Adicionar um Novo Vértice</td>
                <td class="text-green font-mono"><strong>O(1)</strong> &mdash; Adiciona entrada no Map</td>
                <td class="font-mono">O(V) ou realocação V² &mdash; Redimensionamento da grade</td>
              </tr>
              <tr>
                <td class="font-bold">Remover um Vértice</td>
                <td class="font-mono">O(V + E) &mdash; Remove nó e arestas incidentes</td>
                <td class="font-mono">O(V²) &mdash; Reconstrução ou deslocamento de linhas/colunas</td>
              </tr>
              <tr>
                <td class="font-bold">Adequação Prática</td>
                <td>Excelente para a maioria das redes urbanas do mundo real (ruas, fibras, rotas) onde E &ll; V².</td>
                <td>Adequada para grafos densos onde E &asymp; V² ou quando consultas de adjacência em tempo O(1) são críticas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: 0.05em;
}

.view-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.tab-pill-group {
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.25rem;
}

.pill-btn {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.pill-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.tab-view-body {
  flex: 1;
}

.compare-card {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.compare-title {
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.compare-intro {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.6;
}

.font-bold {
  font-weight: 700;
}

@media (max-width: 768px) {
  .data-structure-view {
    padding: var(--spacing-3);
    gap: var(--spacing-3);
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .tab-pill-group {
    width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-md);
    padding: 0.2rem;
  }

  .pill-btn {
    white-space: nowrap;
    padding: 0.4rem 0.75rem;
    font-size: 0.72rem;
  }

  .compare-card {
    padding: var(--spacing-3);
  }
}
</style>
