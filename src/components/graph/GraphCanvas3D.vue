<template>
  <div class="graph-canvas-container" :class="{ 'is-compact': compact }" ref="containerRef">
    <!-- Toolbar Flutuante em Cápsula Minimalista -->
    <div class="canvas-glass-toolbar">
      <div class="toolbar-mode-switch">
        <button
          class="mode-btn"
          :class="{ active: viewMode === '3D' }"
          @click="setViewMode('3D')"
          title="Modo Espacial 3D (WebGL)"
          aria-label="Ativar visualização 3D"
          type="button"
        >
          <Box class="icon-xs" />
          <span>3D</span>
        </button>
        <button
          class="mode-btn"
          :class="{ active: viewMode === '2D' }"
          @click="setViewMode('2D')"
          title="Modo Plano 2D (Canvas)"
          aria-label="Ativar visualização 2D"
          type="button"
        >
          <Layers class="icon-xs" />
          <span>2D</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-actions">
        <button
          class="action-icon-btn"
          @click="fitCamera"
          title="Enquadrar e centralizar grafo"
          aria-label="Centralizar câmera"
          type="button"
        >
          <Maximize2 class="icon-xs" />
          <span v-if="!compact" class="btn-text">Centralizar</span>
        </button>

        <button
          v-if="!compact"
          class="action-icon-btn"
          @click="reorganizeLayout"
          title="Rearranjar nós via simulação de física 3D"
          aria-label="Rearranjar layout"
          type="button"
        >
          <Sparkles class="icon-xs" />
          <span class="btn-text">Organizar</span>
        </button>

        <button
          v-if="viewMode === '3D'"
          class="action-icon-btn"
          :class="{ active: isAutoRotating }"
          @click="toggleAutoRotate"
          title="Alternar rotação contínua da câmera"
          aria-label="Alternar rotação contínua"
          type="button"
        >
          <RotateCw class="icon-xs" />
        </button>
      </div>
    </div>

    <!-- Viewport Three.js 3D -->
    <div
      v-show="viewMode === '3D' && !webglError"
      class="three-viewport"
      ref="viewportRef"
    ></div>

    <!-- Viewport Fallback 2D Canvas -->
    <div v-show="viewMode === '2D' || webglError" class="fallback-2d-viewport">
      <canvas
        ref="canvas2DRef"
        class="canvas-2d"
        @click="handle2DCanvasClick"
      ></canvas>
    </div>

    <!-- Pílula Neutra de Inspeção da Aresta Selecionada (Sem alterar a cor da aresta) -->
    <div v-if="selectedEdgeInfo" class="selected-edge-floating-pill">
      <span class="edge-bracket-mark font-mono">[&middot;]</span>
      <span class="edge-id-pair font-mono">
        {{ selectedEdgeInfo.source }} {{ graph.directed ? '➔' : '↔' }} {{ selectedEdgeInfo.target }}
      </span>
      <span v-if="graph.weighted" class="edge-weight-meta font-mono">
        p:{{ selectedEdgeInfo.weight }}
      </span>
      <span
        v-if="selectedEdgeStatusMeta"
        class="edge-status-chip"
        :class="selectedEdgeStatusMeta.className"
      >
        {{ selectedEdgeStatusMeta.label }}
      </span>
      <button
        type="button"
        class="edge-deselect-btn"
        @click="selectEdge(null)"
        title="Desmarcar aresta selecionada"
        aria-label="Desmarcar aresta"
      >
        <X class="icon-2xs" />
      </button>
    </div>

    <!-- Legenda Semântica Flutuante Discreta (Expansível) -->
    <div class="floating-legend-capsule" :class="{ 'is-expanded': isLegendExpanded }">
      <button
        class="legend-toggle-pill"
        @click="isLegendExpanded = !isLegendExpanded"
        title="Alternar legenda de cores semânticas"
        type="button"
      >
        <span class="legend-indicator-dot"></span>
        <span class="legend-btn-label">{{ compact ? 'Legenda' : 'Legenda de Cores' }}</span>
        <ChevronUp v-if="!isLegendExpanded" class="icon-xs" />
        <ChevronDown v-else class="icon-xs" />
      </button>

      <div v-if="isLegendExpanded" class="legend-popover-content">
        <div class="legend-item" title="Vértice sendo expandido ou aresta avaliada no passo atual">
          <span class="dot-sample dot-amber"></span>
          <span class="item-name">Atual / Processando</span>
        </div>
        <div class="legend-item" title="Vértice visitado ou aresta aceita na Árvore/AGM">
          <span class="dot-sample dot-green"></span>
          <span class="item-name">Visitado / Árvore</span>
        </div>
        <div class="legend-item" title="Vértice aguardando na fila FIFO ou Min-Heap">
          <span class="dot-sample dot-purple"></span>
          <span class="item-name">Fila / Min-Heap</span>
        </div>
        <div class="legend-item" title="Conexão integrante do caminho ótimo calculado">
          <span class="dot-sample dot-blue"></span>
          <span class="item-name">Menor Caminho</span>
        </div>
        <div class="legend-item" title="Aresta rejeitada por formar ciclo (Kruskal)">
          <span class="dot-sample dot-red"></span>
          <span class="item-name">Ciclo Rejeitado</span>
        </div>
        <div class="legend-item" title="Elemento ainda não explorado">
          <span class="dot-sample dot-slate"></span>
          <span class="item-name">Não Visitado</span>
        </div>
        <div class="legend-item legend-item-divider" title="Anéis/colchetes neutros indicam seleção preservando a cor original">
          <span class="bracket-sample font-mono">[ ]</span>
          <span class="item-name">Aresta Selecionada</span>
        </div>
      </div>
    </div>

    <!-- Aviso WebGL indisponível se houver erro -->
    <div v-if="webglError" class="webgl-error-banner">
      <AlertTriangle class="icon-xs text-amber" />
      <span>Modo 2D ativado (WebGL indisponível neste ambiente).</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Box,
  Layers,
  Maximize2,
  Sparkles,
  RotateCw,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  X
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'
import { useTheme } from '../../composables/useTheme.js'
import { ThreeSceneManager } from '../../visualization/threeScene.js'
import { applyForceLayout3D } from '../../visualization/graphLayout.js'

const props = defineProps({
  highlights: {
    type: Object,
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  },
  externalCameraState: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['camera-change'])

const {
  graph,
  graphVersion,
  selectedVertexId,
  selectedEdgeId,
  selectVertex,
  selectEdge,
  addLog
} = useGraph()
const { visualHighlights } = useAlgorithmRunner()
const { theme } = useTheme()

const activeHighlights = computed(() => props.highlights || visualHighlights.value || { vertexStatus: {}, edgeStatus: {} })

const selectedEdgeInfo = computed(() => {
  if (!selectedEdgeId.value) return null
  return graph.value.getEdge(selectedEdgeId.value) || null
})

const selectedEdgeStatusMeta = computed(() => {
  const edge = selectedEdgeInfo.value
  if (!edge) return null
  const { edgeStatus = {} } = activeHighlights.value
  const status =
    edgeStatus[edge.id] ||
    edgeStatus[`${edge.source}->${edge.target}`] ||
    (!graph.value.directed ? edgeStatus[`${edge.target}->${edge.source}`] : null) ||
    null

  if (status === 'path') return { label: 'Menor Caminho', className: 'status-path' }
  if (status === 'tree') return { label: 'Árvore / AGM', className: 'status-tree' }
  if (status === 'cycle') return { label: 'Ciclo Rejeitado', className: 'status-cycle' }
  if (status === 'examining') return { label: 'Examinando', className: 'status-examining' }
  if (Object.keys(edgeStatus).length > 0) {
    return { label: 'Não usada', className: 'status-unused' }
  }
  return null
})

const containerRef = ref(null)
const viewportRef = ref(null)
const canvas2DRef = ref(null)

const viewMode = ref('3D')
const webglError = ref(false)
const isAutoRotating = ref(false)
const isLegendExpanded = ref(false)

let sceneManager = null
let containerResizeObserver = null

onMounted(() => {
  initThreeScene()
  init2DCanvas()
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    containerResizeObserver = new ResizeObserver(() => {
      if (viewMode.value === '2D' || webglError.value) {
        render2D()
      }
    })
    containerResizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  if (sceneManager) {
    sceneManager.destroy()
    sceneManager = null
  }
  if (containerResizeObserver) {
    containerResizeObserver.disconnect()
    containerResizeObserver = null
  }
  window.removeEventListener('resize', render2D)
})

function initThreeScene() {
  if (!viewportRef.value) return
  try {
    sceneManager = new ThreeSceneManager(viewportRef.value, {
      theme: theme.value,
      onSelectVertex: (id) => selectVertex(id),
      onSelectEdge: (id) => selectEdge(id),
      onClearSelection: () => {
        selectVertex(null)
        selectEdge(null)
      },
      onCameraChange: (camState) => {
        emit('camera-change', camState)
      }
    })
    if (props.externalCameraState) {
      sceneManager.setCameraState(props.externalCameraState)
    }
    updateScene()
  } catch (err) {
    console.error('Falha ao inicializar Three.js / WebGL:', err)
    webglError.value = true
    viewMode.value = '2D'
  }
}

watch(
  () => props.externalCameraState,
  (newState) => {
    if (newState && sceneManager && viewMode.value === '3D') {
      sceneManager.setCameraState(newState)
    }
  }
)

watch(theme, (newTheme) => {
  if (sceneManager) {
    sceneManager.setTheme(newTheme)
    updateScene()
  }
  if (viewMode.value === '2D' || webglError.value) {
    render2D()
  }
})

function updateScene() {
  if (sceneManager && viewMode.value === '3D') {
    sceneManager.updateGraph(
      graph.value,
      activeHighlights.value,
      selectedVertexId.value,
      selectedEdgeId.value
    )
  }
  if (viewMode.value === '2D' || webglError.value) {
    render2D()
  }
}

watch([graphVersion, activeHighlights, selectedVertexId, selectedEdgeId], () => {
  updateScene()
})

function setViewMode(mode) {
  viewMode.value = mode
  if (mode === '3D' && !sceneManager) {
    initThreeScene()
  }
  updateScene()
}

function fitCamera() {
  if (sceneManager && viewMode.value === '3D') {
    sceneManager.fitCameraToGraph()
  }
}

function toggleAutoRotate() {
  if (sceneManager && viewMode.value === '3D') {
    isAutoRotating.value = sceneManager.toggleAutoRotate()
  }
}

function reorganizeLayout() {
  applyForceLayout3D(graph.value, 80)
  addLog('info', 'Posições espaciais reorganizadas harmonicamente.')
  updateScene()
  if (sceneManager) {
    sceneManager.fitCameraToGraph()
  }
}

defineExpose({
  fitCamera,
  reorganizeLayout,
  setViewMode
})

// Renderizador 2D Canvas de Alta Precisão
function init2DCanvas() {
  window.addEventListener('resize', render2D)
  render2D()
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function handle2DCanvasClick(event) {
  const canvas = canvas2DRef.value
  if (!canvas || !containerRef.value) return

  const rect = canvas.getBoundingClientRect()
  const mx = event.clientX - rect.left
  const my = event.clientY - rect.top

  const width = containerRef.value.clientWidth || 800
  const height = containerRef.value.clientHeight || 500
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) / 110

  // 1. Verifica clique em vértice
  for (const v of graph.value.vertices) {
    const vx = cx + (v.x || 0) * scale
    const vy = cy + (v.y || 0) * scale
    if (Math.hypot(mx - vx, my - vy) <= 14) {
      selectVertex(selectedVertexId.value === v.id ? null : v.id)
      return
    }
  }

  // 2. Verifica clique em aresta
  for (const e of graph.value.edges) {
    const v1 = graph.value.getVertex(e.source)
    const v2 = graph.value.getVertex(e.target)
    if (!v1 || !v2) continue
    const x1 = cx + (v1.x || 0) * scale
    const y1 = cy + (v1.y || 0) * scale
    const x2 = cx + (v2.x || 0) * scale
    const y2 = cy + (v2.y || 0) * scale
    if (distToSegment(mx, my, x1, y1, x2, y2) <= 9) {
      selectEdge(selectedEdgeId.value === e.id ? null : e.id)
      return
    }
  }

  // 3. Clique no fundo vazio limpa seleção
  if (selectedEdgeId.value) selectEdge(null)
  if (selectedVertexId.value) selectVertex(null)
}

function render2D() {
  const canvas = canvas2DRef.value
  if (!canvas || !containerRef.value) return

  const width = containerRef.value.clientWidth || 800
  const height = containerRef.value.clientHeight || 500
  if (!width || !height) return
  const dpr = window.devicePixelRatio || 1

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const isLight = theme.value === 'light'
  const bgFill = isLight ? '#f8fafc' : '#090d16'
  ctx.fillStyle = bgFill
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) / 110

  const { vertexStatus = {}, edgeStatus = {} } = activeHighlights.value

  // Desenho das Arestas 2D
  graph.value.edges.forEach(e => {
    const v1 = graph.value.getVertex(e.source)
    const v2 = graph.value.getVertex(e.target)
    if (!v1 || !v2) return

    const x1 = cx + (v1.x || 0) * scale
    const y1 = cy + (v1.y || 0) * scale
    const x2 = cx + (v2.x || 0) * scale
    const y2 = cy + (v2.y || 0) * scale

    const isSelected = selectedEdgeId.value === e.id
    const status =
      edgeStatus[e.id] ||
      edgeStatus[`${e.source}->${e.target}`] ||
      (!graph.value.directed ? edgeStatus[`${e.target}->${e.source}`] : null)

    const defaultColor = isLight ? '#94a3b8' : '#475569'
    const semanticEdgeColor =
      status === 'tree'
        ? '#10b981'
        : status === 'cycle'
          ? '#ef4444'
          : status === 'path'
            ? '#0ea5e9'
            : status === 'examining'
              ? '#f59e0b'
              : defaultColor

    const baseLineWidth = status ? 3.5 : 1.75

    // Moldura tracejada neutra para aresta selecionada (SEM alterar a cor semântica da aresta)
    if (isSelected) {
      ctx.save()
      ctx.lineCap = 'round'
      ctx.setLineDash([6, 4])
      ctx.lineWidth = baseLineWidth + 7.5
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.55)' : 'rgba(248, 250, 252, 0.65)'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      ctx.setLineDash([])
      ctx.lineWidth = baseLineWidth + 3.5
      ctx.strokeStyle = bgFill
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.restore()
    }

    // Linha principal da aresta na sua cor original exata
    ctx.lineWidth = baseLineWidth
    ctx.strokeStyle = semanticEdgeColor
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Seta direcionada em 2D (mantém cor semântica)
    if (graph.value.directed) {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const arrowLen = 10
      const arrowX = x1 + (x2 - x1) * 0.72
      const arrowY = y1 + (y2 - y1) * 0.72

      ctx.fillStyle = semanticEdgeColor
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - arrowLen * Math.cos(angle - Math.PI / 6),
        arrowY - arrowLen * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        arrowX - arrowLen * Math.cos(angle + Math.PI / 6),
        arrowY - arrowLen * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fill()
    }

    // Badge de Peso (com colchetes neutros externos se selecionada)
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    if (graph.value.weighted) {
      if (isSelected) {
        ctx.save()
        ctx.strokeStyle = isLight ? '#0f172a' : '#f8fafc'
        ctx.lineWidth = 1.6
        ctx.setLineDash([4, 3])
        ctx.strokeRect(mx - 17, my - 13, 34, 26)
        ctx.restore()
      }

      ctx.fillStyle = isLight ? '#ffffff' : '#141c2e'
      ctx.fillRect(mx - 13, my - 9, 26, 18)
      ctx.strokeStyle = isLight ? '#e7eaf2' : 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.strokeRect(mx - 13, my - 9, 26, 18)

      ctx.fillStyle =
        status === 'tree'
          ? '#10b981'
          : status === 'cycle'
            ? '#ef4444'
            : status === 'path'
              ? '#0ea5e9'
              : status === 'examining'
                ? '#f59e0b'
                : isLight
                  ? '#172033'
                  : '#f8fafc'
      ctx.font = 'bold 10px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(e.weight), mx, my)
    } else if (isSelected) {
      ctx.save()
      ctx.strokeStyle = isLight ? '#0f172a' : '#f8fafc'
      ctx.lineWidth = 1.6
      ctx.setLineDash([3, 2])
      ctx.beginPath()
      ctx.arc(mx, my, 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  })

  // Desenho dos Vértices 2D
  graph.value.vertices.forEach(v => {
    const vx = cx + (v.x || 0) * scale
    const vy = cy + (v.y || 0) * scale
    const status = vertexStatus[v.id]
    const isSelected = selectedVertexId.value === v.id

    ctx.beginPath()
    ctx.arc(vx, vy, isSelected ? 12 : 9, 0, Math.PI * 2)

    const defaultNodeColor = isLight ? '#172033' : '#94a3b8'
    ctx.fillStyle = isSelected
      ? '#4f63f6'
      : status === 'current'
        ? '#f59e0b'
        : status === 'visited' || status === 'settled'
          ? '#10b981'
          : status === 'queued'
            ? '#8b5cf6'
            : status === 'path'
              ? '#0ea5e9'
              : status === 'source'
                ? '#4f63f6'
                : status === 'target'
                  ? '#ef4444'
                  : defaultNodeColor
    ctx.fill()

    ctx.lineWidth = 2
    ctx.strokeStyle = isSelected ? '#ffffff' : isLight ? '#cbd5e1' : '#1e293b'
    ctx.stroke()

    // Rótulo
    ctx.fillStyle = isLight ? '#172033' : '#f8fafc'
    ctx.font = 'bold 11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${v.id} · ${v.label}`, vx, vy + 22)
  })
}
</script>

<style scoped>
.graph-canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--canvas-bg);
  overflow: hidden;
}

.three-viewport,
.fallback-2d-viewport {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.canvas-2d {
  width: 100%;
  height: 100%;
  display: block;
  cursor: pointer;
}

/* Toolbar Flutuante em Cápsula */
.canvas-glass-toolbar {
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.25rem 0.5rem;
  box-shadow: var(--shadow-sm);
  z-index: 20;
}

.is-compact .canvas-glass-toolbar {
  top: var(--spacing-2);
  left: var(--spacing-2);
  padding: 0.18rem 0.35rem;
  gap: 0.3rem;
}

.toolbar-mode-switch {
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  padding: 2px;
  border-radius: var(--radius-full);
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.is-compact .mode-btn {
  padding: 0.18rem 0.45rem;
  font-size: 0.68rem;
}

.mode-btn:hover {
  color: var(--text-primary);
}

.mode-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-xs);
}

.toolbar-divider {
  width: 1px;
  height: 16px;
  background: var(--border-subtle);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.is-compact .action-icon-btn {
  padding: 0.25rem 0.4rem;
}

.action-icon-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.action-icon-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

/* Pílula Flutuante Neutra de Aresta Selecionada */
.selected-edge-floating-pill {
  position: absolute;
  bottom: var(--spacing-3);
  left: var(--spacing-3);
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-surface);
  border: 1.5px dashed var(--text-secondary);
  border-radius: var(--radius-full);
  padding: 0.28rem 0.55rem 0.28rem 0.65rem;
  font-size: 0.7rem;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  animation: fadeIn var(--transition-fast) ease-out;
}

.is-compact .selected-edge-floating-pill {
  bottom: var(--spacing-2);
  left: var(--spacing-2);
  padding: 0.2rem 0.45rem 0.2rem 0.55rem;
  font-size: 0.66rem;
}

.edge-bracket-mark {
  font-weight: 800;
  color: var(--text-secondary);
}

.edge-id-pair {
  font-weight: 700;
}

.edge-weight-meta {
  color: var(--text-secondary);
  background: var(--bg-subtle);
  padding: 0.05rem 0.35rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.edge-status-chip {
  font-size: 0.64rem;
  font-weight: 700;
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-full);
}

.status-tree {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.status-path {
  background: var(--color-path-bg);
  color: var(--color-path);
}

.status-cycle {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.status-examining {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.status-unused {
  background: var(--bg-subtle);
  color: var(--text-muted);
}

.edge-deselect-btn {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edge-deselect-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

/* Legenda Flutuante Discreta */
.floating-legend-capsule {
  position: absolute;
  bottom: var(--spacing-3);
  right: var(--spacing-3);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.is-compact .floating-legend-capsule {
  bottom: var(--spacing-2);
  right: var(--spacing-2);
}

.legend-toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.35rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.is-compact .legend-toggle-pill {
  padding: 0.25rem 0.55rem;
  font-size: 0.68rem;
}

.legend-toggle-pill:hover {
  color: var(--text-primary);
  border-color: var(--border-light);
}

.legend-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
}

.legend-popover-content {
  margin-bottom: var(--spacing-2);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 185px;
  animation: fadeIn var(--transition-fast) ease-out;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.legend-item-divider {
  padding-top: 0.35rem;
  margin-top: 0.1rem;
  border-top: 1px solid var(--border-subtle);
}

.bracket-sample {
  font-size: 0.64rem;
  font-weight: 800;
  color: var(--text-primary);
  width: 14px;
  text-align: center;
  flex-shrink: 0;
}

.dot-sample {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.dot-amber { background: #f59e0b; box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
.dot-green { background: #10b981; }
.dot-purple { background: #8b5cf6; }
.dot-blue { background: #0ea5e9; }
.dot-red { background: #ef4444; }
.dot-slate { background: #64748b; }

.webgl-error-banner {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  background: var(--color-warning-bg);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--color-warning);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  z-index: 25;
}

.icon-2xs { width: 11px; height: 11px; }
.icon-xs { width: 13px; height: 13px; }

@media (max-width: 600px) {
  .btn-text {
    display: none;
  }

  .canvas-glass-toolbar {
    top: var(--spacing-2);
    left: var(--spacing-2);
    padding: 0.2rem 0.35rem;
  }

  .floating-legend-capsule {
    bottom: var(--spacing-2);
    right: var(--spacing-2);
  }
}
</style>
