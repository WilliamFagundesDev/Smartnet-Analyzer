<template>
  <div class="view-container algorithm-lab-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">LABORATÓRIO ACADÊMICO DE ALGORITMOS</h1>
        <p class="view-subtitle">Simulação passo a passo, percursos, menores caminhos e árvores geradoras mínimas</p>
      </div>
    </div>

    <!-- Controles do Algoritmo e Barra de Reprodução Didática -->
    <AlgorithmControls />

    <!-- Área Dividida: Visualização 3D e Tabela de Resultados Matemáticos -->
    <div class="lab-workspace">
      <!-- Painel Esquerdo: Canvas 3D Interativo -->
      <div class="visualizer-card card-elevated">
        <div class="card-header-bar">
          <div class="header-left">
            <Box class="icon-sm text-blue" />
            <span class="card-header-title">ANIMAÇÃO VISUAL DO ALGORITMO &middot; 3D</span>
          </div>
          <span class="badge badge-amber" v-if="currentStepIndex >= 0">
            Passo {{ currentStepIndex + 1 }} de {{ events.length }}
          </span>
        </div>

        <div class="canvas-box">
          <GraphCanvas3D />
        </div>
      </div>

      <!-- Painel Direito: Resultados Matemáticos e Tabelas -->
      <div class="results-card">
        <AlgorithmResultTable />
      </div>
    </div>

    <!-- Espaçador garantido de respiro inferior no final da rolagem -->
    <div class="scroll-bottom-spacer"></div>
  </div>
</template>

<script setup>
import { Box } from 'lucide-vue-next'
import { useAlgorithmRunner } from '../composables/useAlgorithmRunner.js'
import AlgorithmControls from '../components/algorithms/AlgorithmControls.vue'
import AlgorithmResultTable from '../components/algorithms/AlgorithmResultTable.vue'
import GraphCanvas3D from '../components/graph/GraphCanvas3D.vue'

const { currentStepIndex, events } = useAlgorithmRunner()
</script>

<style scoped>
.algorithm-lab-view {
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

.lab-workspace {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--spacing-4);
  flex: 1;
  min-height: 520px;
}

.visualizer-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-height: 480px;
}

.card-header-bar {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.card-header-title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
}

.canvas-box {
  flex: 1;
  position: relative;
  min-height: 420px;
}

.results-card {
  display: flex;
  flex-direction: column;
  min-height: 480px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

@media (max-width: 1080px) {
  .lab-workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .algorithm-lab-view {
    padding: var(--spacing-3);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .visualizer-card {
    min-height: 320px;
  }

  .canvas-box {
    min-height: 280px;
  }
}
</style>
