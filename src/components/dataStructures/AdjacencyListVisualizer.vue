<template>
  <div class="adj-list-container glass-panel">
    <div class="viz-header">
      <div>
        <h3 class="viz-title">LISTA DE ADJACÊNCIA (ESTRUTURA EM MEMÓRIA)</h3>
        <p class="viz-subtitle">
          Complexidade de Espaço: <strong class="text-blue">O(V + E)</strong> &middot; Iteração de Vizinhos: <strong class="text-blue">O(grau(v))</strong>
        </p>
      </div>
      <div class="badge-group">
        <span class="badge" :class="graph.directed ? 'badge-purple' : 'badge-blue'">
          {{ graph.directed ? 'Orientada u ➔ v' : 'Bidirecional Simétrica' }}
        </span>
      </div>
    </div>

    <div v-if="inspectionData.length === 0" class="empty-list">
      O grafo está vazio. Nenhum vértice registrado na lista de adjacência.
    </div>

    <div v-else class="list-entries">
      <div
        v-for="entry in inspectionData"
        :key="entry.vertex"
        class="vertex-list-row"
        :class="{ active: selectedVertexId === entry.vertex }"
        @click="selectVertex(entry.vertex)"
      >
        <div class="vertex-key font-mono">
          <span class="key-id">{{ entry.vertex }}</span>
          <span class="key-label">{{ graph.getVertex(entry.vertex)?.label }}</span>
        </div>

        <div class="pointer-arrow font-mono">➔</div>

        <div class="neighbors-chain">
          <div v-if="entry.neighbors.length === 0" class="isolated-badge font-mono">
            [NULL / ISOLADO]
          </div>

          <div
            v-for="(n, idx) in entry.neighbors"
            :key="`${n.vertex}-${idx}`"
            class="neighbor-node font-mono"
          >
            <span class="target-id">{{ n.vertex }}</span>
            <span class="edge-weight-tag" v-if="graph.weighted">
              p: {{ n.weight }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGraph } from '../../composables/useGraph.js'

const { graph, adjacencyList, selectedVertexId, selectVertex } = useGraph()

const inspectionData = computed(() => {
  if (!adjacencyList.value) return []
  return adjacencyList.value.toInspectionData()
})
</script>

<style scoped>
.adj-list-container {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  background: var(--bg-surface);
}

.viz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-3);
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.viz-title {
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.viz-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.empty-list {
  color: var(--text-muted);
  font-style: italic;
  padding: var(--spacing-6);
  text-align: center;
  font-size: var(--text-xs);
}

.list-entries {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  max-height: 480px;
  overflow-y: auto;
}

.vertex-list-row {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.8rem;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.vertex-list-row:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-light);
}

.vertex-list-row.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.vertex-key {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 140px;
}

.key-id {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.key-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.pointer-arrow {
  color: var(--text-muted);
  margin: 0 var(--spacing-3);
  font-size: var(--text-sm);
}

.neighbors-chain {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.isolated-badge {
  color: var(--text-muted);
  font-size: 0.72rem;
  font-style: italic;
}

.neighbor-node {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-xs);
}

.target-id {
  color: var(--text-primary);
  font-weight: 700;
}

.edge-weight-tag {
  background: rgba(0, 0, 0, 0.25);
  color: var(--color-success);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 600;
}

.text-blue {
  color: var(--color-primary);
}
</style>
