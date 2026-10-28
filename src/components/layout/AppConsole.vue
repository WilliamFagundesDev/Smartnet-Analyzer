<template>
  <div class="app-console" :class="{ 'is-collapsed': isCollapsed, 'is-focus-mode': isFocusMode }">
    <!-- Barra de Status Discreta -->
    <div
      class="console-status-bar"
      @click="isCollapsed = !isCollapsed"
      role="button"
      tabindex="0"
      @keydown.enter.space.prevent="isCollapsed = !isCollapsed"
      :aria-expanded="!isCollapsed"
      aria-label="Terminal técnico e diagnóstico de eventos"
    >
      <div class="status-left">
        <div class="terminal-badge-indicator" :class="{ 'has-logs': logs.length > 0 }">
          <Terminal class="icon-xs" />
        </div>
        <span class="console-title">Console & Diagnóstico</span>
        <span class="log-count-chip font-mono">{{ logs.length }}</span>
        <span v-if="latestLog" class="latest-log-preview font-mono">
          &mdash; {{ latestLog.message }}
        </span>
      </div>

      <div class="status-right" @click.stop>
        <button
          v-if="!isCollapsed"
          class="console-action-btn"
          @click="copyLogs"
          title="Copiar todos os logs para a área de transferência"
          aria-label="Copiar logs"
        >
          <Copy class="icon-xs" />
          <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
        </button>

        <button
          v-if="!isCollapsed"
          class="console-action-btn danger"
          @click="clearLogs"
          title="Limpar logs"
          aria-label="Limpar logs"
        >
          <Trash2 class="icon-xs" />
          <span>Limpar</span>
        </button>

        <button
          class="console-action-btn toggle-arrow"
          @click="isCollapsed = !isCollapsed"
          :title="isCollapsed ? 'Expandir console técnico' : 'Recolher console'"
          :aria-label="isCollapsed ? 'Expandir console' : 'Recolher console'"
        >
          <ChevronDown v-if="!isCollapsed" class="icon-xs" />
          <ChevronUp v-else class="icon-xs" />
        </button>
      </div>
    </div>

    <!-- Área de Conteúdo do Terminal Aberto -->
    <div v-if="!isCollapsed" class="console-content" ref="logContainer">
      <div v-if="logs.length === 0" class="empty-state">
        <span class="empty-text">Aguardando eventos dos algoritmos ou do editor...</span>
      </div>

      <div v-else class="log-stream">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-row"
          :class="`log-${log.type}`"
        >
          <span class="log-time font-mono">{{ log.timestamp }}</span>
          <span class="log-badge font-mono">{{ log.type }}</span>
          <span class="log-text">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Terminal, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useLayout } from '../../composables/useLayout.js'

const { isConsoleCollapsed: isCollapsed, isFocusMode } = useLayout()
const copied = ref(false)
const { logs } = useGraph()
const logContainer = ref(null)

const latestLog = computed(() => {
  return logs.value.length > 0 ? logs.value[logs.value.length - 1] : null
})

watch(() => logs.value.length, async () => {
  if (!isCollapsed.value) {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
})

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
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  z-index: 30;
  flex-shrink: 0;
}

.app-console.is-focus-mode {
  display: none !important;
}

.console-status-bar {
  height: 32px;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-fast);
}

.console-status-bar:hover {
  background: var(--bg-card-hover);
}

.status-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}

.terminal-badge-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.console-title {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  white-space: nowrap;
}

.log-count-chip {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.05rem 0.4rem;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  color: var(--text-muted);
}

.latest-log-preview {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50vw;
}

.status-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.console-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  background: transparent;
  transition: all var(--transition-fast);
}

.console-action-btn:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

.console-action-btn.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.toggle-arrow {
  padding: 0.2rem 0.4rem;
}

.console-content {
  height: 130px;
  overflow-y: auto;
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--code-bg);
  border-top: 1px solid var(--border-subtle);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-style: italic;
}

.log-stream {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.log-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  font-family: var(--font-mono);
  font-size: 0.76rem;
  line-height: 1.45;
}

.log-time {
  color: var(--text-muted);
  font-size: 0.7rem;
  flex-shrink: 0;
}

.log-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.05rem 0.35rem;
  border-radius: 3px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.log-info .log-badge {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.log-success .log-badge {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.log-warning .log-badge {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.log-error .log-badge {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.log-text {
  color: var(--text-primary);
  word-break: break-word;
}

.icon-xs {
  width: 13px;
  height: 13px;
}

@media (max-width: 768px) {
  .app-console {
    display: none;
  }
}
</style>
