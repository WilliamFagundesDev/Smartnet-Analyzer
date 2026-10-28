<template>
  <div class="classic-editor-container custom-scroll">
    <!-- Barra Superior de Estatísticas e Filtros -->
    <div class="classic-controls-bar card-elevated">
      <div class="search-input-wrapper">
        <Search class="icon-xs search-icon" />
        <input
          type="text"
          v-model="searchQuery"
          class="input-control input-sm search-field"
          placeholder="Filtrar vértices ou arestas..."
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
          <X class="icon-xs" />
        </button>
      </div>

      <div class="stats-pills">
        <span class="badge badge-blue font-mono font-bold">{{ filteredVertices.length }} Vértices</span>
        <span class="badge badge-purple font-mono font-bold">{{ filteredEdges.length }} Conexões</span>
      </div>

      <div class="header-action-btns">
        <button class="btn btn-primary btn-sm" @click="isAddVertexOpen = true">
          <Plus class="icon-xs" />
          <span>Novo Vértice</span>
        </button>
        <button
          class="btn btn-secondary btn-sm"
          @click="isAddEdgeOpen = true"
          :disabled="graph.vertices.length < 2"
        >
          <Plus class="icon-xs" />
          <span>Nova Conexão</span>
        </button>
      </div>
    </div>

    <!-- Grid de Listas: Vértices e Conexões Estruturadas -->
    <div class="classic-grid">
      <!-- Coluna de Vértices -->
      <div class="classic-card card-elevated">
        <div class="classic-card-header">
          <div class="header-title-box">
            <h3 class="card-title">Vértices da Rede</h3>
            <span class="card-subtitle">Entidades e nós computacionais cadastrados</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Rótulo / Nome</th>
                <th>Tipo</th>
                <th>Posição 3D</th>
                <th class="text-right" style="width: 90px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredVertices.length === 0">
                <td colspan="5" class="empty-cell">Nenhum vértice encontrado.</td>
              </tr>
              <tr v-for="v in filteredVertices" :key="v.id">
                <td class="font-mono text-primary font-bold">{{ v.id }}</td>
                <td class="font-bold">{{ v.label }}</td>
                <td>
                  <span class="badge" :class="getTypeBadge(v.type)">{{ v.type }}</span>
                </td>
                <td class="font-mono text-muted text-xs">
                  ({{ v.x }}, {{ v.y }}, {{ v.z || 0 }})
                </td>
                <td class="text-right actions-cell">
                  <button class="icon-action-btn" @click="openEditVertex(v)" title="Editar Vértice">
                    <Edit3 class="icon-xs" />
                  </button>
                  <button class="icon-action-btn danger" @click="handleRemoveVertex(v.id)" title="Remover Vértice">
                    <Trash2 class="icon-xs" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Coluna de Conexões -->
      <div class="classic-card card-elevated">
        <div class="classic-card-header">
          <div class="header-title-box">
            <h3 class="card-title">Conexões / Arestas</h3>
            <span class="card-subtitle">Enlaces de comunicação e custos associados</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Origem</th>
                <th>Direção</th>
                <th>Destino</th>
                <th v-if="graph.weighted">Peso</th>
                <th class="text-right" style="width: 90px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredEdges.length === 0">
                <td :colspan="graph.weighted ? 5 : 4" class="empty-cell">Nenhuma conexão cadastrada.</td>
              </tr>
              <tr v-for="e in filteredEdges" :key="e.id">
                <td class="font-mono text-primary font-bold">{{ e.source }}</td>
                <td class="font-mono text-muted">{{ graph.directed ? '➔' : '↔' }}</td>
                <td class="font-mono text-primary font-bold">{{ e.target }}</td>
                <td v-if="graph.weighted" class="font-mono font-bold text-green">
                  {{ e.weight }}
                </td>
                <td class="text-right actions-cell">
                  <button class="icon-action-btn" @click="openEditEdge(e)" title="Editar Conexão">
                    <Edit3 class="icon-xs" />
                  </button>
                  <button class="icon-action-btn danger" @click="handleRemoveEdge(e.id)" title="Remover Conexão">
                    <Trash2 class="icon-xs" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modais Reutilizáveis Existentes para Formulário Estruturado -->
    <VertexFormModal
      :isOpen="isAddVertexOpen || !!editingVertex"
      :vertexToEdit="editingVertex"
      @close="closeVertexModal"
    />

    <EdgeFormModal
      :isOpen="isAddEdgeOpen || !!editingEdge"
      :edgeToEdit="editingEdge"
      @close="closeEdgeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, X, Plus, Edit3, Trash2 } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import VertexFormModal from './VertexFormModal.vue'
import EdgeFormModal from './EdgeFormModal.vue'

const { graph, removeVertex, removeEdge } = useGraph()

const searchQuery = ref('')

const isAddVertexOpen = ref(false)
const editingVertex = ref(null)
const isAddEdgeOpen = ref(false)
const editingEdge = ref(null)

const filteredVertices = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return graph.value.vertices
  return graph.value.vertices.filter(v =>
    v.id.toLowerCase().includes(q) ||
    (v.label && v.label.toLowerCase().includes(q)) ||
    (v.type && v.type.toLowerCase().includes(q))
  )
})

const filteredEdges = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return graph.value.edges
  return graph.value.edges.filter(e =>
    e.source.toLowerCase().includes(q) ||
    e.target.toLowerCase().includes(q) ||
    String(e.weight).includes(q)
  )
})

function openEditVertex(v) {
  editingVertex.value = v
}

function closeVertexModal() {
  isAddVertexOpen.value = false
  editingVertex.value = null
}

function openEditEdge(e) {
  editingEdge.value = e
}

function closeEdgeModal() {
  isAddEdgeOpen.value = false
  editingEdge.value = null
}

function handleRemoveVertex(id) {
  if (confirm(`Remover vértice "${id}" e suas conexões?`)) {
    removeVertex(id)
  }
}

function handleRemoveEdge(id) {
  if (confirm('Remover esta conexão?')) {
    removeEdge(id)
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
</script>

<style scoped>
.classic-editor-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-4);
}

.classic-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  color: var(--text-muted);
  pointer-events: none;
}

.search-field {
  padding-left: 2rem;
  padding-right: 1.8rem;
  width: 100%;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.stats-pills {
  display: flex;
  gap: var(--spacing-2);
}

.header-action-btns {
  display: flex;
  gap: var(--spacing-2);
}

.classic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
  flex: 1;
}

@media (max-width: 900px) {
  .classic-grid {
    grid-template-columns: 1fr;
  }
}

.classic-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  overflow: hidden;
  max-height: 580px;
}

.classic-card-header {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-subtle);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
}

.card-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.table-responsive {
  overflow-y: auto;
  flex: 1;
}

.empty-cell {
  text-align: center;
  padding: var(--spacing-6);
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}
</style>
