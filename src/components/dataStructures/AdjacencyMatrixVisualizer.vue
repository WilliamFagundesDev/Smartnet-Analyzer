<template>
  <div class="adj-matrix-container glass-panel">
    <div class="viz-header">
      <div>
        <h3 class="viz-title">MATRIZ DE ADJACÊNCIA (REPRESENTAÇÃO BIDIMENSIONAL V &times; V)</h3>
        <p class="viz-subtitle">
          Complexidade de Espaço: <strong class="text-purple">O(V²)</strong> &middot; Consulta de Conexão M[u][v]: <strong class="text-green">O(1)</strong>
        </p>
      </div>

      <div class="matrix-legend">
        <span class="legend-chip"><span class="box-sample diag"></span> Diagonal (0)</span>
        <span class="legend-chip"><span class="box-sample edge"></span> Conexão Ativa (Peso)</span>
        <span class="legend-chip"><span class="box-sample none"></span> Ausência (null)</span>
      </div>
    </div>

    <div v-if="headers.length === 0" class="empty-matrix">
      O grafo está vazio. Nenhum vértice cadastrado para geração da matriz V &times; V.
    </div>

    <div v-else class="matrix-scroll-wrapper">
      <table class="matrix-table font-mono">
        <thead>
          <tr>
            <th class="corner-header">Origem \ Destino</th>
            <th
              v-for="h in headers"
              :key="h"
              class="col-header"
              :class="{ highlighted: hoveredCol === h }"
            >
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in gridData"
            :key="row.rowId"
            :class="{ highlighted: hoveredRow === row.rowId }"
          >
            <th class="row-header">
              {{ row.rowId }}
            </th>
            <td
              v-for="cell in row.cells"
              :key="`${row.rowId}-${cell.colId}`"
              class="matrix-cell"
              :class="{
                'cell-diagonal': cell.isDiagonal,
                'cell-connected': cell.hasConnection && !cell.isDiagonal,
                'cell-null': !cell.hasConnection && !cell.isDiagonal,
                'cell-hovered': hoveredRow === row.rowId && hoveredCol === cell.colId
              }"
              @mouseenter="setHover(row.rowId, cell.colId)"
              @mouseleave="clearHover"
              :title="getCellTooltip(row.rowId, cell.colId, cell.value, cell.isDiagonal)"
            >
              <span v-if="cell.value !== null" class="cell-val">
                {{ cell.value }}
              </span>
              <span v-else class="cell-null-sym">
                &mdash;
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="academic-convention-note">
      <strong>Convenção Matemática:</strong> A ausência de aresta é representada por <code>null</code> (&mdash;),
      distinguindo-se formalmente do peso <code>0</code> (distância nula a si próprio na diagonal ou conexão real de custo zero).
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGraph } from '../../composables/useGraph.js'

const { adjacencyMatrix } = useGraph()
const hoveredRow = ref(null)
const hoveredCol = ref(null)

const headers = computed(() => {
  if (!adjacencyMatrix.value) return []
  return adjacencyMatrix.value.getHeaders()
})

const gridData = computed(() => {
  if (!adjacencyMatrix.value) return []
  return adjacencyMatrix.value.toGridData()
})

function setHover(rowId, colId) {
  hoveredRow.value = rowId
  hoveredCol.value = colId
}

function clearHover() {
  hoveredRow.value = null
  hoveredCol.value = null
}

function getCellTooltip(row, col, value, isDiagonal) {
  if (isDiagonal) return `Diagonal: Vértice "${row}" para si mesmo (Distância 0)`
  if (value === null) return `Sem conexão entre "${row}" e "${col}" (null)`
  return `Conexão (${row} ➔ ${col}) com peso/custo ${value}`
}
</script>

<style scoped>
.adj-matrix-container {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
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

.matrix-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-size: var(--text-xs);
}

.legend-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-secondary);
}

.box-sample {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.box-sample.diag { background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; }
.box-sample.edge { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; }
.box-sample.none { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); }

.empty-matrix {
  color: var(--text-muted);
  font-style: italic;
  padding: var(--spacing-6);
  text-align: center;
  font-size: var(--text-xs);
}

.matrix-scroll-wrapper {
  max-width: 100%;
  max-height: 480px;
  overflow: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.matrix-table {
  border-collapse: collapse;
  text-align: center;
  font-size: var(--text-xs);
  margin: 0 auto;
}

.corner-header {
  background: var(--bg-subtle);
  color: var(--text-muted);
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 5;
  font-size: 0.7rem;
}

.col-header {
  background: var(--bg-subtle);
  color: var(--color-primary);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 4;
}

.col-header.highlighted {
  background: rgba(59, 130, 246, 0.2);
}

.row-header {
  background: var(--bg-subtle);
  color: var(--color-primary);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-subtle);
  position: sticky;
  left: 0;
  z-index: 3;
}

tr.highlighted .row-header {
  background: rgba(59, 130, 246, 0.2);
}

.matrix-cell {
  width: 44px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all var(--transition-fast);
  cursor: default;
}

.cell-diagonal {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  font-weight: 700;
}

.cell-connected {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-weight: 700;
  border-color: rgba(16, 185, 129, 0.3);
}

.cell-null {
  color: var(--text-muted);
}

.cell-null-sym {
  opacity: 0.35;
}

.cell-hovered {
  outline: 2px solid var(--color-primary);
  z-index: 2;
}

.academic-convention-note {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: var(--bg-subtle);
  padding: var(--spacing-3);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-primary);
}

.text-purple { color: var(--color-purple); }
.text-green { color: var(--color-success); }
</style>
