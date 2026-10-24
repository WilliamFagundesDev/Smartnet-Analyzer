<template>
  <div class="graph-canvas-container" ref="containerRef">
    <!-- Barra Flutuante de Ferramentas Compacta e Essencial -->
    <div class="canvas-toolbar">
      <div class="toolbar-group">
        <button
          class="tool-btn"
          :class="{ active: viewMode === '3D' }"
          @click="setViewMode('3D')"
          title="Visualização Espacial 3D"
        >
          <Box class="icon-sm" />
          <span>3D</span>
        </button>
        <button
          class="tool-btn"
          :class="{ active: viewMode === '2D' }"
          @click="setViewMode('2D')"
          title="Visualização em Plano 2D"
        >
          <Layers class="icon-sm" />
          <span>2D</span>
        </button>
      </div>

      <div class="toolbar-sep"></div>

      <div class="toolbar-group">
        <button class="tool-btn" @click="fitCamera" title="Centralizar e enquadrar nós da rede">
          <Maximize2 class="icon-sm" />
          <span>Centralizar</span>
        </button>
        <button class="tool-btn" @click="reorganizeLayout" title="Distribuir nós harmonicamente">
          <Sparkles class="icon-sm" />
          <span>Organizar</span>
        </button>
      </div>
    </div>

    <!-- Viewport Three.js 3D -->
    <div
      v-show="viewMode === '3D' && !webglError"
      class="three-viewport"
      ref="viewportRef"
    ></div>

    <!-- Fallback / Modo 2D Canvas -->
    <div v-show="viewMode === '2D' || webglError" class="fallback-2d-viewport">
      <canvas ref="canvas2DRef" class="canvas-2d"></canvas>
    </div>

    <!-- Faixa Permanente de Identificação Semântica das Cores -->
    <div class="semantic-legend-bar">
      <div class="legend-chip-item" title="Elemento sendo avaliado ou expandido no passo atual">
        <span class="legend-color-dot dot-amber"></span>
        <span class="legend-chip-label">Atual (Processando)</span>
      </div>
      <div class="legend-chip-item" title="Vértice visitado ou aresta aceita na Árvore/AGM">
        <span class="legend-color-dot dot-green"></span>
        <span class="legend-chip-label">Visitado / Árvore</span>
      </div>
      <div class="legend-chip-item" title="Vértice descoberto aguardando na fila FIFO ou Min-Heap">
        <span class="legend-color-dot dot-purple"></span>
        <span class="legend-chip-label">Fila / Min-Heap</span>
      </div>
      <div class="legend-chip-item" title="Conexão integrante do menor caminho ótimo calculado">
        <span class="legend-color-dot dot-blue"></span>
        <span class="legend-chip-label">Menor Caminho</span>
      </div>
      <div class="legend-chip-item" title="Aresta descartada por formar ciclo (Kruskal)">
        <span class="legend-color-dot dot-red"></span>
        <span class="legend-chip-label">Ciclo Rejeitado</span>
      </div>
      <div class="legend-chip-item" title="Vértice ou aresta ainda em repouso">
        <span class="legend-color-dot dot-slate"></span>
        <span class="legend-chip-label">Não Visitado</span>
      </div>
    </div>

    <!-- Aviso caso WebGL não esteja disponível -->
    <div v-if="webglError" class="webgl-error-banner">
      <AlertTriangle class="icon-sm text-amber" />
      <span>Modo 2D ativado (WebGL indisponível neste navegador).</span>
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
const showLegend = ref(false)

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
    console.error('Falha ao inicializar WebGL/Three.js:', err)
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

function resetCamera() {
  if (sceneManager && viewMode.value === '3D') {
    sceneManager.resetCamera()
  }
}

function toggleAutoRotate() {
  if (sceneManager && viewMode.value === '3D') {
    isAutoRotating.value = sceneManager.toggleAutoRotate()
  }
}

function reorganizeLayout() {
  applyForceLayout3D(graph.value, 80)
  addLog('info', 'Posições dos nós reorganizadas via simulação física.')
  updateScene()
  if (sceneManager) {
    sceneManager.fitCameraToGraph()
  }
}

// Renderizador 2D Canvas Fallback
function init2DCanvas() {
  window.addEventListener('resize', render2D)
  render2D()
}

function render2D() {
  const canvas = canvas2DRef.value
  if (!canvas || !containerRef.value) return
  const width = containerRef.value.clientWidth || 800
  const height = containerRef.value.clientHeight || 500

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const isLight = theme.value === 'light'
  ctx.fillStyle = isLight ? '#f1f5f9' : '#0a0d14'
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) / 110

  const { vertexStatus = {}, edgeStatus = {} } = visualHighlights.value

  // Arestas
  graph.value.edges.forEach(e => {
    const v1 = graph.value.getVertex(e.source)
    const v2 = graph.value.getVertex(e.target)
    if (!v1 || !v2) return

    const x1 = cx + (v1.x || 0) * scale
    const y1 = cy + (v1.y || 0) * scale
    const x2 = cx + (v2.x || 0) * scale
    const y2 = cy + (v2.y || 0) * scale

    const status = edgeStatus[e.id] || edgeStatus[`${e.source}->${e.target}`]
    const defaultEdgeColor = isLight ? '#94a3b8' : '#475569'
    ctx.lineWidth = status ? 3.5 : 1.5
    ctx.strokeStyle = status === 'tree' ? (isLight ? '#059669' : '#10b981') : status === 'cycle' ? (isLight ? '#dc2626' : '#ef4444') : status === 'path' ? (isLight ? '#0284c7' : '#38bdf8') : status === 'examining' ? (isLight ? '#d97706' : '#f59e0b') : defaultEdgeColor

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    if (graph.value.weighted) {
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      ctx.fillStyle = isLight ? '#ffffff' : '#0f172a'
      ctx.fillRect(mx - 12, my - 9, 24, 18)
      ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.1)'
      ctx.strokeRect(mx - 12, my - 9, 24, 18)
      ctx.fillStyle = status === 'tree' ? (isLight ? '#059669' : '#34d399') : status === 'cycle' ? (isLight ? '#dc2626' : '#f87171') : status === 'path' ? (isLight ? '#0284c7' : '#38bdf8') : status === 'examining' ? (isLight ? '#d97706' : '#fbbf24') : (isLight ? '#0f172a' : '#cbd5e1')
      ctx.font = 'bold 11px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(e.weight), mx, my)
    }
  })

  // Vértices 2D
  graph.value.vertices.forEach(v => {
    const vx = cx + (v.x || 0) * scale
    const vy = cy + (v.y || 0) * scale
    const status = vertexStatus[v.id]
    const isSelected = selectedVertexId.value === v.id

    ctx.beginPath()
    ctx.arc(vx, vy, isSelected ? 12 : 9, 0, Math.PI * 2)

    // Cores Semânticas 2D de Alto Contraste (Perfeito para projetor)
    const defaultNodeColor = isLight ? '#334155' : '#64748b'
    ctx.fillStyle = status === 'current' ? (isLight ? '#d97706' : '#f59e0b') : status === 'visited' ? (isLight ? '#059669' : '#10b981') : status === 'queued' ? (isLight ? '#7c3aed' : '#8b5cf6') : status === 'path' ? (isLight ? '#0284c7' : '#38bdf8') : isSelected ? (isLight ? '#2563eb' : '#ffffff') : defaultNodeColor
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = isSelected ? (isLight ? '#1d4ed8' : '#3b82f6') : (isLight ? '#94a3b8' : '#1e293b')
    ctx.stroke()

    // Rótulo
    ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc'
    ctx.font = 'bold 11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${v.id} (${v.label})`, vx, vy + 20)
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

.three-viewport, .fallback-2d-viewport {
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

/* Barra de Ferramentas Compacta */
.canvas-toolbar {
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--bg-surface);
  backdrop-filter: blur(8px);
  padding: 0.25rem 0.45rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  z-index: 20;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.toolbar-sep {
  width: 1px;
  height: 14px;
  background: var(--border-subtle);
}

.tool-btn {
  padding: 0.35rem 0.55rem;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tool-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.05);
}

.tool-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

/* Faixa Permanente de Identificação Semântica das Cores */
.semantic-legend-bar {
  position: absolute;
  bottom: var(--spacing-3);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  background: var(--bg-surface);
  backdrop-filter: blur(8px);
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  z-index: 20;
  max-width: 95%;
  flex-wrap: wrap;
  justify-content: center;
}

.legend-chip-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  user-select: none;
}

.legend-color-dot {
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.dot-amber { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.7); }
.dot-green { background: #10b981; }
.dot-purple { background: #8b5cf6; }
.dot-blue { background: #38bdf8; }
.dot-red { background: #ef4444; }
.dot-slate { background: #64748b; }

.webgl-error-banner {
  position: absolute;
  bottom: var(--spacing-3);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  z-index: 25;
}

.icon-sm {
  width: 15px;
  height: 15px;
}
</style>
