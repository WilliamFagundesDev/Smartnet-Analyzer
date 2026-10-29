<template>
  <div class="visual-canvas-wrapper" ref="wrapperRef" @contextmenu.prevent>
    <!-- Barra Superior de Ferramentas Flutuante -->
    <div class="floating-toolbar glass-panel">
      <!-- Modos de Ferramenta -->
      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: currentTool === 'select' }"
          @click="setTool('select')"
          title="Ferramenta de Seleção & Mover (Atalho: V)"
        >
          <MousePointer class="icon-xs" />
          <span class="tool-label">Mover / Selecionar</span>
          <span class="tool-kbd font-mono">V</span>
        </button>

        <button
          class="tool-btn"
          :class="{ active: currentTool === 'node' }"
          @click="setTool('node')"
          title="Adicionar Vértice (Atalho: N) — Clique no espaço vazio para criar"
        >
          <CircleDot class="icon-xs" />
          <span class="tool-label">Novo Vértice</span>
          <span class="tool-kbd font-mono">N</span>
        </button>

        <button
          class="tool-btn"
          :class="{ active: currentTool === 'edge' }"
          @click="setTool('edge')"
          title="Conectar Vértices (Atalho: E) — Clique na origem e no destino"
        >
          <Share2 class="icon-xs" />
          <span class="tool-label">Nova Conexão</span>
          <span class="tool-kbd font-mono">E</span>
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Histórico (Undo / Redo) -->
      <div class="tool-group">
        <button
          class="tool-icon-btn"
          :disabled="!canUndo"
          @click="undo"
          title="Desfazer última ação (Ctrl+Z)"
        >
          <RotateCcw class="icon-xs" />
        </button>

        <button
          class="tool-icon-btn"
          :disabled="!canRedo"
          @click="redo"
          title="Refazer ação (Ctrl+Shift+Z)"
        >
          <RotateCw class="icon-xs" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Operações de Câmera & Layout -->
      <div class="tool-group">
        <button class="tool-icon-btn" @click="zoomIn" title="Aproximar Zoom (+)">
          <Plus class="icon-xs" />
        </button>
        <button class="tool-icon-btn" @click="zoomOut" title="Afastar Zoom (-)">
          <Minus class="icon-xs" />
        </button>
        <button class="tool-icon-btn" @click="fitView" title="Enquadrar e Centralizar nós">
          <Maximize2 class="icon-xs" />
        </button>
        <button class="tool-icon-btn" @click="runForceLayout" title="Organizar nós via física de molas">
          <Sparkles class="icon-xs" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Modo Foco / Tela Ampla -->
      <div class="tool-group">
        <button
          class="tool-btn focus-toggle-btn"
          :class="{ active: isFocusMode }"
          @click="toggleFocusMode"
          :title="isFocusMode ? 'Sair do Modo Foco (Restaurar barras)' : 'Ativar Modo Foco / Tela Ampla (Maximizar área do canvas)'"
        >
          <Minimize2 v-if="isFocusMode" class="icon-xs" />
          <Maximize2 v-else class="icon-xs" />
          <span class="tool-label">{{ isFocusMode ? 'Sair do Foco' : 'Modo Foco' }}</span>
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Ação Destrutiva / Limpeza -->
      <div class="tool-group">
        <button
          v-if="selectedVertexId || selectedEdgeId"
          class="tool-btn danger"
          @click="handleDeleteSelected"
          title="Excluir elemento selecionado (Delete)"
        >
          <Trash2 class="icon-xs" />
          <span class="tool-label">Excluir</span>
          <span class="tool-kbd font-mono">Del</span>
        </button>

        <button class="tool-icon-btn danger-hover" @click="handleClearGraph" title="Limpar todo o grafo">
          <Trash2 class="icon-xs" />
        </button>
      </div>
    </div>

    <!-- Indicador de Modo Ativo / Dica de Interação -->
    <div class="canvas-hint-banner" v-if="currentTool === 'node' || currentTool === 'edge' || connectingSourceId">
      <span v-if="currentTool === 'node'">
        🎯 <strong>Modo Inserção:</strong> Clique em qualquer ponto da grade para criar um novo vértice.
      </span>
      <span v-else-if="connectingSourceId">
        🔗 Conectando a partir de <strong>{{ connectingSourceId }}</strong>. Clique no nó de destino (ou ESC para cancelar).
      </span>
      <span v-else-if="currentTool === 'edge'">
        🔗 <strong>Modo Conexão:</strong> Clique no primeiro vértice para iniciar a aresta.
      </span>
    </div>

    <!-- Feedback Toast Rápido de Erro ou Alerta -->
    <transition name="fade">
      <div v-if="toastMessage" class="canvas-toast" :class="toastType">
        <AlertTriangle v-if="toastType === 'error'" class="icon-xs" />
        <Check v-else class="icon-xs" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Canvas SVG Interativo Principal -->
    <svg
      ref="svgRef"
      class="visual-svg-canvas"
      :class="{
        'tool-node': currentTool === 'node',
        'tool-edge': currentTool === 'edge',
        'is-panning': isPanning
      }"
      @pointerdown="handleSvgPointerDown"
      @pointermove="handleSvgPointerMove"
      @pointerup="handleSvgPointerUp"
      @wheel.prevent="handleWheel"
      @dblclick="handleSvgDoubleClick"
    >
      <defs>
        <!-- Padrão de Grade de Engenharia em Pontos (Dot Matrix) -->
        <pattern
          id="dotGrid"
          :width="28 * viewTransform.scale"
          :height="28 * viewTransform.scale"
          patternUnits="userSpaceOnUse"
          :x="viewTransform.x + svgCenter.x"
          :y="viewTransform.y + svgCenter.y"
        >
          <circle
            cx="2"
            cy="2"
            r="1.2"
            class="grid-dot"
          />
        </pattern>

        <!-- Marcador de Seta Direcionada Normal -->
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="18"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" class="arrow-head" />
        </marker>

        <!-- Marcador de Seta Direcionada Selecionada -->
        <marker
          id="arrow-selected"
          viewBox="0 0 10 10"
          refX="18"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" class="arrow-head-selected" />
        </marker>
      </defs>

      <!-- Fundo de Grade Interativo -->
      <rect width="100%" height="100%" fill="url(#dotGrid)" class="grid-background" />

      <!-- Grupo Global com Pan & Zoom Aplicados -->
      <g :transform="`translate(${viewTransform.x + svgCenter.x}, ${viewTransform.y + svgCenter.y}) scale(${viewTransform.scale})`">
        <!-- 1. Linhas / Arestas Existentes -->
        <g class="edges-layer">
          <g
            v-for="e in edgeRenderList"
            :key="e.id"
            class="edge-group"
            :class="{ 'is-selected': selectedEdgeId === e.id }"
            @click.stop="handleSelectEdge(e.id)"
          >
            <!-- Área de toque expandida invisível para facilitar o clique -->
            <line
              :x1="e.x1"
              :y1="e.y1"
              :x2="e.x2"
              :y2="e.y2"
              class="edge-hitbox"
            />

            <!-- Halo neutro sutil no hover (sem alterar a cor da aresta) -->
            <line
              :x1="e.x1"
              :y1="e.y1"
              :x2="e.x2"
              :y2="e.y2"
              class="edge-hover-halo"
            />

            <!-- Moldura Geométrica de Seleção (trilho tracejado neutro sem alterar a cor da aresta) -->
            <template v-if="selectedEdgeId === e.id">
              <line
                :x1="e.x1"
                :y1="e.y1"
                :x2="e.x2"
                :y2="e.y2"
                class="edge-selection-casing"
              />
              <line
                :x1="e.x1"
                :y1="e.y1"
                :x2="e.x2"
                :y2="e.y2"
                class="edge-selection-gap"
              />
            </template>

            <!-- Linha visível da aresta (cor original preservada) -->
            <line
              :x1="e.x1"
              :y1="e.y1"
              :x2="e.x2"
              :y2="e.y2"
              class="edge-line"
              :marker-end="graph.directed ? 'url(#arrow)' : null"
            />

            <!-- Badge / Pílula de Peso no Centro da Aresta -->
            <g
              v-if="graph.weighted"
              :transform="`translate(${e.midX}, ${e.midY})`"
              class="weight-badge-group"
              @dblclick.stop="startEditWeight(e)"
            >
              <rect
                v-if="selectedEdgeId === e.id"
                x="-18"
                y="-14"
                width="36"
                height="28"
                rx="7"
                class="weight-badge-selection-ring"
              />
              <rect
                x="-14"
                y="-10"
                width="28"
                height="20"
                rx="5"
                class="weight-badge-rect"
              />
              <text y="3" text-anchor="middle" class="weight-badge-text font-mono">
                {{ e.weight }}
              </text>
            </g>
            <!-- Retículo geométrico neutro caso não seja ponderado e esteja selecionada -->
            <circle
              v-else-if="selectedEdgeId === e.id"
              :cx="e.midX"
              :cy="e.midY"
              r="7"
              class="unweighted-selection-reticle"
            />
          </g>
        </g>

        <!-- 2. Linha Elástica Provisória de Nova Conexão em Andamento -->
        <line
          v-if="connectingSourceNode && rubberbandTarget"
          :x1="connectingSourceNode.screenX"
          :y1="connectingSourceNode.screenY"
          :x2="rubberbandTarget.x"
          :y2="rubberbandTarget.y"
          class="rubberband-line"
          :marker-end="graph.directed ? 'url(#arrow-selected)' : null"
        />

        <!-- 3. Camada de Vértices -->
        <g class="nodes-layer">
          <g
            v-for="v in vertexRenderList"
            :key="v.id"
            class="node-group"
            :class="{
              'is-selected': selectedVertexId === v.id,
              'is-connecting-source': connectingSourceId === v.id,
              'is-snap-target': snapTargetId === v.id
            }"
            :transform="`translate(${v.screenX}, ${v.screenY})`"
            @pointerdown.stop="handleNodePointerDown($event, v)"
            @click.stop="handleNodeClick(v)"
            @mouseenter="handleNodeMouseEnter(v)"
            @mouseleave="handleNodeMouseLeave"
          >
            <!-- Halo de Seleção / Pulso Ativo -->
            <circle
              v-if="selectedVertexId === v.id || connectingSourceId === v.id || snapTargetId === v.id"
              r="28"
              class="node-halo"
              :class="{ 'snap': snapTargetId === v.id, 'source': connectingSourceId === v.id }"
            />

            <!-- Círculo Principal do Vértice -->
            <circle
              r="20"
              class="node-circle"
              :class="`node-type-${v.type || 'standard'}`"
            />

            <!-- Ícone ou Identificador do Nó -->
            <text text-anchor="middle" y="4" class="node-id-text font-mono font-bold">
              {{ v.id }}
            </text>

            <!-- Rótulo / Nome de Exibição embaixo do Nó -->
            <text
              text-anchor="middle"
              y="32"
              class="node-label-text"
              v-if="v.label && v.label !== v.id"
            >
              {{ v.label }}
            </text>

            <!-- Conector Rápido (Hover Handle para ligar nós) -->
            <g
              v-if="currentTool === 'select' && hoveredNodeId === v.id"
              class="quick-connect-handle"
              transform="translate(22, 0)"
              @pointerdown.stop="startQuickConnect(v)"
              title="Arrastar para conectar a outro nó"
            >
              <circle r="7" class="handle-circle" />
              <Share2 class="handle-icon" />
            </g>
          </g>
        </g>
      </g>
    </svg>

    <!-- Painel Contextual Flutuante (Inspector) do Elemento Selecionado -->
    <transition name="slide-fade">
      <div v-if="selectedVertex" class="context-inspector glass-panel">
        <div class="inspector-header">
          <div class="inspector-title-row">
            <span class="badge" :class="getTypeBadge(selectedVertex.type)">{{ selectedVertex.type }}</span>
            <h4 class="inspector-title font-mono font-bold">{{ selectedVertex.id }}</h4>
          </div>
          <button class="inspector-close" @click="selectVertex(null)">
            <X class="icon-xs" />
          </button>
        </div>

        <div class="inspector-body">
          <div class="form-group-sm">
            <label class="inspector-label">Nome / Rótulo:</label>
            <input
              type="text"
              v-model="vertexEditLabel"
              @blur="saveVertexLabel"
              @keyup.enter="saveVertexLabel"
              class="input-control input-sm"
              placeholder="Ex: Ponto de Acesso A"
            />
          </div>

          <div class="form-group-sm">
            <label class="inspector-label">Tipo de Infraestrutura:</label>
            <div class="type-pill-grid">
              <button
                type="button"
                class="type-pill"
                :class="{ active: selectedVertex.type === 'standard' }"
                @click="changeVertexType('standard')"
              >
                Padrão
              </button>
              <button
                type="button"
                class="type-pill hub"
                :class="{ active: selectedVertex.type === 'hub' }"
                @click="changeVertexType('hub')"
              >
                Hub
              </button>
              <button
                type="button"
                class="type-pill datacenter"
                :class="{ active: selectedVertex.type === 'datacenter' }"
                @click="changeVertexType('datacenter')"
              >
                Data
              </button>
              <button
                type="button"
                class="type-pill sensor"
                :class="{ active: selectedVertex.type === 'sensor' }"
                @click="changeVertexType('sensor')"
              >
                Sensor
              </button>
            </div>
          </div>

          <div class="inspector-stats-row">
            <span class="text-muted">Conexões incidentes:</span>
            <span class="font-mono font-bold">{{ getVertexDegree(selectedVertex.id) }}</span>
          </div>

          <div class="inspector-stats-row">
            <span class="text-muted">Posição (X, Y):</span>
            <span class="font-mono">({{ selectedVertex.x }}, {{ selectedVertex.y }})</span>
          </div>

          <div class="inspector-actions">
            <button class="btn btn-secondary btn-xs" @click="startConnectFromSelected" title="Criar aresta a partir deste nó">
              <Share2 class="icon-xs" />
              <span>Conectar</span>
            </button>
            <button class="btn btn-secondary btn-xs" @click="handleDuplicate" title="Criar cópia próxima deste nó">
              <Copy class="icon-xs" />
              <span>Duplicar</span>
            </button>
            <button class="btn btn-danger btn-xs" @click="handleDeleteSelected" title="Remover nó e arestas">
              <Trash2 class="icon-xs" />
            </button>
          </div>
        </div>
      </div>

      <!-- Painel Contextual de Aresta Selecionada -->
      <div v-else-if="selectedEdge" class="context-inspector glass-panel">
        <div class="inspector-header">
          <div class="inspector-title-row">
            <span class="badge badge-purple">Conexão</span>
            <h4 class="inspector-title font-mono font-bold">
              {{ selectedEdge.source }} {{ graph.directed ? '➔' : '↔' }} {{ selectedEdge.target }}
            </h4>
          </div>
          <button class="inspector-close" @click="selectEdge(null)">
            <X class="icon-xs" />
          </button>
        </div>

        <div class="inspector-body">
          <div v-if="graph.weighted" class="form-group-sm">
            <label class="inspector-label">Peso / Custo da Aresta:</label>
            <div class="weight-input-row">
              <input
                type="number"
                step="any"
                v-model.number="edgeEditWeight"
                @blur="saveEdgeWeight"
                @keyup.enter="saveEdgeWeight"
                class="input-control input-sm font-mono font-bold"
              />
              <button class="btn btn-primary btn-xs" @click="saveEdgeWeight">Salvar</button>
            </div>
          </div>

          <div v-if="graph.directed" class="form-group-sm">
            <button class="btn btn-secondary btn-xs full-width" @click="handleInvertEdge">
              <ArrowLeftRight class="icon-xs" />
              <span>Inverter Direção</span>
            </button>
          </div>

          <div class="inspector-actions">
            <button class="btn btn-danger btn-xs full-width" @click="handleDeleteSelected">
              <Trash2 class="icon-xs" />
              <span>Remover Conexão</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Rápido de Edição de Peso Inline -->
    <div v-if="editingEdgeWeightModal" class="inline-weight-popover glass-panel" :style="weightPopoverStyle">
      <span class="popover-title">Editar Peso:</span>
      <input
        type="number"
        step="any"
        ref="weightInputRef"
        v-model.number="inlineWeightVal"
        @keyup.enter="confirmInlineWeight"
        @keyup.esc="editingEdgeWeightModal = null"
        class="input-control input-xs font-mono font-bold"
      />
      <div class="popover-btns">
        <button class="btn btn-primary btn-xs" @click="confirmInlineWeight">OK</button>
        <button class="btn btn-secondary btn-xs" @click="editingEdgeWeightModal = null">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  MousePointer,
  CircleDot,
  Share2,
  RotateCcw,
  RotateCw,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Sparkles,
  Trash2,
  X,
  Copy,
  ArrowLeftRight,
  Check,
  AlertTriangle
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useLayout } from '../../composables/useLayout.js'
import { applyForceLayout3D } from '../../visualization/graphLayout.js'

const {
  graph,
  selectedVertexId,
  selectedEdgeId,
  selectVertex,
  selectEdge,
  addVertex,
  updateVertex,
  removeVertex,
  moveVertex,
  duplicateVertex,
  generateNextVertexId,
  addEdge,
  updateEdge,
  removeEdge,
  clearGraph,
  canUndo,
  canRedo,
  undo,
  redo
} = useGraph()

const { isFocusMode, toggleFocusMode } = useLayout()

const wrapperRef = ref(null)
const svgRef = ref(null)
let resizeObserver = null

// Ferramenta Ativa ('select' | 'node' | 'edge')
const currentTool = ref('select')

// Pan & Zoom
const baseScale = 12
const viewTransform = ref({ x: 0, y: 0, scale: 1 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, tx: 0, ty: 0 })

const svgDimensions = ref({ width: 800, height: 600 })
const svgCenter = computed(() => ({
  x: svgDimensions.value.width / 2,
  y: svgDimensions.value.height / 2
}))

// Arrasto de Vértice
const draggingNodeId = ref(null)
const dragStartWorld = ref({ x: 0, y: 0 })
const dragPointerStart = ref({ x: 0, y: 0 })

// Conexão em Andamento
const connectingSourceId = ref(null)
const rubberbandPointer = ref({ x: 0, y: 0 })
const hoveredNodeId = ref(null)
const snapTargetId = ref(null)

// Toasts e Notificações Rápidas
const toastMessage = ref('')
const toastType = ref('info')
let toastTimer = null

function showToast(msg, type = 'info', duration = 3000) {
  toastMessage.value = msg
  toastType.value = type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

// Inspector de Vértice Selecionado
const selectedVertex = computed(() => {
  if (!selectedVertexId.value) return null
  return graph.value.getVertex(selectedVertexId.value)
})

const vertexEditLabel = ref('')
watch(selectedVertex, (v) => {
  if (v) vertexEditLabel.value = v.label || v.id
})

function saveVertexLabel() {
  if (!selectedVertex.value) return
  const val = vertexEditLabel.value.trim()
  if (val) {
    updateVertex(selectedVertex.value.id, { label: val })
  }
}

function changeVertexType(type) {
  if (!selectedVertex.value) return
  updateVertex(selectedVertex.value.id, { type })
}

function getVertexDegree(vertexId) {
  return graph.value.getIncidentEdges(vertexId).length
}

function startConnectFromSelected() {
  if (!selectedVertex.value) return
  connectingSourceId.value = selectedVertex.value.id
  currentTool.value = 'edge'
}

function handleDuplicate() {
  if (!selectedVertex.value) return
  const res = duplicateVertex(selectedVertex.value.id)
  if (res && res.success) {
    showToast(`Vértice ${res.vertex.id} duplicado com sucesso!`, 'success')
    selectVertex(res.vertex.id)
  }
}

// Inspector de Aresta Selecionada
const selectedEdge = computed(() => {
  if (!selectedEdgeId.value) return null
  return graph.value.getEdge(selectedEdgeId.value)
})

const edgeEditWeight = ref(1)
watch(selectedEdge, (e) => {
  if (e) edgeEditWeight.value = e.weight
})

function saveEdgeWeight() {
  if (!selectedEdge.value) return
  updateEdge(selectedEdge.value.id, { weight: edgeEditWeight.value })
  showToast('Peso atualizado com sucesso!', 'success')
}

function handleInvertEdge() {
  if (!selectedEdge.value || !graph.value.directed) return
  const e = selectedEdge.value
  const oldSource = e.source
  const oldTarget = e.target
  const weight = e.weight
  removeEdge(e.id)
  addEdge({ source: oldTarget, target: oldSource, weight })
  showToast('Direção invertida com sucesso!', 'success')
}

// Edição de Peso Inline / Duplo Clique na Aresta
const editingEdgeWeightModal = ref(null)
const inlineWeightVal = ref(1)
const weightPopoverStyle = ref({})
const weightInputRef = ref(null)

function startEditWeight(e) {
  editingEdgeWeightModal.value = e
  inlineWeightVal.value = e.weight
  weightPopoverStyle.value = {
    left: `${(e.midX * viewTransform.value.scale) + viewTransform.value.x + svgCenter.value.x}px`,
    top: `${(e.midY * viewTransform.value.scale) + viewTransform.value.y + svgCenter.value.y}px`
  }
  nextTick(() => {
    if (weightInputRef.value) weightInputRef.value.focus()
  })
}

function confirmInlineWeight() {
  if (!editingEdgeWeightModal.value) return
  updateEdge(editingEdgeWeightModal.value.id, { weight: inlineWeightVal.value })
  editingEdgeWeightModal.value = null
  showToast('Peso da aresta alterado.', 'success')
}

// Conversão Coordenadas Tela <-> Modelo
function screenToWorld(sx, sy) {
  const wx = (sx - viewTransform.value.x - svgCenter.value.x) / (baseScale * viewTransform.value.scale)
  const wy = (sy - viewTransform.value.y - svgCenter.value.y) / (baseScale * viewTransform.value.scale)
  return { x: wx, y: wy }
}

function worldToScreen(wx, wy) {
  const sx = (wx * baseScale)
  const sy = (wy * baseScale)
  return { x: sx, y: sy }
}

// Listas de Renderização Otimizadas
const vertexRenderList = computed(() => {
  return graph.value.vertices.map(v => {
    const s = worldToScreen(v.x || 0, v.y || 0)
    return {
      ...v,
      screenX: s.x,
      screenY: s.y
    }
  })
})

const edgeRenderList = computed(() => {
  const vMap = new Map()
  vertexRenderList.value.forEach(v => vMap.set(v.id, v))

  return graph.value.edges.map(e => {
    const v1 = vMap.get(e.source)
    const v2 = vMap.get(e.target)
    if (!v1 || !v2) return null

    // Cálculo dos pontos de interseção na borda dos nós (raio = 20px)
    const dx = v2.screenX - v1.screenX
    const dy = v2.screenY - v1.screenY
    const dist = Math.hypot(dx, dy) || 1

    const radius = 20
    const x1 = v1.screenX + (dx / dist) * radius
    const y1 = v1.screenY + (dy / dist) * radius
    const x2 = v2.screenX - (dx / dist) * (graph.value.directed ? radius + 4 : radius)
    const y2 = v2.screenY - (dy / dist) * (graph.value.directed ? radius + 4 : radius)

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
      x1,
      y1,
      x2,
      y2,
      midX: (v1.screenX + v2.screenX) / 2,
      midY: (v1.screenY + v2.screenY) / 2
    }
  }).filter(Boolean)
})

const connectingSourceNode = computed(() => {
  if (!connectingSourceId.value) return null
  return vertexRenderList.value.find(v => v.id === connectingSourceId.value) || null
})

const rubberbandTarget = computed(() => {
  if (!connectingSourceId.value) return null
  return rubberbandPointer.value
})

// Ferramentas & Interações
function setTool(tool) {
  currentTool.value = tool
  if (tool !== 'edge') {
    connectingSourceId.value = null
  }
}

function handleNodeMouseEnter(v) {
  hoveredNodeId.value = v.id
  if (connectingSourceId.value && connectingSourceId.value !== v.id) {
    snapTargetId.value = v.id
  }
}

function handleNodeMouseLeave() {
  hoveredNodeId.value = null
  snapTargetId.value = null
}

function handleNodeClick(v) {
  if (currentTool.value === 'edge' || connectingSourceId.value) {
    if (!connectingSourceId.value) {
      connectingSourceId.value = v.id
    } else if (connectingSourceId.value !== v.id) {
      finishConnection(connectingSourceId.value, v.id)
    }
  } else {
    selectVertex(v.id)
  }
}

function handleNodePointerDown(e, v) {
  if (currentTool.value === 'edge') return
  draggingNodeId.value = v.id
  dragStartWorld.value = { x: v.x || 0, y: v.y || 0 }
  dragPointerStart.value = { x: e.clientX, y: e.clientY }
  selectVertex(v.id)
}

function startQuickConnect(v) {
  connectingSourceId.value = v.id
  currentTool.value = 'edge'
}

function finishConnection(sourceId, targetId) {
  try {
    const res = addEdge({
      source: sourceId,
      target: targetId,
      weight: graph.value.weighted ? 1 : 1
    })
    if (res && res.success) {
      showToast(`Conexão (${sourceId} ➔ ${targetId}) criada com sucesso!`, 'success')
      selectEdge(res.edge.id)
    } else if (res && res.error) {
      showToast(res.error, 'error')
    }
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    connectingSourceId.value = null
    snapTargetId.value = null
    if (currentTool.value === 'edge') {
      currentTool.value = 'select'
    }
  }
}

function handleSelectEdge(edgeId) {
  selectEdge(edgeId)
}

function handleSvgPointerDown(e) {
  if (e.target.closest('.node-group') || e.target.closest('.edge-group')) return

  if (currentTool.value === 'node') {
    // Cria vértice imediatamente no ponto clicado
    const rect = svgRef.value.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)
    createVertexAt(world.x, world.y)
    return
  }

  // Pan na tela
  isPanning.value = true
  panStart.value = {
    x: e.clientX,
    y: e.clientY,
    tx: viewTransform.value.x,
    ty: viewTransform.value.y
  }
  selectVertex(null)
  selectEdge(null)
}

function handleSvgPointerMove(e) {
  const rect = svgRef.value.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top

  // Atualiza cursor de linha elástica
  if (connectingSourceId.value) {
    rubberbandPointer.value = {
      x: (sx - viewTransform.value.x - svgCenter.value.x) / viewTransform.value.scale,
      y: (sy - viewTransform.value.y - svgCenter.value.y) / viewTransform.value.scale
    }
  }

  // Arrastando vértice
  if (draggingNodeId.value) {
    const dx = (e.clientX - dragPointerStart.value.x) / (baseScale * viewTransform.value.scale)
    const dy = (e.clientY - dragPointerStart.value.y) / (baseScale * viewTransform.value.scale)
    const newX = dragStartWorld.value.x + dx
    const newY = dragStartWorld.value.y + dy
    moveVertex(draggingNodeId.value, newX, newY, 0, false)
    return
  }

  // Panning do canvas
  if (isPanning.value) {
    const dx = e.clientX - panStart.value.x
    const dy = e.clientY - panStart.value.y
    viewTransform.value.x = panStart.value.tx + dx
    viewTransform.value.y = panStart.value.ty + dy
  }
}

function handleSvgPointerUp() {
  if (draggingNodeId.value) {
    // Salva snapshot após soltar o nó
    const v = graph.value.getVertex(draggingNodeId.value)
    if (v) {
      moveVertex(v.id, v.x, v.y, v.z, true)
    }
    draggingNodeId.value = null
  }
  isPanning.value = false
}

function handleSvgDoubleClick(e) {
  if (e.target.closest('.node-group') || e.target.closest('.edge-group')) return
  const rect = svgRef.value.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const world = screenToWorld(sx, sy)
  createVertexAt(world.x, world.y)
}

function createVertexAt(wx, wy) {
  const id = generateNextVertexId()
  const res = addVertex({
    id,
    label: `Vértice ${id}`,
    x: Number(wx.toFixed(1)),
    y: Number(wy.toFixed(1)),
    z: 0,
    type: 'standard'
  })
  if (res && res.success) {
    showToast(`Vértice ${id} adicionado!`, 'success')
    selectVertex(id)
  }
}

function handleWheel(e) {
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
  const newScale = Math.min(Math.max(viewTransform.value.scale * zoomFactor, 0.35), 3.0)
  viewTransform.value.scale = Number(newScale.toFixed(2))
}

function zoomIn() {
  viewTransform.value.scale = Math.min(viewTransform.value.scale * 1.2, 3.0)
}

function zoomOut() {
  viewTransform.value.scale = Math.max(viewTransform.value.scale * 0.8, 0.35)
}

function fitView() {
  if (graph.value.vertices.length === 0) {
    viewTransform.value = { x: 0, y: 0, scale: 1 }
    return
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  graph.value.vertices.forEach(v => {
    const s = worldToScreen(v.x || 0, v.y || 0)
    minX = Math.min(minX, s.x)
    maxX = Math.max(maxX, s.x)
    minY = Math.min(minY, s.y)
    maxY = Math.max(maxY, s.y)
  })

  const w = maxX - minX || 200
  const h = maxY - minY || 200
  const scaleX = (svgDimensions.value.width * 0.75) / w
  const scaleY = (svgDimensions.value.height * 0.75) / h
  const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.6)

  const midX = (minX + maxX) / 2
  const midY = (minY + maxY) / 2

  viewTransform.value = {
    x: -midX * newScale,
    y: -midY * newScale,
    scale: Number(newScale.toFixed(2))
  }
}

function runForceLayout() {
  applyForceLayout3D(graph.value, 80)
  showToast('Nós rearranjados com simulação física!', 'success')
}

function handleDeleteSelected() {
  if (selectedVertexId.value) {
    const id = selectedVertexId.value
    removeVertex(id)
    showToast(`Vértice "${id}" removido.`, 'info')
  } else if (selectedEdgeId.value) {
    const id = selectedEdgeId.value
    removeEdge(id)
    showToast(`Conexão removida.`, 'info')
  }
}

function handleClearGraph() {
  if (confirm('Deseja realmente limpar todos os vértices e arestas da área de trabalho?')) {
    clearGraph()
    showToast('Grafo completamente limpo.', 'info')
  }
}

// Atalhos de Teclado
function handleKeyDown(e) {
  // Ignora se estiver digitando em campo de formulário
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

  if (e.key === 'v' || e.key === 'V') {
    setTool('select')
  } else if (e.key === 'n' || e.key === 'N') {
    setTool('node')
  } else if (e.key === 'e' || e.key === 'E') {
    setTool('edge')
  } else if (e.key === 'Escape') {
    if (connectingSourceId.value) {
      connectingSourceId.value = null
      snapTargetId.value = null
    } else {
      selectVertex(null)
      selectEdge(null)
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    handleDeleteSelected()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
    redo()
  }
}

function updateDimensions() {
  if (wrapperRef.value) {
    svgDimensions.value = {
      width: wrapperRef.value.clientWidth || 800,
      height: wrapperRef.value.clientHeight || 600
    }
  }
}

function getTypeBadge(type) {
  switch (type) {
    case 'hub': return 'badge-amber'
    case 'datacenter': return 'badge-purple'
    case 'sensor': return 'badge-green'
    default: return 'badge-blue'
  }
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
  window.addEventListener('keydown', handleKeyDown)
  if (wrapperRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })
    resizeObserver.observe(wrapperRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', updateDimensions)
  window.removeEventListener('keydown', handleKeyDown)
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.visual-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-surface);
  user-select: none;
}

/* Barra de Ferramentas Flutuante Superior */
.floating-toolbar {
  position: absolute;
  top: var(--spacing-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-lg);
  background: var(--bg-surface-glass, rgba(255, 255, 255, 0.92));
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-md);
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: var(--border-subtle);
  margin: 0 0.15rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tool-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.tool-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.tool-kbd {
  font-size: 0.65rem;
  opacity: 0.7;
  padding: 0.1rem 0.3rem;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}

.tool-btn.active .tool-kbd {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.tool-icon-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tool-icon-btn:hover:not(:disabled) {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.tool-icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tool-btn.danger {
  color: var(--color-danger);
}

.tool-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.tool-icon-btn.danger-hover:hover {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

/* Dica de Ação no Topo */
.canvas-hint-banner {
  position: absolute;
  top: 4.8rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  pointer-events: none;
  animation: fadeIn 0.15s ease-out;
}

/* Toast de Alerta */
.canvas-toast {
  position: absolute;
  bottom: var(--spacing-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-lg);
}

.canvas-toast.success {
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.canvas-toast.error {
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.canvas-toast.info {
  border-color: rgba(79, 99, 246, 0.4);
  color: var(--color-primary);
}

/* SVG Canvas */
.visual-svg-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: default;
}

.visual-svg-canvas.tool-node {
  cursor: crosshair;
}

.visual-svg-canvas.tool-edge {
  cursor: pointer;
}

.visual-svg-canvas.is-panning {
  cursor: grabbing;
}

.grid-dot {
  fill: var(--border-subtle);
  opacity: 0.85;
}

/* Arestas */
.edge-hitbox {
  stroke: transparent;
  stroke-width: 18;
  cursor: pointer;
}

.edge-hover-halo {
  stroke: var(--text-primary);
  stroke-opacity: 0;
  stroke-width: 10;
  stroke-linecap: round;
  pointer-events: none;
  transition: stroke-opacity var(--transition-fast);
}

.edge-group:hover:not(.is-selected) .edge-hover-halo {
  stroke-opacity: 0.1;
}

.edge-selection-casing {
  stroke: var(--text-primary);
  stroke-opacity: 0.6;
  stroke-width: 9.5;
  stroke-dasharray: 6 4;
  stroke-linecap: round;
  pointer-events: none;
  animation: dash 1.2s linear infinite;
}

.edge-selection-gap {
  stroke: var(--bg-surface);
  stroke-width: 5.5;
  stroke-linecap: round;
  pointer-events: none;
}

.edge-line {
  stroke: var(--text-muted);
  stroke-width: 2;
  stroke-linecap: round;
  cursor: pointer;
}

.arrow-head {
  fill: var(--text-muted);
}

.arrow-head-selected {
  fill: var(--color-primary);
}

.weight-badge-selection-ring {
  fill: none;
  stroke: var(--text-primary);
  stroke-opacity: 0.72;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
  pointer-events: none;
}

.unweighted-selection-reticle {
  fill: var(--bg-surface);
  fill-opacity: 0.85;
  stroke: var(--text-primary);
  stroke-opacity: 0.75;
  stroke-width: 1.5;
  stroke-dasharray: 3 2;
  pointer-events: none;
}

.weight-badge-rect {
  fill: var(--bg-surface);
  stroke: var(--border-subtle);
  stroke-width: 1.2;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.weight-badge-text {
  font-size: 10px;
  font-weight: 700;
  fill: var(--text-primary);
  pointer-events: none;
}

.rubberband-line {
  stroke: var(--color-primary);
  stroke-width: 2.5;
  stroke-dasharray: 5 4;
  pointer-events: none;
  animation: dash 1s linear infinite;
}

/* Vértices */
.node-group {
  cursor: grab;
}

.node-group:active {
  cursor: grabbing;
}

.node-circle {
  stroke: var(--bg-surface);
  stroke-width: 2.5;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.12));
  transition: transform var(--transition-fast), fill var(--transition-fast);
}

.node-circle.node-type-standard {
  fill: #4f63f6;
}

.node-circle.node-type-hub {
  fill: #f59e0b;
}

.node-circle.node-type-datacenter {
  fill: #8b5cf6;
}

.node-circle.node-type-sensor {
  fill: #10b981;
}

.node-halo {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2.5;
  opacity: 0.6;
  animation: pulseHalo 1.4s ease-out infinite;
}

.node-halo.snap {
  stroke: #10b981;
  stroke-width: 3.5;
}

.node-halo.source {
  stroke: #f59e0b;
}

.node-id-text {
  fill: #ffffff;
  font-size: 11px;
  pointer-events: none;
}

.node-label-text {
  fill: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
}

.quick-connect-handle {
  cursor: crosshair;
}

.handle-circle {
  fill: var(--color-primary);
  stroke: #ffffff;
  stroke-width: 2;
}

.handle-icon {
  width: 8px;
  height: 8px;
  color: #ffffff;
  pointer-events: none;
}

/* Painel Contextual Flutuante (Inspector) */
.context-inspector {
  position: absolute;
  top: 5.2rem;
  right: var(--spacing-4);
  width: 250px;
  z-index: 25;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-glass, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.inspector-header {
  padding: 0.65rem 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-subtle);
}

.inspector-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.inspector-title {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.inspector-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: var(--radius-sm);
}

.inspector-close:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.inspector-body {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.form-group-sm {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.inspector-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.type-pill-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem;
}

.type-pill {
  padding: 0.25rem 0;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.type-pill.active {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.type-pill.active.hub {
  background: #f59e0b;
  border-color: #f59e0b;
}

.type-pill.active.datacenter {
  background: #8b5cf6;
  border-color: #8b5cf6;
}

.type-pill.active.sensor {
  background: #10b981;
  border-color: #10b981;
}

.inspector-stats-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
}

.inspector-actions {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.weight-input-row {
  display: flex;
  gap: 0.35rem;
}

.full-width {
  width: 100%;
}

/* Popover de Peso Inline */
.inline-weight-popover {
  position: absolute;
  transform: translate(-50%, -120%);
  z-index: 40;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 130px;
}

.popover-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.popover-btns {
  display: flex;
  gap: 0.25rem;
}

@keyframes pulseHalo {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.8;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: -18;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(12px);
  opacity: 0;
}
</style>
