<template>
  <div class="explorer-view">
    <!-- Viewport 3D em Tela Cheia -->
    <div class="canvas-fullscreen-wrapper">
      <GraphCanvas3D />
    </div>

    <!-- Painel Lateral Flutuante de Detalhes do Vértice Selecionado -->
    <VertexDetailsModal
      v-if="selectedVertexId"
      @edit="openEditModal"
      @close="selectedVertexId = null"
    />

    <!-- Modal de Edição -->
    <VertexFormModal
      :isOpen="isEditModalOpen"
      :vertexToEdit="vertexToEdit"
      @close="isEditModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGraph } from '../composables/useGraph.js'
import GraphCanvas3D from '../components/graph/GraphCanvas3D.vue'
import VertexDetailsModal from '../components/graph/VertexDetailsModal.vue'
import VertexFormModal from '../components/editor/VertexFormModal.vue'

const { selectedVertexId } = useGraph()
const isEditModalOpen = ref(false)
const vertexToEdit = ref(null)

function openEditModal(v) {
  vertexToEdit.value = v
  isEditModalOpen.value = true
}
</script>

<style scoped>
.explorer-view {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.canvas-fullscreen-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}
</style>
