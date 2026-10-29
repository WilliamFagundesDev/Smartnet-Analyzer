<template>
  <div class="view-container algorithm-lab-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Laboratório de Algoritmos</h1>
        <p class="view-subtitle">
          Simulação passo a passo e comparação simultânea em 3D de 1, 2, 3 ou todos os 4 algoritmos
        </p>
      </div>
    </div>

    <!-- Controles de Seleção Múltipla e Barra de Reprodução Sincronizada -->
    <AlgorithmControls />

    <!-- =======================================================================
         MODO 1: EXECUÇÃO INDIVIDUAL (1 ALGORITMO SELECIONADO)
         ======================================================================= -->
    <div v-if="!isMultiMode" class="lab-workspace-single">
      <!-- Painel Esquerdo: Canvas 3D Interativo + Estrutura Interna ao Vivo -->
      <div class="visualizer-card card-elevated">
        <div class="card-header-bar">
          <div class="header-left">
            <Box class="icon-sm text-blue" />
            <span class="card-header-title">
              Visualização Espacial &middot; 3D ({{ getAlgoMeta(selectedAlgorithm).name }})
            </span>
          </div>
          <span
            class="badge badge-amber font-mono"
            v-if="currentStepIndex >= 0 && totalSteps > 0"
          >
            Passo {{ currentStepIndex + 1 }} de {{ totalSteps }}
          </span>
        </div>

        <div class="canvas-box">
          <GraphCanvas3D :highlights="algoHighlightsMap[selectedAlgorithm]" />
        </div>

        <!-- Inspetor ao Vivo da Estrutura Interna (O que o algoritmo está fazendo) -->
        <div
          v-if="getAlgoLiveSummary(selectedAlgorithm)"
          class="live-structure-footer"
        >
          <div class="structure-group">
            <span class="structure-title font-mono">
              {{ getAlgoLiveSummary(selectedAlgorithm).structureLabel }}:
            </span>
            <div class="structure-chips font-mono">
              <template v-if="getAlgoLiveSummary(selectedAlgorithm).structureItems.length > 0">
                <span
                  v-for="(item, idx) in getAlgoLiveSummary(selectedAlgorithm).structureItems.slice(0, 8)"
                  :key="idx"
                  class="struct-chip"
                >
                  {{ item }}
                </span>
                <span
                  v-if="getAlgoLiveSummary(selectedAlgorithm).structureItems.length > 8"
                  class="struct-more"
                >
                  +{{ getAlgoLiveSummary(selectedAlgorithm).structureItems.length - 8 }}
                </span>
              </template>
              <span v-else class="struct-empty">
                ({{ getAlgoLiveSummary(selectedAlgorithm).emptyStructureText }})
              </span>
            </div>
          </div>

          <div class="live-metrics-pills font-mono">
            <span
              v-for="(m, i) in getAlgoLiveSummary(selectedAlgorithm).metrics"
              :key="i"
              class="live-metric-tag"
            >
              <span class="text-muted">{{ m.label }}:</span>
              <strong>{{ m.value }}</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Painel Direito: Resultados Matemáticos e Tabelas -->
      <div class="results-card">
        <AlgorithmResultTable />
      </div>
    </div>

    <!-- =======================================================================
         MODO 2: SIMULAÇÃO SIMULTÂNEA EM 3D (2, 3 OU 4 ALGORITMOS AO MESMO TEMPO)
         ======================================================================= -->
    <div v-else class="lab-workspace-multi">
      <!-- Barra de Controle dos Modelos 3D Simultâneos -->
      <div class="multi-3d-toolbar card-elevated">
        <div class="toolbar-left-info">
          <Box class="icon-sm text-blue" />
          <span class="multi-toolbar-title">
            Modelos 3D Simultâneos ({{ selectedAlgorithms.length }} ativos)
          </span>
          <span class="multi-toolbar-hint">
            Gire a câmera para inspecionar todos sob o mesmo ângulo &middot; Clique em uma aresta para marcá-la <strong>[ ]</strong> sem mudar sua cor
          </span>
        </div>

        <div class="toolbar-right-controls">
          <!-- Layout 2x2 vs 1x4 quando todos os 4 algoritmos estão ativos -->
          <div v-if="selectedAlgorithms.length === 4" class="grid-layout-toggle">
            <button
              type="button"
              class="layout-opt-btn"
              :class="{ active: fourGridLayout === '2x2' }"
              @click="fourGridLayout = '2x2'"
              title="Exibir os 4 modelos 3D em grade 2x2 ampla"
            >
              Grade 2&times;2
            </button>
            <button
              type="button"
              class="layout-opt-btn"
              :class="{ active: fourGridLayout === '1x4' }"
              @click="fourGridLayout = '1x4'"
              title="Exibir os 4 modelos 3D lado a lado em 4 colunas"
            >
              4 Colunas
            </button>
          </div>

          <!-- Sincronizar Câmeras 3D -->
          <button
            type="button"
            class="sync-cam-btn"
            :class="{ active: syncCameras }"
            @click="syncCameras = !syncCameras"
            title="Sincronizar rotação, zoom e enquadramento entre todos os modelos 3D"
          >
            <Link2 v-if="syncCameras" class="icon-xs" />
            <Unlink2 v-else class="icon-xs" />
            <span>{{ syncCameras ? 'Câmeras Sincronizadas' : 'Câmeras Livres' }}</span>
          </button>

          <!-- Centralizar Todos -->
          <button
            type="button"
            class="btn btn-secondary btn-xs"
            @click="fitAllCameras"
            title="Centralizar e enquadrar todos os modelos 3D"
          >
            <Maximize2 class="icon-xs" />
            <span>Centralizar Todos</span>
          </button>
        </div>
      </div>

      <!-- Grade Responsiva com os 2, 3 ou 4 Modelos 3D + O Que Cada Um Está Fazendo -->
      <div class="multi-3d-grid" :class="multiGridClass">
        <div
          v-for="algoKey in selectedAlgorithms"
          :key="algoKey"
          class="multi-algo-3d-card card-elevated"
          :style="{ '--card-accent': getAlgoMeta(algoKey).accent }"
        >
          <!-- Cabeçalho do Modelo 3D Individual -->
          <div class="algo-3d-header">
            <div class="algo-header-id">
              <span class="algo-accent-dot" :style="{ background: getAlgoMeta(algoKey).accent }"></span>
              <span class="algo-3d-name">{{ getAlgoMeta(algoKey).name }}</span>
              <span class="algo-3d-cat">{{ getAlgoMeta(algoKey).category }}</span>
              <span class="algo-3d-comp font-mono">{{ getAlgoMeta(algoKey).complexityTime }}</span>
            </div>

            <div class="algo-header-status">
              <span
                v-if="getAlgoRun(algoKey)?.error"
                class="badge badge-amber font-mono"
              >
                Incompatível
              </span>
              <span
                v-else-if="getAlgoExecutionStatus(algoKey) === 'completed'"
                class="badge badge-green font-mono"
              >
                &#10003; {{ getAlgoLiveSummary(algoKey)?.totalSteps }} passos
              </span>
              <span
                v-else-if="getAlgoLiveSummary(algoKey)"
                class="badge badge-amber font-mono"
              >
                Passo {{ getAlgoLiveSummary(algoKey).stepNumber }}/{{ getAlgoLiveSummary(algoKey).totalSteps }}
              </span>
              <span v-else class="badge badge-idle font-mono">
                Pronto
              </span>
            </div>
          </div>

          <!-- Viewport 3D deste Algoritmo -->
          <div class="multi-canvas-box">
            <GraphCanvas3D
              :ref="el => setCanvasRef(algoKey, el)"
              :highlights="algoHighlightsMap[algoKey]"
              :compact="true"
              :externalCameraState="syncCameras && cameraSourceKey !== algoKey ? sharedCameraState : null"
              @camera-change="onViewportCameraChange(algoKey, $event)"
            />

            <!-- Overlay Didático se este algoritmo específico estiver bloqueado (ex: Kruskal em grafo direcionado) -->
            <div v-if="getAlgoRun(algoKey)?.error" class="algo-error-overlay">
              <AlertTriangle class="icon-md text-amber" />
              <p class="overlay-error-msg">{{ getAlgoRun(algoKey).error }}</p>
              <button
                v-if="algoKey === 'KRUSKAL' && graph.directed"
                type="button"
                class="btn btn-primary btn-xs"
                @click="convertGraphAndRerun"
              >
                Converter para Não-Direcionado e Executar Todos
              </button>
            </div>
          </div>

          <!-- Rodapé Vivo: O QUE ESTE ALGORITMO ESTÁ FAZENDO AGORA + ESTRUTURA INTERNA -->
          <div class="algo-doing-footer">
            <template v-if="getAlgoLiveSummary(algoKey)">
              <!-- Linha 1: Ação do Passo Atual -->
              <div class="doing-action-row">
                <span
                  class="doing-event-badge font-mono"
                  :class="getStepBadgeClass(getAlgoLiveSummary(algoKey).eventType)"
                >
                  {{ getAlgoLiveSummary(algoKey).eventType }}
                </span>
                <p class="doing-description" :title="getAlgoLiveSummary(algoKey).description">
                  {{ getAlgoLiveSummary(algoKey).description }}
                </p>
              </div>

              <!-- Linha 2: Estado Interno da Estrutura de Dados e Contadores -->
              <div class="doing-structure-row font-mono">
                <div class="doing-struct-left">
                  <span class="doing-struct-label">{{ getAlgoLiveSummary(algoKey).structureLabel }}:</span>
                  <div class="doing-struct-items">
                    <template v-if="getAlgoLiveSummary(algoKey).structureItems.length > 0">
                      <span
                        v-for="(item, idx) in getAlgoLiveSummary(algoKey).structureItems.slice(0, 5)"
                        :key="idx"
                        class="mini-struct-pill"
                      >
                        {{ item }}
                      </span>
                      <span
                        v-if="getAlgoLiveSummary(algoKey).structureItems.length > 5"
                        class="mini-struct-more"
                      >
                        +{{ getAlgoLiveSummary(algoKey).structureItems.length - 5 }}
                      </span>
                    </template>
                    <span v-else class="mini-struct-empty">
                      {{ getAlgoLiveSummary(algoKey).emptyStructureText }}
                    </span>
                  </div>
                </div>

                <div class="doing-metrics-right">
                  <span
                    v-for="(m, idx) in getAlgoLiveSummary(algoKey).metrics"
                    :key="idx"
                    class="mini-metric-chip"
                  >
                    {{ m.label }}: <strong>{{ m.value }}</strong>
                  </span>
                </div>
              </div>
            </template>

            <!-- Estado Pré-Execução -->
            <template v-else>
              <div class="doing-idle-row">
                <span class="idle-struct-badge font-mono">{{ getAlgoMeta(algoKey).structure }}</span>
                <span class="idle-desc-text">{{ getAlgoMeta(algoKey).objective }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Painel Comparativo Completo: Diferenças, Matriz de Arestas e Relatórios Individuais -->
      <AlgorithmComparisonPanel />
    </div>

    <!-- Espaçador garantido de respiro inferior no final da rolagem -->
    <div class="scroll-bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import {
  Box,
  Link2,
  Unlink2,
  Maximize2,
  AlertTriangle
} from 'lucide-vue-next'
import { useGraph } from '../composables/useGraph.js'
import { useAlgorithmRunner } from '../composables/useAlgorithmRunner.js'
import AlgorithmControls from '../components/algorithms/AlgorithmControls.vue'
import AlgorithmResultTable from '../components/algorithms/AlgorithmResultTable.vue'
import AlgorithmComparisonPanel from '../components/algorithms/AlgorithmComparisonPanel.vue'
import GraphCanvas3D from '../components/graph/GraphCanvas3D.vue'

const { graph, setDirected } = useGraph()
const {
  algorithmsCatalog,
  selectedAlgorithms,
  selectedAlgorithm,
  isMultiMode,
  totalSteps,
  currentStepIndex,
  isPlaying,
  algoHighlightsMap,
  getAlgoRun,
  getAlgoExecutionStatus,
  getAlgoLiveSummary,
  runInstant,
  runStepByStep
} = useAlgorithmRunner()

// Sincronização Multi-Câmera 3D
const syncCameras = ref(true)
const sharedCameraState = ref(null)
const cameraSourceKey = ref(null)
const fourGridLayout = ref('2x2')
const canvasRefs = new Map()

function setCanvasRef(key, el) {
  if (el) {
    canvasRefs.set(key, el)
  } else {
    canvasRefs.delete(key)
  }
}

function onViewportCameraChange(sourceKey, camState) {
  if (!syncCameras.value) return
  cameraSourceKey.value = sourceKey
  sharedCameraState.value = { ...camState }
}

function fitAllCameras() {
  for (const key of selectedAlgorithms.value) {
    const inst = canvasRefs.get(key)
    if (inst && typeof inst.fitCamera === 'function') {
      inst.fitCamera()
    }
  }
}

async function convertGraphAndRerun() {
  const wasInstant = !isPlaying.value && currentStepIndex.value >= totalSteps.value - 1
  setDirected(false)
  await nextTick()
  if (wasInstant) {
    runInstant()
  } else {
    runStepByStep(true)
  }
}

function getAlgoMeta(key) {
  return algorithmsCatalog.find(a => a.key === key) || algorithmsCatalog[0]
}

const multiGridClass = computed(() => {
  const count = selectedAlgorithms.value.length
  if (count === 2) return 'grid-count-2'
  if (count === 3) return 'grid-count-3'
  if (count >= 4) {
    return fourGridLayout.value === '1x4' ? 'grid-count-4-row' : 'grid-count-4-matrix'
  }
  return 'grid-count-2'
})

function getStepBadgeClass(type) {
  if (
    type === 'TREE_EDGE' ||
    type === 'ACCEPT_EDGE' ||
    type === 'TARGET_REACHED' ||
    type === 'DESTINATION_REACHED' ||
    type === 'COMPLETE'
  ) {
    return 'badge-green'
  }
  if (type === 'REJECT_CYCLE' || type === 'BACK_EDGE') {
    return 'badge-red'
  }
  if (type === 'EXAMINE_EDGE' || type === 'RELAX_EDGE') {
    return 'badge-amber'
  }
  if (type === 'ENQUEUE' || type === 'EXTRACT_MIN') {
    return 'badge-purple'
  }
  return 'badge-blue'
}
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

/* =========================================================================
   MODO INDIVIDUAL (1 ALGORITMO)
   ========================================================================= */
.lab-workspace-single {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
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
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.card-header-bar {
  padding: 0.65rem var(--spacing-4);
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
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.canvas-box {
  flex: 1;
  position: relative;
  min-height: 400px;
}

.live-structure-footer {
  padding: 0.55rem var(--spacing-4);
  background: var(--bg-card);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.structure-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.structure-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.structure-chips {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.struct-chip {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.42rem;
  border-radius: 4px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border: 1px solid rgba(79, 99, 246, 0.25);
}

.struct-empty,
.struct-more {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.live-metrics-pills {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.live-metric-tag {
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-subtle);
  padding: 0.14rem 0.5rem;
  border-radius: var(--radius-sm);
}

.results-card {
  display: flex;
  flex-direction: column;
  min-height: 480px;
}

/* =========================================================================
   MODO SIMULTÂNEO (2, 3 OU 4 MODELOS 3D EM PARALELO)
   ========================================================================= */
.lab-workspace-multi {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.multi-3d-toolbar {
  padding: 0.6rem var(--spacing-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.toolbar-left-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.multi-toolbar-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-primary);
}

.multi-toolbar-hint {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.toolbar-right-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.grid-layout-toggle {
  display: inline-flex;
  background: var(--bg-subtle);
  padding: 2px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.layout-opt-btn {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  color: var(--text-secondary);
}

.layout-opt-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-xs);
}

.sync-cam-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.71rem;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.sync-cam-btn.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-color: rgba(79, 99, 246, 0.35);
}

/* Grades Dinâmicas de 2, 3 e 4 Modelos 3D */
.multi-3d-grid {
  display: grid;
  gap: var(--spacing-3);
}

.multi-3d-grid.grid-count-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.multi-3d-grid.grid-count-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.multi-3d-grid.grid-count-4-matrix {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.multi-3d-grid.grid-count-4-row {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.multi-algo-3d-card {
  --card-accent: var(--color-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-top: 3px solid var(--card-accent);
  border-radius: var(--radius-lg);
}

.algo-3d-header {
  padding: 0.5rem 0.85rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.algo-header-id {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.algo-accent-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.algo-3d-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
}

.algo-3d-cat {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-subtle);
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-sm);
}

.algo-3d-comp {
  font-size: 0.66rem;
  color: var(--text-muted);
}

.badge-idle {
  background: var(--bg-subtle);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.multi-canvas-box {
  position: relative;
  height: 330px;
  min-height: 290px;
}

.grid-count-2 .multi-canvas-box {
  height: 390px;
}

.grid-count-4-row .multi-canvas-box {
  height: 300px;
}

.algo-error-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: var(--bg-glass);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-4);
  gap: var(--spacing-2);
}

.overlay-error-msg {
  font-size: var(--text-xs);
  color: var(--text-primary);
  font-weight: 600;
  max-width: 300px;
  line-height: 1.45;
}

/* Rodapé de Atividade ao Vivo ("O que cada um está fazendo") */
.algo-doing-footer {
  padding: 0.55rem 0.85rem;
  background: var(--bg-card);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-height: 76px;
  justify-content: center;
}

.doing-action-row {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}

.doing-event-badge {
  font-size: 0.63rem;
  font-weight: 700;
  padding: 0.12rem 0.42rem;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 1px;
}

.doing-description {
  font-size: 0.73rem;
  color: var(--text-primary);
  line-height: 1.38;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doing-structure-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.3rem;
  border-top: 1px dashed var(--border-subtle);
}

.doing-struct-left {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.doing-struct-label {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.doing-struct-items {
  display: flex;
  align-items: center;
  gap: 0.22rem;
  flex-wrap: wrap;
}

.mini-struct-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.06rem 0.35rem;
  border-radius: 4px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.mini-struct-empty,
.mini-struct-more {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.doing-metrics-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.mini-metric-chip {
  font-size: 0.66rem;
  color: var(--text-secondary);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 0.06rem 0.38rem;
  border-radius: 4px;
}

.doing-idle-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.idle-struct-badge {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 4px;
  background: var(--bg-subtle);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.idle-desc-text {
  font-size: 0.73rem;
  color: var(--text-muted);
}

.icon-xs { width: 13px; height: 13px; }
.icon-sm { width: 15px; height: 15px; }
.icon-md { width: 20px; height: 20px; }

@media (max-width: 1280px) {
  .multi-3d-grid.grid-count-3,
  .multi-3d-grid.grid-count-4-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .lab-workspace-single {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .multi-3d-grid.grid-count-2,
  .multi-3d-grid.grid-count-3,
  .multi-3d-grid.grid-count-4-matrix,
  .multi-3d-grid.grid-count-4-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .algorithm-lab-view {
    padding: var(--spacing-3);
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .visualizer-card {
    min-height: 320px;
  }

  .canvas-box,
  .multi-canvas-box {
    min-height: 260px;
    height: 280px;
  }
}
</style>
