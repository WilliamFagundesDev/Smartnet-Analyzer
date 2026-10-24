<template>
  <div class="view-container editor-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">EDITOR ESTATAL DE GRAFOS</h1>
        <p class="view-subtitle">Gerencie vértices, arestas, atributos topológicos e configure os parâmetros da rede</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary btn-sm" @click="isImportExportOpen = true">
          <FileJson class="icon-xs" />
          <span>Importar / Exportar JSON</span>
        </button>
        <button class="btn btn-danger btn-sm" @click="handleClearGraph">
          <Trash2 class="icon-xs" />
          <span>Limpar Grafo</span>
        </button>
      </div>
    </div>

    <!-- Barra de Configurações Gerais do Grafo -->
    <div class="config-bar glass-panel">
      <div class="config-col name-col">
        <label class="config-label">NOME DA REDE / GRAFO:</label>
        <input
          v-model="graphName"
          @blur="updateName"
          @keyup.enter="updateName"
          type="text"
          class="input-control"
          placeholder="Ex: Rede SmartCity Beta"
        />
      </div>

      <div class="config-col toggle-col">
        <label class="config-label">DIRECIONAMENTO:</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ active: !graph.directed }"
            @click="setDirected(false)"
          >
            Não-Direcionado (u &harr; v)
          </button>
          <button
            class="toggle-btn"
            :class="{ active: graph.directed }"
            @click="setDirected(true)"
          >
            Direcionado (u &rarr; v)
          </button>
        </div>
      </div>

      <div class="config-col toggle-col">
        <label class="config-label">PONDERAÇÃO DAS ARESTAS:</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ active: graph.weighted }"
            @click="setWeighted(true)"
          >
            Ponderado (Com Pesos)
          </button>
          <button
            class="toggle-btn"
            :class="{ active: !graph.weighted }"
            @click="setWeighted(false)"
          >
            Não-Ponderado (Peso 1)
          </button>
        </div>
      </div>
    </div>

    <!-- Alertas de Validação Estrutural -->
    <div v-if="validation && (!validation.isValid || validation.warnings.length > 0)" class="validation-banner">
      <div v-for="err in validation.errors" :key="err" class="alert-line text-red">
        <AlertTriangle class="icon-xs" />
        <span>{{ err }}</span>
      </div>
      <div v-for="warn in validation.warnings" :key="warn" class="alert-line text-amber">
        <Info class="icon-xs" />
        <span>{{ warn }}</span>
      </div>
    </div>

    <!-- Tabelas Divididas: Vértices à esquerda, Arestas à direita -->
    <div class="tables-grid">
      <!-- Painel de Vértices -->
      <div class="table-card card-elevated">
        <div class="table-card-header">
          <div class="header-left">
            <h3 class="table-card-title">VÉRTICES CADASTRADOS ({{ graph.vertices.length }})</h3>
          </div>
          <button class="btn btn-primary btn-sm" @click="openAddVertexModal">
            <Plus class="icon-xs" />
            <span>Adicionar Vértice</span>
          </button>
        </div>

        <div class="table-scroll-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome / Rótulo</th>
                <th>Tipo</th>
                <th>Posição (X, Y, Z)</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="graph.vertices.length === 0">
                <td colspan="5" class="empty-cell">Nenhum vértice inserido no grafo.</td>
              </tr>
              <tr v-for="v in graph.vertices" :key="v.id">
                <td class="font-mono text-blue"><strong>{{ v.id }}</strong></td>
                <td>{{ v.label }}</td>
                <td>
                  <span class="badge" :class="getTypeBadge(v.type)">{{ v.type }}</span>
                </td>
                <td class="font-mono text-muted">
                  ({{ v.x }}, {{ v.y }}, {{ v.z }})
                </td>
                <td class="text-right actions-cell">
                  <button class="icon-action-btn" @click="openEditVertexModal(v)" title="Editar Vértice">
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

      <!-- Painel de Arestas -->
      <div class="table-card card-elevated">
        <div class="table-card-header">
          <div class="header-left">
            <h3 class="table-card-title">ARESTAS / CONEXÕES ({{ graph.edges.length }})</h3>
          </div>
          <button
            class="btn btn-primary btn-sm"
            @click="openAddEdgeModal"
            :disabled="graph.vertices.length < 2"
          >
            <Plus class="icon-xs" />
            <span>Adicionar Conexão</span>
          </button>
        </div>

        <div class="table-scroll-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Origem</th>
                <th>Direção</th>
                <th>Destino</th>
                <th v-if="graph.weighted">Peso</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="graph.edges.length === 0">
                <td :colspan="graph.weighted ? 5 : 4" class="empty-cell">
                  Nenhuma conexão cadastrada no grafo.
                </td>
              </tr>
              <tr v-for="e in graph.edges" :key="e.id">
                <td class="font-mono text-blue"><strong>{{ e.source }}</strong></td>
                <td class="font-mono text-muted">{{ graph.directed ? '➔' : '&harr;' }}</td>
                <td class="font-mono text-blue"><strong>{{ e.target }}</strong></td>
                <td v-if="graph.weighted" class="font-mono font-bold text-green">
                  {{ e.weight }}
                </td>
                <td class="text-right actions-cell">
                  <button class="icon-action-btn" @click="openEditEdgeModal(e)" title="Editar Conexão">
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

    <!-- Modais do Editor -->
    <VertexFormModal
      :isOpen="isVertexModalOpen"
      :vertexToEdit="vertexToEdit"
      @close="isVertexModalOpen = false"
    />

    <EdgeFormModal
      :isOpen="isEdgeModalOpen"
      :edgeToEdit="edgeToEdit"
      @close="isEdgeModalOpen = false"
    />

    <ImportExportModal
      :isOpen="isImportExportOpen"
      @close="isImportExportOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  FileJson,
  Trash2,
  Plus,
  Edit3,
  AlertTriangle,
  Info
} from 'lucide-vue-next'
import { useGraph } from '../composables/useGraph.js'
import VertexFormModal from '../components/editor/VertexFormModal.vue'
import EdgeFormModal from '../components/editor/EdgeFormModal.vue'
import ImportExportModal from '../components/editor/ImportExportModal.vue'

const {
  graph,
  validation,
  setDirected,
  setWeighted,
  setName,
  clearGraph,
  removeVertex,
  removeEdge
} = useGraph()

const graphName = ref(graph.value.name)
watch(() => graph.value.name, (val) => { graphName.value = val })

function updateName() {
  if (graphName.value.trim()) {
    setName(graphName.value.trim())
  }
}

// Modais
const isVertexModalOpen = ref(false)
const vertexToEdit = ref(null)
const isEdgeModalOpen = ref(false)
const edgeToEdit = ref(null)
const isImportExportOpen = ref(false)

function openAddVertexModal() {
  vertexToEdit.value = null
  isVertexModalOpen.value = true
}

function openEditVertexModal(v) {
  vertexToEdit.value = v
  isVertexModalOpen.value = true
}

function handleRemoveVertex(id) {
  if (confirm(`Deseja realmente remover o vértice "${id}" e todas as suas conexões?`)) {
    removeVertex(id)
  }
}

function openAddEdgeModal() {
  edgeToEdit.value = null
  isEdgeModalOpen.value = true
}

function openEditEdgeModal(e) {
  edgeToEdit.value = e
  isEdgeModalOpen.value = true
}

function handleRemoveEdge(id) {
  if (confirm(`Deseja realmente remover esta conexão?`)) {
    removeEdge(id)
  }
}

function handleClearGraph() {
  if (confirm('ATENÇÃO: Deseja realmente limpar todos os vértices e arestas do grafo atual?')) {
    clearGraph()
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
.editor-view {
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

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.config-bar {
  padding: var(--spacing-4);
  display: flex;
  gap: var(--spacing-5);
  flex-wrap: wrap;
  align-items: center;
}

.config-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.name-col {
  flex: 1;
  min-width: 240px;
}

.config-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.toggle-group {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-btn {
  padding: 0.45rem 0.8rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 0;
}

.toggle-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

.validation-banner {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.alert-line {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-xs);
}

.tables-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
  flex: 1;
  min-height: 440px;
}

.table-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-surface);
}

.table-card-header {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card-title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.table-scroll-container {
  flex: 1;
  overflow-y: auto;
  max-height: 480px;
}

.empty-cell {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: var(--spacing-6) !important;
}

.text-right {
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-1);
}

.icon-action-btn {
  padding: 0.3rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.icon-action-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.icon-action-btn.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }

@media (max-width: 960px) {
  .tables-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .editor-view {
    padding: var(--spacing-3);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
    gap: var(--spacing-3);
  }

  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .header-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .config-bar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
  }

  .config-col {
    width: 100%;
  }

  .toggle-group {
    display: flex;
    width: 100%;
  }

  .toggle-btn {
    flex: 1;
    font-size: 0.68rem;
    padding: 0.4rem 0.2rem;
    text-align: center;
  }
}
</style>
