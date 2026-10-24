<template>
  <div v-if="selectedVertex" class="vertex-details-panel glass-panel">
    <div class="panel-header">
      <div class="header-title-group">
        <span class="badge badge-blue">{{ selectedVertex.type.toUpperCase() }}</span>
        <h4 class="vertex-title">{{ selectedVertex.id }} &middot; {{ selectedVertex.label }}</h4>
      </div>
      <button class="close-btn" @click="close" title="Fechar painel">
        <X class="icon-sm" />
      </button>
    </div>

    <div class="panel-body">
      <div class="detail-row">
        <span class="detail-label">Identificador:</span>
        <span class="detail-val font-mono">{{ selectedVertex.id }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nome / Rótulo:</span>
        <span class="detail-val">{{ selectedVertex.label }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Posição 3D:</span>
        <span class="detail-val font-mono">
          ({{ selectedVertex.x }}, {{ selectedVertex.y }}, {{ selectedVertex.z }})
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Conexões Incidentes:</span>
        <span class="detail-val font-mono text-blue">{{ incidentEdges.length }}</span>
      </div>

      <div class="incident-section">
        <div class="section-title">VIZINHOS CONECTADOS:</div>
        <div v-if="incidentEdges.length === 0" class="empty-subtext">
          Vértice isolado (sem conexões ativas).
        </div>
        <div v-else class="incident-list">
          <div v-for="e in incidentEdges" :key="e.id" class="incident-item">
            <span class="edge-nodes font-mono">
              {{ e.source === selectedVertex.id ? `➔ ${e.target}` : `⬅ ${e.source}` }}
            </span>
            <span class="edge-weight badge badge-purple">
              Peso: {{ e.weight }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <button class="btn btn-secondary btn-sm" @click="$emit('edit', selectedVertex)">
        <Edit3 class="icon-xs" />
        <span>Editar</span>
      </button>
      <button class="btn btn-danger btn-sm" @click="handleRemove">
        <Trash2 class="icon-xs" />
        <span>Remover</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X, Edit3, Trash2 } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'

const emit = defineEmits(['close', 'edit'])
const { graph, selectedVertexId, removeVertex } = useGraph()

const selectedVertex = computed(() => {
  if (!selectedVertexId.value) return null
  return graph.value.getVertex(selectedVertexId.value)
})

const incidentEdges = computed(() => {
  if (!selectedVertex.value) return []
  return graph.value.getIncidentEdges(selectedVertex.value.id)
})

function close() {
  selectedVertexId.value = null
  emit('close')
}

function handleRemove() {
  if (!selectedVertex.value) return
  if (confirm(`Deseja realmente remover o vértice "${selectedVertex.value.id}" e todas as suas arestas incidentes?`)) {
    removeVertex(selectedVertex.value.id)
  }
}
</script>

<style scoped>
.vertex-details-panel {
  position: absolute;
  top: 70px;
  right: var(--spacing-4);
  width: 310px;
  padding: var(--spacing-4);
  z-index: 30;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vertex-title {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.close-btn {
  color: var(--text-muted);
  padding: 0.2rem;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  font-size: var(--text-xs);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: var(--text-muted);
}

.detail-val {
  color: var(--text-primary);
  font-weight: 500;
}

.incident-section {
  margin-top: var(--spacing-2);
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--spacing-2);
}

.section-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
  letter-spacing: 0.05em;
}

.empty-subtext {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.75rem;
}

.incident-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 120px;
  overflow-y: auto;
}

.incident-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.25rem 0.45rem;
  border-radius: var(--radius-sm);
}

.edge-nodes {
  color: var(--text-primary);
  font-weight: 600;
}

.edge-weight {
  font-size: 0.65rem;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--spacing-3);
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: var(--text-xs);
}

.icon-xs {
  width: 13px;
  height: 13px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}
</style>
