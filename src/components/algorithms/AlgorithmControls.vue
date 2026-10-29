<template>
  <div class="algorithm-controls card-elevated">
    <!-- Cabeçalho de Multi-Seleção Simultânea -->
    <div class="selection-top-bar">
      <div class="selection-info">
        <span class="selection-title">Algoritmos Ativos</span>
        <span class="selection-hint">
          Clique nos cards para combinar <strong>2, 3 ou os 4 algoritmos</strong> em modelos 3D simultâneos
        </span>
      </div>

      <div class="selection-quick-actions">
        <span class="badge font-mono" :class="isMultiMode ? 'badge-blue' : 'badge-neutral'">
          {{ selectedAlgorithms.length }} {{ selectedAlgorithms.length === 1 ? 'selecionado' : 'selecionados' }}
        </span>

        <button
          type="button"
          class="quick-select-btn"
          :class="{ active: selectedAlgorithms.length === 4 }"
          @click="selectAllAlgorithms"
          :disabled="selectedAlgorithms.length === 4"
          title="Selecionar os 4 algoritmos para comparação 3D simultânea"
        >
          <Layers class="icon-xs" />
          <span>Todos os 4</span>
        </button>

        <button
          v-if="isMultiMode"
          type="button"
          class="quick-select-btn"
          @click="selectOnlyAlgorithm(selectedAlgorithms[0])"
          title="Voltar para execução individual de 1 algoritmo"
        >
          <span>Individual (1)</span>
        </button>
      </div>
    </div>

    <!-- Etapa A: Grade Multi-Seletora dos 4 Algoritmos -->
    <div class="algo-selection-bar">
      <div class="algo-segmented-grid">
        <button
          v-for="algo in algorithmsCatalog"
          :key="algo.key"
          class="algo-card-btn"
          :class="{ active: isSelected(algo.key) }"
          :style="isSelected(algo.key) ? { '--algo-accent': algo.accent } : {}"
          @click="toggleAlgorithm(algo.key)"
          type="button"
          :aria-pressed="isSelected(algo.key)"
        >
          <div class="algo-btn-top">
            <div class="algo-title-cluster">
              <span class="algo-check-box" :class="{ checked: isSelected(algo.key) }">
                <Check v-if="isSelected(algo.key)" class="check-icon" />
              </span>
              <span class="algo-name">{{ algo.name }}</span>
            </div>
            <span class="algo-type-tag">{{ algo.category }}</span>
          </div>
          <span class="algo-objective">{{ algo.objective }}</span>
        </button>
      </div>
    </div>

    <!-- Etapa B & C: Parâmetros Contextuais e Ação de Execução -->
    <div class="controls-action-row">
      <!-- Parâmetros Contextuais -->
      <div class="params-container">
        <!-- Vértice de Origem (DFS, BFS, Dijkstra) -->
        <div v-if="needsStartVertex" class="param-group">
          <label class="param-label" for="algo-start-vertex">
            Vértice Inicial (Origem):
          </label>
          <div class="param-input-wrap">
            <select
              id="algo-start-vertex"
              v-model="startVertexId"
              class="select-control font-mono"
            >
              <option v-for="v in graph.vertices" :key="v.id" :value="v.id">
                {{ v.id }} &mdash; {{ v.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Destino Opcional (BFS, Dijkstra ou comparação multi-algoritmo com origem) -->
        <div v-if="needsTargetVertex" class="param-group">
          <label class="param-label" for="algo-target-vertex">
            Vértice Destino (Opcional):
          </label>
          <div class="param-input-wrap">
            <select
              id="algo-target-vertex"
              v-model="targetVertexId"
              class="select-control font-mono"
            >
              <option value="">Todos os vértices (Árvore completa)</option>
              <option v-for="v in graph.vertices" :key="v.id" :value="v.id">
                {{ v.id }} &mdash; {{ v.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- DFS: Opções Avançadas Expansíveis -->
        <div v-if="isSelected('DFS')" class="param-group advanced-toggle-group">
          <button
            type="button"
            class="advanced-toggle-btn"
            @click="showAdvanced = !showAdvanced"
          >
            <span>Opções DFS</span>
            <ChevronDown class="icon-xs" :class="{ 'rotate-180': showAdvanced }" />
          </button>

          <div v-if="showAdvanced" class="advanced-panel">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exploreAllComponents" />
              <span>Explorar componentes desconexos (Floresta DFS)</span>
            </label>
          </div>
        </div>

        <!-- Kruskal: Mensagem Contextual e Conversão Rápida -->
        <div v-if="isSelected('KRUSKAL')" class="kruskal-info-group">
          <div v-if="!isMultiMode" class="kruskal-info-text">
            Kruskal processa globalmente todas as arestas da rede em ordem crescente de peso via Union-Find.
          </div>
          <div v-if="graph.directed" class="kruskal-alert-pill">
            <AlertTriangle class="icon-xs text-amber" />
            <span>Kruskal requer grafo não-direcionado.</span>
            <button type="button" class="btn btn-secondary btn-xs" @click="handleConvertUndirected">
              Converter para Não-Direcionado
            </button>
          </div>
        </div>

        <!-- Dijkstra: Alerta de Pesos Negativos -->
        <div v-if="isSelected('DIJKSTRA') && hasNegativeWeights" class="dijkstra-alert-pill">
          <AlertTriangle class="icon-xs text-red" />
          <span>Dijkstra rejeita pesos negativos. Remova valores negativos no Editor.</span>
        </div>
      </div>

      <!-- Ações de Execução -->
      <div class="actions-container">
        <!-- Ação Principal -->
        <button
          type="button"
          class="btn btn-primary btn-execute"
          @click="runStepByStep(true)"
          :disabled="isAllBlocked"
          :title="isMultiMode ? `Executar ${selectedAlgorithms.length} algoritmos simultaneamente em 3D` : 'Executar algoritmo com visualização animada'"
        >
          <Play class="icon-sm" />
          <span>{{ isMultiMode ? `Executar ${selectedAlgorithms.length} Simultâneos` : 'Executar Simulação' }}</span>
        </button>

        <!-- Ação Direta Instantânea -->
        <button
          type="button"
          class="btn btn-secondary btn-instant"
          @click="runInstant"
          :disabled="isAllBlocked"
          title="Calcular resultados instantaneamente"
        >
          <Zap class="icon-xs" />
          <span>Resultado Imediato</span>
        </button>

        <!-- Limpar -->
        <button
          v-if="hasAnyRun || totalSteps > 0"
          type="button"
          class="btn btn-ghost btn-clear"
          @click="clearResult"
          title="Limpar simulação e destaques"
        >
          <RotateCcw class="icon-xs" />
          <span>Limpar</span>
        </button>
      </div>
    </div>

    <!-- Etapa D: Barra do Player Passo a Passo Sincronizado -->
    <div v-if="totalSteps > 0" class="player-timeline-wrapper">
      <div class="player-controls-strip">
        <!-- Botões de Transporte -->
        <div class="transport-group">
          <button
            type="button"
            class="player-btn"
            @click="reset"
            title="Ir para o primeiro passo"
            aria-label="Primeiro passo"
          >
            <SkipBack class="icon-xs" />
          </button>

          <button
            type="button"
            class="player-btn"
            @click="stepPrev"
            :disabled="currentStepIndex <= 0"
            title="Passo anterior"
            aria-label="Passo anterior"
          >
            <ChevronLeft class="icon-xs" />
          </button>

          <button
            type="button"
            class="player-btn btn-play-pause"
            :class="{ 'is-playing': isPlaying }"
            @click="isPlaying ? pause() : play()"
            :title="isPlaying ? 'Pausar animação simultânea' : 'Reproduzir animação simultânea'"
            aria-label="Reproduzir ou pausar"
          >
            <Pause v-if="isPlaying" class="icon-sm" />
            <Play v-else class="icon-sm" />
          </button>

          <button
            type="button"
            class="player-btn"
            @click="stepNext"
            :disabled="currentStepIndex >= totalSteps - 1"
            title="Próximo passo"
            aria-label="Próximo passo"
          >
            <ChevronRight class="icon-xs" />
          </button>
        </div>

        <!-- Timeline e Indicador de Progresso Sincronizado -->
        <div class="timeline-center">
          <div class="timeline-meta">
            <span class="status-indicator">
              <span class="status-dot" :class="statusDotClass"></span>
              <span class="status-text">
                {{ executionStateText }}
                <template v-if="isMultiMode">&middot; {{ selectedAlgorithms.length }} Modelos Sincronizados</template>
              </span>
            </span>

            <span class="step-counter font-mono">
              Passo <strong>{{ currentStepIndex + 1 }}</strong> de <strong>{{ totalSteps }}</strong>
              ({{ progressPercent }}%)
            </span>
          </div>

          <div
            class="timeline-track"
            @click="handleProgressClick"
            role="progressbar"
            :aria-valuenow="currentStepIndex + 1"
            aria-valuemin="1"
            :aria-valuemax="totalSteps"
            title="Clique na barra para navegar diretamente para qualquer passo em todos os modelos 3D"
          >
            <div
              class="timeline-fill"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>

        <!-- Seletor de Velocidade -->
        <div class="speed-selector-group">
          <span class="speed-label">Velocidade:</span>
          <select
            v-model.number="playbackSpeed"
            class="speed-select-native font-mono"
            title="Velocidade da simulação automática"
          >
            <option :value="1000">0.5x</option>
            <option :value="600">1.0x</option>
            <option :value="300">2.0x</option>
            <option :value="160">3.5x</option>
          </select>
        </div>
      </div>

      <!-- Modo Individual: Faixa de Explicação Direta -->
      <div v-if="!isMultiMode && currentStepEvent" class="step-explanation-banner">
        <span class="step-type-pill font-mono" :class="getStepBadgeClass(currentStepEvent.type)">
          {{ currentStepEvent.type }}
        </span>
        <span class="step-description-text">{{ currentStepEvent.description }}</span>
      </div>

      <!-- Modo Simultâneo (2, 3 ou 4): Resumo Rápido de Progresso de Cada Algoritmo -->
      <div v-else-if="isMultiMode" class="multi-progress-pills">
        <div
          v-for="algoKey in selectedAlgorithms"
          :key="algoKey"
          class="mini-algo-progress font-mono"
          :class="getAlgoExecutionStatus(algoKey)"
        >
          <span class="mini-algo-dot" :style="{ background: getAlgoAccent(algoKey) }"></span>
          <span class="mini-algo-name">{{ getAlgoName(algoKey) }}:</span>
          <span v-if="getAlgoRun(algoKey)?.error" class="text-amber">Incompatível</span>
          <span v-else-if="getAlgoExecutionStatus(algoKey) === 'completed'" class="text-green">
            Concluído ({{ getAlgoRun(algoKey)?.events?.length || 0 }}/{{ getAlgoRun(algoKey)?.events?.length || 0 }})
          </span>
          <span v-else>
            {{ getAlgoStepIndex(algoKey) + 1 }}/{{ getAlgoRun(algoKey)?.events?.length || 0 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Play,
  Pause,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  RotateCcw,
  AlertTriangle,
  Check,
  Layers
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'

const { graph, setDirected } = useGraph()
const {
  algorithmsCatalog,
  selectedAlgorithms,
  isMultiMode,
  startVertexId,
  targetVertexId,
  exploreAllComponents,
  hasAnyRun,
  totalSteps,
  currentStepIndex,
  currentStepEvent,
  isPlaying,
  playbackSpeed,
  toggleAlgorithm,
  selectOnlyAlgorithm,
  selectAllAlgorithms,
  getAlgoRun,
  getAlgoStepIndex,
  getAlgoExecutionStatus,
  runInstant,
  runStepByStep,
  play,
  pause,
  stepNext,
  stepPrev,
  reset,
  jumpToStep,
  clearResult
} = useAlgorithmRunner()

const showAdvanced = ref(false)

function isSelected(key) {
  return selectedAlgorithms.value.includes(key)
}

function getAlgoMeta(key) {
  return algorithmsCatalog.find(a => a.key === key) || algorithmsCatalog[0]
}

function getAlgoName(key) {
  return getAlgoMeta(key).name
}

function getAlgoAccent(key) {
  return getAlgoMeta(key).accent
}

function handleConvertUndirected() {
  setDirected(false)
}

const needsStartVertex = computed(() => {
  return selectedAlgorithms.value.some(k => k !== 'KRUSKAL')
})

const needsTargetVertex = computed(() => {
  return (
    selectedAlgorithms.value.includes('BFS') ||
    selectedAlgorithms.value.includes('DIJKSTRA') ||
    (isMultiMode.value && needsStartVertex.value)
  )
})

const hasNegativeWeights = computed(() => {
  return graph.value.edges.some(e => Number(e.weight) < 0)
})

function isSingleAlgoBlocked(key) {
  if (graph.value.vertices.length === 0) return true
  if (key === 'KRUSKAL' && graph.value.directed) return true
  if (key === 'DIJKSTRA' && hasNegativeWeights.value) return true
  return false
}

// Bloqueia apenas se NENHUM algoritmo selecionado puder executar
const isAllBlocked = computed(() => {
  if (graph.value.vertices.length === 0 || selectedAlgorithms.value.length === 0) return true
  return selectedAlgorithms.value.every(k => isSingleAlgoBlocked(k))
})

const progressPercent = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round(((currentStepIndex.value + 1) / totalSteps.value) * 100)
})

const executionStateText = computed(() => {
  if (isPlaying.value) return 'Executando'
  if (currentStepIndex.value >= totalSteps.value - 1 && totalSteps.value > 0) return 'Concluído'
  if (currentStepIndex.value >= 0) return 'Pausado'
  return 'Pronto'
})

const statusDotClass = computed(() => {
  if (isPlaying.value) return 'dot-running'
  if (currentStepIndex.value >= totalSteps.value - 1 && totalSteps.value > 0) return 'dot-completed'
  return 'dot-paused'
})

function handleProgressClick(event) {
  if (totalSteps.value === 0) return
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const ratio = Math.max(0, Math.min(1, clickX / rect.width))
  const targetIndex = Math.min(totalSteps.value - 1, Math.floor(ratio * totalSteps.value))
  jumpToStep(targetIndex)
}

function getStepBadgeClass(type) {
  if (type === 'TREE_EDGE' || type === 'ACCEPT_EDGE' || type === 'TARGET_REACHED' || type === 'DESTINATION_REACHED' || type === 'COMPLETE') {
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
.algorithm-controls {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

/* Barra Superior de Multi-Seleção */
.selection-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.selection-title {
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-primary);
}

.selection-hint {
  font-size: 0.73rem;
  color: var(--text-secondary);
}

.selection-quick-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.badge-neutral {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.quick-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.quick-select-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.quick-select-btn.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-color: rgba(79, 99, 246, 0.35);
}

/* 1. Grade Multi-Selecionável dos 4 Algoritmos */
.algo-segmented-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2);
}

.algo-card-btn {
  --algo-accent: var(--color-primary);
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 0.25rem;
  transition: all var(--transition-fast);
}

.algo-card-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-light);
  transform: translateY(-1px);
}

.algo-card-btn.active {
  background: color-mix(in srgb, var(--algo-accent) 8%, var(--bg-card));
  border-color: var(--algo-accent);
  box-shadow: 0 0 0 1px var(--algo-accent);
}

.algo-btn-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.4rem;
}

.algo-title-cluster {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.algo-check-box {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1.5px solid var(--border-light);
  background: var(--bg-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.algo-check-box.checked {
  background: var(--algo-accent);
  border-color: var(--algo-accent);
  color: #ffffff;
}

.check-icon {
  width: 11px;
  height: 11px;
  stroke-width: 3;
}

.algo-name {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.algo-card-btn.active .algo-name {
  color: var(--algo-accent);
}

.algo-type-tag {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
}

.algo-card-btn.active .algo-type-tag {
  color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 14%, transparent);
}

.algo-objective {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

/* 2. Parâmetros Contextuais e Ações */
.controls-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}

.params-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  flex: 1;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 180px;
}

.param-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.param-input-wrap {
  width: 100%;
}

.advanced-toggle-group {
  min-width: unset;
  align-self: flex-end;
}

.advanced-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
}

.advanced-toggle-btn:hover {
  color: var(--color-primary);
  border-color: var(--border-light);
}

.advanced-panel {
  margin-top: 0.35rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-primary);
  cursor: pointer;
}

.kruskal-info-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.kruskal-info-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.kruskal-alert-pill,
.dijkstra-alert-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--color-warning);
  background: var(--color-warning-bg);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.dijkstra-alert-pill {
  color: var(--color-danger);
  background: var(--color-danger-bg);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Grupo de Ações */
.actions-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.btn-execute {
  padding: 0.55rem 1.1rem;
  font-weight: 700;
}

/* 3. Barra do Player Passo a Passo */
.player-timeline-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  animation: fadeIn var(--transition-fast) ease-out;
}

.player-controls-strip {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  justify-content: space-between;
}

.transport-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.player-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.player-btn:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.btn-play-pause {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.btn-play-pause:hover:not(:disabled) {
  background: var(--color-primary-hover);
  color: #ffffff;
}

.btn-play-pause.is-playing {
  background: var(--color-warning);
  border-color: var(--color-warning);
}

.timeline-center {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.timeline-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
}

.dot-running {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning);
  animation: pulseSoft 1.5s infinite;
}

.dot-completed {
  background: var(--color-success);
}

.dot-paused {
  background: var(--text-muted);
}

.step-counter {
  color: var(--text-secondary);
}

.timeline-track {
  height: 7px;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.timeline-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-fast);
}

.speed-selector-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.speed-select-native {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
}

/* Faixa de Explicação (Modo Individual) */
.step-explanation-banner {
  background: var(--bg-surface);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: 0.4rem 0.75rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.step-type-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.step-description-text {
  font-size: 0.76rem;
  color: var(--text-primary);
  line-height: 1.4;
}

/* Resumo Compacto dos Algoritmos Simultâneos */
.multi-progress-pills {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  padding-top: 0.15rem;
}

.mini-algo-progress {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.mini-algo-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.mini-algo-name {
  font-weight: 700;
  color: var(--text-primary);
}

.rotate-180 {
  transform: rotate(180deg);
}

.icon-xs { width: 13px; height: 13px; }
.icon-sm { width: 15px; height: 15px; }

@media (max-width: 900px) {
  .algo-segmented-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .controls-action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .actions-container {
    width: 100%;
    justify-content: stretch;
  }

  .actions-container .btn {
    flex: 1;
    justify-content: center;
  }

  .player-controls-strip {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }

  .transport-group {
    justify-content: center;
  }
}
</style>
