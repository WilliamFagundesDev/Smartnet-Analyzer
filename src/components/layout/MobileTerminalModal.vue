<template>
  <div v-if="isMobileTerminalOpen" class="terminal-modal-overlay" @click.self="closeMobileTerminal">
    <div class="terminal-box glass-panel">
      <!-- Cabeçalho -->
      <div class="terminal-header">
        <div class="header-left">
          <Terminal class="icon-sm text-blue" />
          <span class="terminal-title">CONSOLE DE EVENTOS</span>
          <span class="badge badge-blue font-mono">{{ logs.length }}</span>
        </div>
        <div class="header-actions">
          <button class="tool-btn" @click="copyLogs" title="Copiar logs">
            <Copy class="icon-xs" />
            <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
          </button>
          <button class="tool-btn" @click="clearLogs" title="Limpar logs">
            <Trash2 class="icon-xs" />
            <span>Limpar</span>
          </button>
          <button class="tool-btn close-btn" @click="closeMobileTerminal">
            <X class="icon-sm" />
          </button>
        </div>
      </div>

      <!-- Corpo com rolagem dos logs -->
      <div class="terminal-body" ref="bodyRef">
        <div v-if="logs.length === 0" class="empty-state">
          Nenhum evento registrado no console até o momento.
        </div>
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-row"
          :class="`log-${log.type}`"
        >
          <span class="log-time font-mono">{{ log.timestamp }}</span>
          <span class="log-tag font-mono">{{ log.type.toUpperCase() }}</span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Terminal, Copy, Trash2, X } from 'lucide-vue-next'
import { useGraph } from '../../composables/useGraph.js'
import { useMobileNav } from '../../composables/useMobileNav.js'

const { logs } = useGraph()
const { isMobileTerminalOpen, closeMobileTerminal } = useMobileNav()
const copied = ref(false)

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
.terminal-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.terminal-box {
  width: 100%;
  height: 80vh;
  max-height: 550px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-light);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 200ms ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.terminal-header {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.terminal-title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.tool-btn {
  padding: 0.3rem 0.55rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tool-btn.close-btn {
  padding: 0.3rem;
}

.terminal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.75rem;
  background: var(--bg-surface);
}

.empty-state {
  color: var(--text-muted);
  text-align: center;
  margin-top: var(--spacing-6);
  font-style: italic;
}

.log-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  line-height: 1.4;
  padding: 0.2rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.log-time {
  color: var(--text-muted);
  font-size: 0.68rem;
  flex-shrink: 0;
}

.log-tag {
  font-size: 0.65rem;
  font-weight: 700;
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

.log-msg {
  color: var(--text-primary);
  word-break: break-word;
}

.icon-xs { width: 13px; height: 13px; }
.icon-sm { width: 16px; height: 16px; }
.text-blue { color: var(--color-primary); }
</style>
