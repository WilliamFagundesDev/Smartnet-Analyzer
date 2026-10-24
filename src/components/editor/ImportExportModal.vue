<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-box glass-panel">
      <div class="modal-header">
        <h3 class="modal-title">Importar / Exportar Grafo (JSON)</h3>
        <button class="close-btn" @click="close">
          <X class="icon-sm" />
        </button>
      </div>

      <div class="tab-buttons">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'export' }"
          @click="switchToExport"
        >
          <Download class="icon-xs" />
          <span>Exportar Grafo</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          <Upload class="icon-xs" />
          <span>Importar Arquivo</span>
        </button>
      </div>

      <div v-if="activeTab === 'export'" class="tab-content">
        <p class="tab-description">
          O formato JSON documentado abaixo reflete integralmente a estrutura topológica e atributos espaciais do grafo atual.
        </p>
        <textarea
          class="json-textarea font-mono"
          readonly
          :value="exportedJSON"
        ></textarea>

        <div class="action-bar">
          <button class="btn btn-secondary" @click="copyJSON">
            <Copy class="icon-xs" />
            <span>{{ copied ? 'Copiado!' : 'Copiar JSON' }}</span>
          </button>
          <button class="btn btn-primary" @click="downloadJSON">
            <Download class="icon-xs" />
            <span>Baixar Arquivo .json</span>
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'import'" class="tab-content">
        <p class="tab-description">
          Cole o código JSON do grafo ou selecione um arquivo do seu computador. A validação estrutural será executada antes de aplicar qualquer alteração.
        </p>

        <div class="file-drop-area">
          <input
            type="file"
            ref="fileInputRef"
            accept=".json,application/json"
            @change="handleFileUpload"
            style="display: none"
          />
          <button class="btn btn-secondary" @click="$refs.fileInputRef.click()">
            <Upload class="icon-xs" />
            <span>Carregar de Arquivo .json</span>
          </button>
          <span class="file-name" v-if="selectedFileName">{{ selectedFileName }}</span>
        </div>

        <textarea
          v-model="importText"
          class="json-textarea font-mono"
          placeholder="Cole aqui o conteúdo JSON do grafo..."
        ></textarea>

        <div v-if="importError" class="error-banner">
          {{ importError }}
        </div>

        <div class="action-bar">
          <button class="btn btn-secondary" @click="close">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="handleImportSubmit">
            <Check class="icon-xs" />
            <span>Validar e Substituir Grafo</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Download, Upload, Copy, Check } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const { exportToJSON, importFromJSON } = useGraph()
const activeTab = ref('export')
const exportedJSON = ref('')
const importText = ref('')
const importError = ref('')
const selectedFileName = ref('')
const copied = ref(false)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      switchToExport()
      importText.value = ''
      importError.value = ''
      selectedFileName.value = ''
    }
  }
)

function switchToExport() {
  activeTab.value = 'export'
  exportedJSON.value = exportToJSON()
}

function close() {
  emit('close')
}

function copyJSON() {
  navigator.clipboard.writeText(exportedJSON.value).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}

function downloadJSON() {
  const blob = new Blob([exportedJSON.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `smartnet-graph-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  selectedFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    importText.value = e.target.result
    importError.value = ''
  }
  reader.readAsText(file)
}

function handleImportSubmit() {
  importError.value = ''
  if (!importText.value || !importText.value.trim()) {
    importError.value = 'Por favor, insira o código JSON para importação.'
    return
  }

  const res = importFromJSON(importText.value)
  if (res.success) {
    close()
  } else {
    importError.value = res.error
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
  max-width: 600px;
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
}

.modal-title {
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.close-btn {
  color: var(--text-muted);
}

.tab-buttons {
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--spacing-4);
}

.tab-btn {
  padding: 0.5rem 1rem;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.tab-description {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

.json-textarea {
  width: 100%;
  height: 220px;
  background: var(--code-bg);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-path);
  padding: var(--spacing-3);
  font-size: 0.78rem;
  resize: vertical;
  outline: none;
}

.file-drop-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  background: var(--bg-subtle);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
}

.file-name {
  font-size: var(--text-xs);
  color: var(--color-primary);
  font-family: var(--font-mono);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid var(--red-danger);
  color: #fca5a5;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}
</style>
