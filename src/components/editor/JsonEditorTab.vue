<template>
  <div class="json-tab-container custom-scroll">
    <!-- Sub-abas da Área JSON: Exportar, Importar e Biblioteca de Presets -->
    <div class="json-nav-bar card-elevated">
      <div class="nav-segment-pill">
        <button
          type="button"
          class="segment-btn"
          :class="{ active: activeSection === 'export' }"
          @click="activeSection = 'export'"
        >
          <Download class="icon-xs" />
          <span>Exportar JSON</span>
        </button>
        <button
          type="button"
          class="segment-btn"
          :class="{ active: activeSection === 'import' }"
          @click="activeSection = 'import'"
        >
          <Upload class="icon-xs" />
          <span>Importar Arquivo / Texto</span>
        </button>
        <button
          type="button"
          class="segment-btn"
          :class="{ active: activeSection === 'presets' }"
          @click="activeSection = 'presets'"
        >
          <Sparkles class="icon-xs" />
          <span>Biblioteca de Exemplos (Presets)</span>
        </button>
      </div>

      <div class="json-meta-badges">
        <span class="badge badge-blue font-mono font-bold">{{ graph.vertices.length }} Nós</span>
        <span class="badge badge-purple font-mono font-bold">{{ graph.edges.length }} Arestas</span>
      </div>
    </div>

    <!-- SEÇÃO 1: EXPORTAÇÃO JSON -->
    <div v-if="activeSection === 'export'" class="json-content-card card-elevated">
      <div class="content-header">
        <div>
          <h3 class="section-title">Estrutura Serializada do Grafo Atual</h3>
          <p class="section-subtitle">
            O código JSON abaixo preserva fielmente todos os identificadores, rótulos, pesos, coordenadas e direcionamento.
          </p>
        </div>
        <div class="content-actions">
          <button class="btn btn-secondary btn-sm" @click="handleCopyJSON">
            <Check v-if="copied" class="icon-xs text-green" />
            <Copy v-else class="icon-xs" />
            <span>{{ copied ? 'Copiado para Clipboard!' : 'Copiar JSON' }}</span>
          </button>
          <button class="btn btn-primary btn-sm" @click="handleDownloadJSON">
            <Download class="icon-xs" />
            <span>Baixar Arquivo .json</span>
          </button>
        </div>
      </div>

      <div class="code-viewport-wrapper">
        <textarea
          class="json-code-editor font-mono custom-scroll"
          readonly
          :value="exportedJSON"
        ></textarea>
      </div>
    </div>

    <!-- SEÇÃO 2: IMPORTAÇÃO JSON COM DRAG & DROP E PRÉ-VALIDAÇÃO -->
    <div v-if="activeSection === 'import'" class="json-content-card card-elevated">
      <div class="content-header">
        <div>
          <h3 class="section-title">Importar Arquivo JSON</h3>
          <p class="section-subtitle">
            Arraste um arquivo .json ou cole o código no editor. A estrutura será pré-validada antes da aplicação.
          </p>
        </div>
      </div>

      <!-- Dropzone Drag & Drop -->
      <div
        class="file-dropzone"
        :class="{ 'is-dragging': isDraggingFile }"
        @dragover.prevent="isDraggingFile = true"
        @dragleave.prevent="isDraggingFile = false"
        @drop.prevent="handleFileDrop"
      >
        <Upload class="icon-md dropzone-icon" />
        <div class="dropzone-text">
          <span class="dropzone-main-text font-bold">Arraste seu arquivo .json aqui</span>
          <span class="dropzone-sub-text">ou clique no botão abaixo para escolher do disco</span>
        </div>
        <input
          type="file"
          ref="fileInputRef"
          accept=".json,application/json"
          @change="handleFileInputChange"
          style="display: none;"
        />
        <button class="btn btn-secondary btn-sm" @click="$refs.fileInputRef.click()">
          <FileText class="icon-xs" />
          <span>Selecionar Arquivo .json</span>
        </button>
        <span v-if="loadedFileName" class="loaded-file-badge font-mono font-bold">
          Arquivo: {{ loadedFileName }}
        </span>
      </div>

      <!-- Editor de Texto de Importação -->
      <div class="code-viewport-wrapper">
        <textarea
          class="json-code-editor font-mono custom-scroll"
          v-model="importCode"
          placeholder="Cole aqui a estrutura JSON do grafo..."
        ></textarea>
      </div>

      <!-- Card de Pré-visualização da Validação -->
      <div v-if="validationPreview" class="validation-preview-card" :class="{ 'is-valid': validationPreview.isValid, 'is-invalid': !validationPreview.isValid }">
        <div class="preview-header">
          <span class="font-bold">{{ validationPreview.isValid ? '✓ Estrutura JSON Válida' : '✕ Erro na Estrutura JSON' }}</span>
          <span v-if="validationPreview.isValid" class="badge badge-green">Pronto para Carregar</span>
        </div>

        <div v-if="validationPreview.isValid" class="preview-stats-grid">
          <div class="stat-box">
            <span class="stat-label">Nome:</span>
            <span class="stat-val font-bold">{{ validationPreview.name }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Vértices:</span>
            <span class="stat-val font-mono font-bold">{{ validationPreview.verticesCount }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Conexões:</span>
            <span class="stat-val font-mono font-bold">{{ validationPreview.edgesCount }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Direcionado:</span>
            <span class="stat-val">{{ validationPreview.directed ? 'Sim' : 'Não' }}</span>
          </div>
        </div>

        <p v-else class="preview-error-msg font-mono text-xs">
          {{ validationPreview.error }}
        </p>
      </div>

      <!-- Ações de Submissão -->
      <div class="import-submit-bar">
        <button
          class="btn btn-primary btn-md"
          :disabled="!validationPreview || !validationPreview.isValid"
          @click="applyImport"
        >
          <Check class="icon-xs" />
          <span>Confirmar e Substituir Grafo Atual</span>
        </button>
      </div>
    </div>

    <!-- SEÇÃO 3: BIBLIOTECA DE PRESETS VISUAIS -->
    <div v-if="activeSection === 'presets'" class="presets-gallery custom-scroll">
      <div class="presets-grid">
        <div
          v-for="p in presets"
          :key="p.id"
          class="preset-card card-elevated"
          :class="{ 'active-preset': isCurrentPreset(p) }"
        >
          <div class="preset-card-header">
            <div class="preset-badge-row">
              <span class="badge" :class="p.directed ? 'badge-amber' : 'badge-blue'">
                {{ p.directed ? 'Direcionado' : 'Não-Direcionado' }}
              </span>
              <span class="badge badge-purple font-mono">
                {{ p.vertices.length }}V • {{ p.edges.length }}E
              </span>
            </div>
            <h4 class="preset-card-title">{{ p.name }}</h4>
          </div>

          <p class="preset-card-desc">{{ p.description }}</p>

          <div class="preset-card-footer">
            <button
              class="btn btn-sm full-width"
              :class="isCurrentPreset(p) ? 'btn-secondary' : 'btn-primary'"
              @click="handleLoadPreset(p.id)"
            >
              <Check v-if="isCurrentPreset(p)" class="icon-xs" />
              <Sparkles v-else class="icon-xs" />
              <span>{{ isCurrentPreset(p) ? 'Preset em Uso' : 'Carregar Este Grafo' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Download,
  Upload,
  Sparkles,
  Copy,
  Check,
  FileText
} from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { validateJSONImport } from '../../graph/graphValidation.js'

const {
  graph,
  exportToJSON,
  importFromJSON,
  loadPreset,
  presets
} = useGraph()

const activeSection = ref('export')
const copied = ref(false)
let copyTimer = null

const exportedJSON = computed(() => exportToJSON())

function handleCopyJSON() {
  navigator.clipboard.writeText(exportedJSON.value)
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 2500)
}

function handleDownloadJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportedJSON.value)
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `${graph.value.name.replace(/\s+/g, '_').toLowerCase()}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

// Importação
const isDraggingFile = ref(false)
const loadedFileName = ref('')
const importCode = ref('')

const validationPreview = computed(() => {
  const code = importCode.value.trim()
  if (!code) return null
  try {
    const parsed = JSON.parse(code)
    const val = validateJSONImport(parsed)
    if (!val.isValid) {
      return { isValid: false, error: val.error }
    }
    return {
      isValid: true,
      name: parsed.name || 'Grafo Importado',
      verticesCount: parsed.vertices.length,
      edgesCount: parsed.edges.length,
      directed: !!parsed.directed
    }
  } catch (err) {
    return { isValid: false, error: `Sintaxe JSON inválida: ${err.message}` }
  }
})

function handleFileDrop(e) {
  isDraggingFile.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    readFile(file)
  }
}

function handleFileInputChange(e) {
  const file = e.target.files[0]
  if (file) {
    readFile(file)
  }
}

function readFile(file) {
  loadedFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    importCode.value = event.target.result
  }
  reader.readAsText(file)
}

function applyImport() {
  if (!validationPreview.value || !validationPreview.value.isValid) return
  if (confirm(`Deseja substituir o grafo atual por "${validationPreview.value.name}"?`)) {
    const res = importFromJSON(importCode.value)
    if (res.success) {
      alert('Grafo importado e aplicado com sucesso!')
      activeSection.value = 'export'
    } else {
      alert(`Erro na importação: ${res.error}`)
    }
  }
}

function isCurrentPreset(p) {
  return graph.value.name === p.name
}

function handleLoadPreset(presetId) {
  if (confirm('Carregar este preset e substituir o grafo em edição?')) {
    loadPreset(presetId)
  }
}
</script>

<style scoped>
.json-tab-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-4);
}

.json-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.nav-segment-pill {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 2px;
}

.segment-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.segment-btn:hover {
  color: var(--text-primary);
}

.segment-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-xs);
  font-weight: 700;
}

.json-meta-badges {
  display: flex;
  gap: var(--spacing-2);
}

.json-content-card {
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.section-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.content-actions {
  display: flex;
  gap: var(--spacing-2);
}

.code-viewport-wrapper {
  width: 100%;
  height: 380px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-subtle);
  overflow: hidden;
}

.json-code-editor {
  width: 100%;
  height: 100%;
  padding: var(--spacing-3);
  font-size: 0.8rem;
  line-height: 1.5;
  background: transparent;
  border: none;
  color: var(--text-primary);
  resize: none;
  outline: none;
}

/* Dropzone */
.file-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-6);
  border-radius: var(--radius-md);
  border: 2px dashed var(--border-subtle);
  background: var(--bg-subtle);
  transition: all var(--transition-fast);
}

.file-dropzone.is-dragging {
  border-color: var(--color-primary);
  background: rgba(79, 99, 246, 0.05);
}

.dropzone-icon {
  color: var(--color-primary);
}

.dropzone-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.dropzone-main-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.dropzone-sub-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.loaded-file-badge {
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: rgba(79, 99, 246, 0.1);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-sm);
}

.validation-preview-card {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-subtle);
}

.validation-preview-card.is-valid {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.03);
}

.validation-preview-card.is-invalid {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.03);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  font-size: var(--text-sm);
}

.preview-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-3);
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: var(--text-xs);
}

.stat-label {
  color: var(--text-muted);
}

.preview-error-msg {
  color: var(--color-danger);
}

.import-submit-bar {
  display: flex;
  justify-content: flex-end;
}

/* Presets Gallery */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: var(--spacing-4);
}

.preset-card {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.preset-card.active-preset {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.preset-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.preset-card-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
}

.preset-card-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.full-width {
  width: 100%;
}
</style>
