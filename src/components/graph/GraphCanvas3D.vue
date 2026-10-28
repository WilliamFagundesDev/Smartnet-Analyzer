<template>
  <div class="graph-canvas-container" ref="containerRef">
    <!-- Toolbar Flutuante em Cápsula Minimalista -->
    <div class="canvas-glass-toolbar">
      <div class="toolbar-mode-switch">
        <button
          class="mode-btn"
          :class="{ active: viewMode === '3D' }"
          @click="setViewMode('3D')"
          title="Modo Espacial 3D (WebGL)"
          aria-label="Ativar visualização 3D"
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
        >
          <Maximize2 class="icon-xs" />
          <span class="btn-text">Centralizar</span>
        </button>

        <button
          class="action-icon-btn"
          @click="reorganizeLayout"
          title="Rearranjar nós via simulação de física 3D"
          aria-label="Rearranjar layout"
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
      <canvas ref="canvas2DRef" class="canvas-2d"></canvas>
    </div>

    <!-- Legenda Semântica Flutuante Discreta (Expansível) -->
    <div class="floating-legend-capsule" :class="{ 'is-expanded': isLegendExpanded }">
      <button
        class="legend-toggle-pill"
        @click="isLegendExpanded = !isLegendExpanded"
        title="Alternar legenda de cores semânticas"
      >
        <span class="legend-indicator-dot"></span>
        <span class="legend-btn-label">Legenda de Cores</span>
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Box,
  Layers,
  Maximize2,
  Sparkles,
  RotateCw,
  ChevronUp,
  ChevronDown,
  AlertTriangle
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useAlgorithmRunner } from '../../composables/useAlgorithmRunner.js'
import { useTheme } from '../../composables/useTheme.js'
import { ThreeSceneManager } from '../../visualization/threeScene.js'
import { applyForceLayout3D } from '../../visualization/graphLayout.js'

const { graph, graphVersion, selectedVertexId, selectedEdgeId, selectVertex, selectEdge, addLog } = useGraph()
const { visualHighlights } = useAlgorithmRunner()
const { theme } = useTheme()

const containerRef = ref(null)
const viewportRef = ref(null)
const canvas2DRef = ref(null)

const viewMode = ref('3D')
const webglError = ref(false)
const isAutoRotating = ref(false)
const isLegendExpanded = ref(false)

let sceneManager = null

onMounted(() => {
  initThreeScene()
  init2DCanvas()
})

onBeforeUnmount(() => {
  if (sceneManager) {
    sceneManager.destroy()
    sceneManager = null
  }
  window.removeEventListener('resize', render2D)
})

function initThreeScene() {
  if (!viewportRef.value) return
  try {
    sceneManager = new ThreeSceneManager(viewportRef.value, {
      theme: theme.value,
      onSelectVertex: (id) => selectVertex(id),
      onSelectEdge: (id) => selectEdge(id)
    })
    updateScene()
  } catch (err) {
    console.error('Falha ao inicializar Three.js / WebGL:', err)
    webglError.value = true
    viewMode.value = '2D'
  }
}

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
      visualHighlights.value,
      selectedVertexId.value,
      selectedEdgeId.value
    )
  }
  if (viewMode.value === '2D' || webglError.value) {
    render2D()
  }
}

watch([graphVersion, visualHighlights, selectedVertexId, selectedEdgeId], () => {
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

// Renderizador 2D Canvas de Alta Precisão
function init2DCanvas() {
  window.addEventListener('resize', render2D)
  render2D()
}

function render2D() {
  const canvas = canvas2DRef.value
  if (!canvas || !containerRef.value) return

  const width = containerRef.value.clientWidth || 800
  const height = containerRef.value.clientHeight || 500
  const dpr = window.devicePixelRatio || 1

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const isLight = theme.value === 'light'
  ctx.fillStyle = isLight ? '#f8fafc' : '#090d16'
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) / 110

  const { vertexStatus = {}, edgeStatus = {} } = visualHighlights.value

  // Desenho das Arestas 2D
  graph.value.edges.forEach(e => {
    const v1 = graph.value.getVertex(e.source)
    const v2 = graph.value.getVertex(e.target)
    if (!v1 || !v2) return

    const x1 = cx + (v1.x || 0) * scale
    const y1 = cy + (v1.y || 0) * scale
    const x2 = cx + (v2.x || 0) * scale
    const y2 = cy + (v2.y || 0) * scale

    const status = edgeStatus[e.id] || edgeStatus[`${e.source}->${e.target}`]
    const defaultColor = isLight ? '#94a3b8' : '#475569'

    ctx.lineWidth = status ? 3.5 : 1.5
    ctx.strokeStyle = status === 'tree' ? '#10b981' : status === 'cycle' ? '#ef4444' : status === 'path' ? '#0ea5e9' : status === 'examining' ? '#f59e0b' : defaultColor

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Seta direcionada em 2D
    if (graph.value.directed) {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const arrowLen = 10
      const arrowX = x1 + (x2 - x1) * 0.72
      const arrowY = y1 + (y2 - y1) * 0.72

      ctx.fillStyle = ctx.strokeStyle
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

    // Badge de Peso
    if (graph.value.weighted) {
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      ctx.fillStyle = isLight ? '#ffffff' : '#141c2e'
      ctx.fillRect(mx - 13, my - 9, 26, 18)
      ctx.strokeStyle = isLight ? '#e7eaf2' : 'rgba(255, 255, 255, 0.15)'
      ctx.strokeRect(mx - 13, my - 9, 26, 18)

      ctx.fillStyle = status === 'tree' ? '#10b981' : status === 'cycle' ? '#ef4444' : status === 'path' ? '#0ea5e9' : (isLight ? '#172033' : '#f8fafc')
      ctx.font = 'bold 10px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(e.weight), mx, my)
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
    ctx.fillStyle = isSelected ? '#4f63f6' : status === 'current' ? '#f59e0b' : status === 'visited' ? '#10b981' : status === 'queued' ? '#8b5cf6' : status === 'path' ? '#0ea5e9' : defaultNodeColor
    ctx.fill()

    ctx.lineWidth = 2
    ctx.strokeStyle = isSelected ? '#ffffff' : (isLight ? '#cbd5e1' : '#1e293b')
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

.action-icon-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.action-icon-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
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
  min-width: 180px;
  animation: fadeIn var(--transition-fast) ease-out;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
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
