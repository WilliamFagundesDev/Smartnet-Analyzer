<template>
  <div v-if="isTerminated" class="shutdown-screen">
    <div class="shutdown-content glass-panel">
      <div class="shutdown-icon-wrapper">
        <CheckCircle2 class="icon-xl text-green" />
      </div>

      <h1 class="shutdown-title">SISTEMA SMARTNET DESCONECTADO</h1>
      <p class="shutdown-subtitle">
        Aplicação finalizada com segurança &middot; Recursos WebGL e memória descarregados
      </p>

      <div class="summary-box">
        <div class="summary-row">
          <span class="label">Status:</span>
          <span class="value text-green">Sessão Suspensa com Sucesso</span>
        </div>
        <div class="summary-row">
          <span class="label">Contextos Gráficos:</span>
          <span class="value">Three.js / WebGL desativados</span>
        </div>
        <div class="summary-row">
          <span class="label">Timers / Animações:</span>
          <span class="value">Execuções de algoritmos interrompidas</span>
        </div>
        <div class="summary-row">
          <span class="label">Persistência:</span>
          <span class="value">Grafo preservado no armazenamento local</span>
        </div>
      </div>

      <div class="shutdown-actions">
        <button class="btn btn-primary" @click="resumeApplication">
          <Play class="icon-sm" />
          <span>Retomar Aplicação</span>
        </button>

        <button class="btn btn-secondary" @click="restartApplication">
          <RotateCcw class="icon-sm" />
          <span>Reiniciar do Zero</span>
        </button>
      </div>

      <div class="academic-note">
        Avaliação Acadêmica: Análise e Complexidade de Algoritmos &middot; SmartNet Analyzer v1.0
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, Play, RotateCcw } from 'lucide-vue-next'
import { useAppLifecycle } from '../../composables/useAppLifecycle.js'

const { isTerminated, resumeApplication, restartApplication } = useAppLifecycle()
</script>

<style scoped>
.shutdown-screen {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, #0f172a 0%, #030712 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-6);
}

.shutdown-content {
  width: 100%;
  max-width: 620px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: var(--spacing-8);
  text-align: center;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
}

.shutdown-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-success-bg);
  border: 2px solid var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-4);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
}

.shutdown-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.shutdown-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-6);
}

.summary-box {
  background: rgba(6, 9, 19, 0.7);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  text-align: left;
  font-size: var(--text-sm);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 0.35rem;
}

.summary-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.label {
  color: var(--text-muted);
}

.value {
  color: var(--text-primary);
  font-weight: 500;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.shutdown-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.academic-note {
  font-size: var(--text-xs);
  color: var(--text-muted);
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--spacing-4);
}

.icon-xl {
  width: 40px;
  height: 40px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.text-green {
  color: var(--color-success);
}
</style>
