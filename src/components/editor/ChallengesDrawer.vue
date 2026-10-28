<template>
  <div v-if="isOpen" class="challenges-overlay" @click.self="$emit('close')">
    <div class="challenges-drawer glass-panel" :class="{ 'celebrating': allCompleted }">
      <!-- Cabeçalho do Drawer -->
      <div class="drawer-header">
        <div class="header-title-row">
          <div class="trophy-badge" :class="{ 'gold': allCompleted }">
            <Trophy class="icon-sm" />
          </div>
          <div>
            <h3 class="drawer-title">Missões & Desafios de Topologia</h3>
            <p class="drawer-subtitle">Explore conceitos reais de grafos completando objetivos práticos</p>
          </div>
        </div>
        <button class="icon-btn-close" @click="$emit('close')" title="Fechar missões">
          <X class="icon-xs" />
        </button>
      </div>

      <!-- Barra de Progresso Geral -->
      <div class="progress-section card-elevated">
        <div class="progress-info-row">
          <span class="progress-label font-bold">Progresso Geral:</span>
          <span class="progress-count font-mono font-bold text-primary">
            {{ completedCount }} de {{ totalCount }} concluídos ({{ progressPercent }}%)
          </span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: `${progressPercent}%` }"
            :class="{ 'full': allCompleted }"
          ></div>
        </div>
        <p v-if="allCompleted" class="all-completed-banner">
          🎉 Parabéns! Você dominou todos os conceitos fundamentais de topologias urbanas e grafos no SmartNet Analyzer!
        </p>
      </div>

      <!-- Lista de Missões Gamificadas -->
      <div class="challenges-list custom-scroll">
        <div
          v-for="c in challenges"
          :key="c.id"
          class="challenge-card card-elevated"
          :class="{ 'is-completed': c.isCompleted }"
        >
          <div class="challenge-status-col">
            <div class="status-circle" :class="{ 'completed': c.isCompleted }">
              <Check v-if="c.isCompleted" class="icon-xs check-icon" />
              <span v-else class="status-num font-mono">{{ c.current }}/{{ c.target }}</span>
            </div>
          </div>

          <div class="challenge-content">
            <div class="challenge-meta">
              <span class="badge" :class="c.isCompleted ? 'badge-green' : 'badge-subtle'">
                {{ c.badge }}
              </span>
              <span v-if="c.isCompleted" class="completed-label text-green font-bold">
                ✓ Concluído
              </span>
            </div>
            <h4 class="challenge-title">{{ c.title }}</h4>
            <p class="challenge-desc">{{ c.description }}</p>
            <div class="challenge-hint">
              <span class="hint-prefix">Dica:</span> {{ c.hint }}
            </div>
          </div>
        </div>
      </div>

      <!-- Rodapé do Drawer -->
      <div class="drawer-footer">
        <button class="btn btn-secondary btn-sm full-width" @click="$emit('close')">
          Continuar Construindo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trophy, X, Check } from 'lucide-vue-next'
import { useGraphChallenges } from '../../composables/useGraphChallenges.js'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const {
  challenges,
  completedCount,
  totalCount,
  progressPercent,
  allCompleted
} = useGraphChallenges()
</script>

<style scoped>
.challenges-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 23, 0.45);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.15s ease-out;
}

.challenges-drawer {
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl, -8px 0 24px rgba(0, 0, 0, 0.12));
  animation: slideLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-header {
  padding: var(--spacing-4) var(--spacing-5);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-subtle);
}

.header-title-row {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.trophy-badge {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: rgba(79, 99, 246, 0.1);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trophy-badge.gold {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.drawer-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.drawer-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.icon-btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.icon-btn-close:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.progress-section {
  padding: var(--spacing-4);
  margin: var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.progress-info-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  margin-bottom: 0.5rem;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: var(--bg-subtle);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-fill.full {
  background: linear-gradient(90deg, #10b981, #0ea5e9);
}

.all-completed-banner {
  margin-top: 0.65rem;
  font-size: var(--text-xs);
  color: #10b981;
  font-weight: 700;
  line-height: 1.4;
}

.challenges-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--spacing-4) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.challenge-card {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  transition: all var(--transition-fast);
}

.challenge-card.is-completed {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
}

.challenge-status-col {
  padding-top: 0.2rem;
}

.status-circle {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 2px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 700;
}

.status-circle.completed {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
}

.check-icon {
  width: 14px;
  height: 14px;
  stroke-width: 3;
}

.challenge-content {
  flex: 1;
}

.challenge-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.completed-label {
  font-size: 0.65rem;
}

.challenge-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.challenge-desc {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.35;
  margin-bottom: 0.35rem;
}

.challenge-hint {
  font-size: 0.65rem;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.hint-prefix {
  font-weight: 700;
  color: var(--color-primary);
}

.drawer-footer {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-subtle);
}

.full-width {
  width: 100%;
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
