<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-box glass-panel">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditing ? 'Editar Vértice' : 'Novo Vértice' }}</h3>
        <button class="close-btn" @click="close">
          <X class="icon-sm" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label class="form-label">Identificador Único (ID):</label>
          <input
            v-model="form.id"
            type="text"
            class="input-control font-mono"
            placeholder="Ex: A, V1, HUB_CENTRAL"
            required
            :disabled="isEditing"
          />
          <span class="field-hint">Deve ser único em todo o grafo.</span>
        </div>

        <div class="form-group">
          <label class="form-label">Nome de Exibição / Rótulo:</label>
          <input
            v-model="form.label"
            type="text"
            class="input-control"
            placeholder="Ex: Subestação Centro, Sensor 01"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Infraestrutura:</label>
          <select v-model="form.type" class="select-control">
            <option value="standard">Padrão (Ponto Urbano)</option>
            <option value="hub">Hub Central de Roteamento</option>
            <option value="datacenter">Centro de Processamento / Nuvem</option>
            <option value="sensor">Sensor IoT / Estação de Monitoramento</option>
          </select>
        </div>

        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Posição X:</label>
            <input v-model.number="form.x" type="number" step="0.5" class="input-control font-mono" />
          </div>
          <div class="form-group">
            <label class="form-label">Posição Y:</label>
            <input v-model.number="form.y" type="number" step="0.5" class="input-control font-mono" />
          </div>
          <div class="form-group">
            <label class="form-label">Posição Z:</label>
            <input v-model.number="form.z" type="number" step="0.5" class="input-control font-mono" />
          </div>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Salvar Alterações' : 'Adicionar Vértice' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  vertexToEdit: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const { addVertex, updateVertex } = useGraph()
const isEditing = ref(false)
const errorMessage = ref('')

const form = ref({
  id: '',
  label: '',
  type: 'standard',
  x: 0,
  y: 0,
  z: 0
})

watch(
  () => props.isOpen,
  (open) => {
    errorMessage.value = ''
    if (open) {
      if (props.vertexToEdit) {
        isEditing.value = true
        form.value = {
          id: props.vertexToEdit.id,
          label: props.vertexToEdit.label,
          type: props.vertexToEdit.type || 'standard',
          x: props.vertexToEdit.x || 0,
          y: props.vertexToEdit.y || 0,
          z: props.vertexToEdit.z || 0
        }
      } else {
        isEditing.value = false
        form.value = {
          id: '',
          label: '',
          type: 'standard',
          x: Number(((Math.random() - 0.5) * 40).toFixed(1)),
          y: Number(((Math.random() - 0.5) * 40).toFixed(1)),
          z: Number(((Math.random() - 0.5) * 40).toFixed(1))
        }
      }
    }
  }
)

function close() {
  emit('close')
}

function handleSubmit() {
  errorMessage.value = ''
  if (!form.value.id || !form.value.id.trim()) {
    errorMessage.value = 'O identificador do nó é obrigatório.'
    return
  }

  if (isEditing.value) {
    const res = updateVertex(form.value.id, {
      label: form.value.label,
      type: form.value.type,
      x: form.value.x,
      y: form.value.y,
      z: form.value.z
    })
    if (res.success) {
      emit('saved', res.vertex)
      close()
    } else {
      errorMessage.value = res.error
    }
  } else {
    const res = addVertex({
      id: form.value.id.trim(),
      label: form.value.label.trim() || form.value.id.trim(),
      type: form.value.type,
      x: form.value.x,
      y: form.value.y,
      z: form.value.z
    })
    if (res.success) {
      emit('saved', res.vertex)
      close()
    } else {
      errorMessage.value = res.error
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal-box {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  padding: var(--spacing-6);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--spacing-3);
}

.modal-title {
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.close-btn {
  color: var(--text-muted);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.field-hint {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-3);
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--red-danger);
  color: var(--red-danger);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.icon-sm {
  width: 16px;
  height: 16px;
}
</style>
