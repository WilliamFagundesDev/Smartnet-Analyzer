<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-box glass-panel">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditing ? 'Editar Conexão' : 'Nova Conexão (Aresta)' }}</h3>
        <button class="close-btn" @click="close">
          <X class="icon-sm" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Origem (Source):</label>
            <select
              v-model="form.source"
              class="select-control font-mono"
              required
              :disabled="isEditing"
            >
              <option disabled value="">Selecione...</option>
              <option v-for="v in graph.vertices" :key="v.id" :value="v.id">
                {{ v.id }} - {{ v.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Destino (Target):</label>
            <select
              v-model="form.target"
              class="select-control font-mono"
              required
              :disabled="isEditing"
            >
              <option disabled value="">Selecione...</option>
              <option v-for="v in graph.vertices" :key="v.id" :value="v.id">
                {{ v.id }} - {{ v.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group" v-if="graph.weighted">
          <label class="form-label">Peso / Custo Numérico:</label>
          <input
            v-model.number="form.weight"
            type="number"
            step="any"
            class="input-control font-mono"
            required
            placeholder="Ex: 5, 12.5"
          />
          <span class="field-hint" :class="{ 'text-amber': form.weight < 0 }">
            {{ form.weight < 0 ? 'Aviso: Pesos negativos inviabilizam a execução do algoritmo de Dijkstra.' : 'Distância em km, latência em ms ou custo financeiro.' }}
          </span>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Salvar Conexão' : 'Criar Conexão' }}
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
  edgeToEdit: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const { graph, addEdge, updateEdge } = useGraph()
const isEditing = ref(false)
const errorMessage = ref('')

const form = ref({
  id: '',
  source: '',
  target: '',
  weight: 1
})

watch(
  () => props.isOpen,
  (open) => {
    errorMessage.value = ''
    if (open) {
      if (props.edgeToEdit) {
        isEditing.value = true
        form.value = {
          id: props.edgeToEdit.id,
          source: props.edgeToEdit.source,
          target: props.edgeToEdit.target,
          weight: props.edgeToEdit.weight
        }
      } else {
        isEditing.value = false
        const v = graph.value.vertices
        form.value = {
          id: '',
          source: v.length > 0 ? v[0].id : '',
          target: v.length > 1 ? v[1].id : v.length > 0 ? v[0].id : '',
          weight: 1
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
  if (!form.value.source || !form.value.target) {
    errorMessage.value = 'Selecione a origem e o destino da conexão.'
    return
  }

  if (isEditing.value) {
    const res = updateEdge(form.value.id, { weight: form.value.weight })
    if (res.success) {
      emit('saved', res.edge)
      close()
    } else {
      errorMessage.value = res.error
    }
  } else {
    const res = addEdge({
      source: form.value.source,
      target: form.value.target,
      weight: form.value.weight
    })
    if (res.success) {
      emit('saved', res.edge)
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

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
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

.text-amber {
  color: var(--amber-warning) !important;
}
</style>
