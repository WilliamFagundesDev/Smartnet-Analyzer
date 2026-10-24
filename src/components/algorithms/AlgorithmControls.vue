<template>
  <div class="algorithm-controls card-elevated">
    <!-- Etapa 1: Seleção do Algoritmo em Segmented Control Limpo -->
    <div class="control-section">
      <div class="section-label">1. ESCOLHA O ALGORITMO:</div>
      <div class="algo-segmented-bar">
        <button
          v-for="algo in algorithms"
          :key="algo.key"
          class="algo-pill-btn"
          :class="{ active: selectedAlgorithm === algo.key }"
          @click="selectAlgo(algo.key)"
        >
          <span class="pill-title">{{ algo.label }}</span>
          <span class="pill-sub">{{ algo.sub }}</span>
        </button>
      </div>
    </div>

    <!-- Etapa 2: Parâmetros (Apenas o estritamente necessário) -->
    <div class="control-section params-section">
      <div class="section-label">2. PARÂMETROS DA EXECUÇÃO:</div>

      <div class="params-row">
        <!-- Origem (DFS, BFS, Dijkstra) -->
        <div v-if="selectedAlgorithm !== 'KRUSKAL'" class="param-item">
          <label class="param-label">Vértice de Origem:</label>
          <select v-model="startVertexId" class="select-control font-mono">
            <option v-for="v in graph.vertices" :key="v.id" :value="v.id">
              {{ v.id }} &mdash; {{ v.label }}
            </option>
          </select>
        </div>

        <!-- Destino Opcional (BFS, Dijkstra) -->
        <div v-if="selectedAlgorithm === 'BFS' || selectedAlgorithm === 'DIJKSTRA'" class="param-item">
          <label class="param-label">Destino (Opcional):</label>
          <select v-model="targetVertexId" class="select-control font-mono">
            <option value="">Nenhum (Calcular para todos os nós)</option>
            <option v-for="v in graph.vertices" :key="v.id" :value="v.id">
              {{ v.id }} &mdash; {{ v.label }}
            </option>
          </select>
        </div>

        <!-- DFS Checkbox -->
        <div v-if="selectedAlgorithm === 'DFS'" class="param-item-check">
          <label class="checkbox-label">
            <input type="checkbox" v-model="exploreAllComponents" />
            <span>Explorar todos os componentes (Floresta DFS)</span>
          </label>
        </div>

        <!-- Kruskal Explicação Limpa -->
        <div v-if="selectedAlgorithm === 'KRUSKAL'" class="param-item-kruskal">
          <div class="kruskal-note">
            Kruskal processa globalmente todas as conexões da rede, sem necessidade de definir nó inicial.
          </div>
          <div v-if="graph.directed" class="kruskal-convert-alert">
            <AlertTriangle class="icon-xs text-amber" />
            <span>Kruskal exige grafo não-direcionado.</span>
            <button class="btn btn-secondary btn-xs" @click="setDirected(false)">
              Converter Grafo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Etapa 3: Execução Clara e Direta -->
    <div class="control-section actions-section">
      <div class="action-buttons-group">
        <button
          class="btn btn-primary"
          @click="runInstant"
          :disabled="isBlocked"
        >
          <Zap class="icon-sm" />
          <span>Executar e Ver Resultado</span>
        </button>

        <button
          class="btn btn-secondary"
          @click="runStepByStep"
          :disabled="isBlocked"
        >
          <PlayCircle class="icon-sm" />
          <span>Ver Passo a Passo</span>
        </button>

        <button
          v-if="result || events.length > 0"
          class="btn btn-ghost"
          @click="clearResult"
        >
          <RotateCcw class="icon-xs" />
          <span>Limpar</span>
        </button>
      </div>

      <!-- Barra de Reprodução (Aparece apenas quando o modo passo a passo é ativado) -->
      <div v-if="events.length > 0" class="step-player-bar">
        <div class="player-controls">
          <button class="player-btn" @click="reset" title="Primeiro passo">
            <SkipBack class="icon-xs" />
          </button>
          <button class="player-btn" @click="stepPrev" :disabled="currentStepIndex <= 0" title="Passo anterior">
            <ChevronLeft class="icon-xs" />
          </button>
          <button
            class="player-btn btn-play"
            @click="isPlaying ? pause() : play()"
            :title="isPlaying ? 'Pausar' : 'Reproduzir'"
          >
            <Pause v-if="isPlaying" class="icon-sm" />
            <Play v-else class="icon-sm" />
          </button>
          <button
            class="player-btn"
            @click="stepNext"
            :disabled="currentStepIndex >= events.length - 1"
            title="Próximo passo"
          >
            <ChevronRight class="icon-xs" />
          </button>
        </div>

        <div class="player-progress">
          <div class="progress-info">
            <span class="step-badge font-mono">Passo {{ currentStepIndex + 1 }} de {{ events.length }}</span>
            <span class="speed-control">
              <label>Velocidade:</label>
              <select v-model.number="playbackSpeed" class="speed-select">
                <option :value="1000">0.5x</option>
                <option :value="600">1.0x</option>
                <option :value="300">2.0x</option>
              </select>
            </span>
          </div>
          <div class="progress-track" @click="handleProgressClick">
            <div
              class="progress-fill"
              :style="{ width: `${((currentStepIndex + 1) / events.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Explicação Textual do Passo Atual -->
    <div v-if="currentStepEvent" class="step-explanation-strip">
      <span class="step-badge-tag" :class="getStepBadgeClass(currentStepEvent.type)">
        {{ currentStepEvent.type }}
      </span>
      <span class="step-msg">{{ currentStepEvent.description }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Zap,
  PlayCircle,
  RotateCcw,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'

const { graph, setDirected } = useGraph()
const {
  selectedAlgorithm,
  startVertexId,
  targetVertexId,
  exploreAllComponents,
  result,
  events,
  currentStepIndex,
  currentStepEvent,
  isPlaying,
  playbackSpeed,
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

const algorithms = [
  { key: 'DFS', label: 'DFS', sub: 'Profundidade' },
  { key: 'BFS', label: 'BFS', sub: 'Largura (Hops)' },
  { key: 'DIJKSTRA', label: 'Dijkstra', sub: 'Menor Custo' },
  { key: 'KRUSKAL', label: 'Kruskal', sub: 'Árvore Mínima' }
]

function selectAlgo(key) {
  selectedAlgorithm.value = key
  clearResult()
}

const isBlocked = computed(() => {
  if (graph.value.vertices.length === 0) return true
  if (selectedAlgorithm.value === 'KRUSKAL' && graph.value.directed) return true
  if (selectedAlgorithm.value === 'DIJKSTRA' && graph.value.edges.some(e => Number(e.weight) < 0)) return true
  return false
})

function handleProgressClick(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const ratio = Math.max(0, Math.min(1, clickX / rect.width))
  const targetIndex = Math.floor(ratio * events.value.length)
  jumpToStep(targetIndex)
}

function getStepBadgeClass(type) {
  if (type === 'TREE_EDGE' || type === 'ACCEPT_EDGE' || type === 'TARGET_REACHED' || type === 'COMPLETE') {
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
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

/* 1. Segmented Control Limpo e Simples */
.algo-segmented-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2);
  background: var(--bg-card);
  padding: 0.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.algo-pill-btn {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.algo-pill-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.algo-pill-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.pill-title {
  font-size: var(--text-sm);
  font-weight: 700;
}

.pill-sub {
  font-size: 0.68rem;
  opacity: 0.8;
}

/* 2. Parâmetros Essenciais */
.params-section {
  background: var(--bg-card);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.params-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;
  flex: 1;
}

.param-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.param-item-check {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-xs);
  color: var(--text-primary);
  cursor: pointer;
}

.kruskal-note {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.kruskal-convert-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: 0.35rem;
  font-size: var(--text-xs);
  color: var(--color-warning);
}

.btn-xs {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
}

/* 3. Ações e Player */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

/* Barra do Player Passo a Passo */
.step-player-bar {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.player-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.player-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-play {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.btn-play:hover {
  background: var(--color-primary-hover);
  color: #ffffff;
}

.player-progress {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-primary);
}

.speed-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.speed-select {
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  padding: 0.1rem 0.3rem;
  font-size: 0.7rem;
}

.progress-track {
  height: 6px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 150ms ease;
}

/* Faixa de Explicação do Passo */
.step-explanation-strip {
  background: var(--bg-card);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.step-badge-tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.step-msg {
  font-size: var(--text-xs);
  color: var(--text-primary);
}

.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }

@media (max-width: 768px) {
  .algo-segmented-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
