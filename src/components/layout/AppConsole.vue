<template>
  <div class="app-console" :class="{ 'is-collapsed': isCollapsed }">
    <div class="console-header" @click="isCollapsed = !isCollapsed">
      <div class="header-left">
        <Terminal class="icon-sm text-blue" />
        <span class="console-title">TERMINAL TÉCNICO DE EVENTOS & DIAGNÓSTICO</span>
        <span class="log-count-badge">{{ logs.length }}</span>
      </div>
      <div class="header-right" @click.stop>
        <button class="tool-btn" @click="clearLogs" title="Limpar logs do console">
          <Trash2 class="icon-xs" />
          <span>Limpar</span>
        </button>
        <button class="tool-btn" @click="copyLogs" title="Copiar todos os logs em texto">
          <Copy class="icon-xs" />
          <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
        </button>
        <button class="tool-btn toggle-btn" @click="isCollapsed = !isCollapsed">
          <ChevronDown v-if="!isCollapsed" class="icon-sm" />
          <ChevronUp v-else class="icon-sm" />
        </button>
      </div>
    </div>

    <div v-if="!isCollapsed" class="console-body" ref="logContainer">
      <div v-if="logs.length === 0" class="empty-logs">
        Nenhum evento registrado até o momento.
      </div>
      <div
        v-for="log in logs"
        :key="log.id"
        class="log-entry"
        :class="`log-${log.type}`"
      >
        <span class="log-time">[{{ log.timestamp }}]</span>
        <span class="log-tag">{{ log.type.toUpperCase() }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Terminal, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'

const isCollapsed = ref(true) // Recolhido por padrão para maximizar espaço visual
const copied = ref(false)
const { logs } = useGraph()

function clearLogs() {
  logs.value = []
}

function copyLogs() {
  const text = logs.value
    .map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`)
    .join('\n')
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<style scoped>
.app-console {
  background: var(--bg-surface);
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: max-height var(--transition-normal);
  z-index: 30;
}

.app-console.is-collapsed {
  max-height: 38px;
}

.console-header {
  height: 38px;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border-subtle);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.console-title {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.log-count-badge {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-full);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.tool-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
}

.tool-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}

.console-body {
  height: 125px;
  overflow-y: auto;
  padding: var(--spacing-2) var(--spacing-4);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: var(--bg-surface);
}

.log-entry {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  line-height: 1.4;
}

.log-time {
  color: var(--text-muted);
  flex-shrink: 0;
}

.log-tag {
  font-weight: 700;
  font-size: 0.7rem;
  padding: 0 0.3rem;
  border-radius: 3px;
  flex-shrink: 0;
}

.log-info .log-tag {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.log-success .log-tag {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.log-warning .log-tag {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.log-error .log-tag {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.log-message {
  color: var(--text-primary);
  word-break: break-word;
}

.empty-logs {
  color: var(--text-muted);
  padding: var(--spacing-3) 0;
  text-align: center;
  font-style: italic;
}

.icon-xs {
  width: 12px;
  height: 12px;
}

.icon-sm {
  width: 15px;
  height: 15px;
}

.text-blue {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .app-console {
    display: none;
  }
}
</style>
