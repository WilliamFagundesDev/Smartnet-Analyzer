<template>
  <div v-if="confirmModalOpen" class="modal-overlay" @click.self="cancelTermination">
    <div class="modal-box glass-panel">
      <div class="modal-header">
        <div class="alert-icon-wrapper">
          <AlertTriangle class="icon-lg text-amber" />
        </div>
        <div>
          <h3 class="modal-title">Finalizar Aplicação SmartNet?</h3>
          <p class="modal-subtitle">Confirmação de Encerramento de Sessão</p>
        </div>
      </div>

      <div class="modal-body">
        <p class="body-text">
          Conforme a especificação do projeto, a ação de <strong>Finalizar Aplicação</strong> irá:
        </p>
        <ul class="action-list">
          <li>Interromper imediatamente todas as animações e cronômetros ativos.</li>
          <li>Liberar os contextos gráficos WebGL e memória do Three.js.</li>
          <li>Pausar a escuta de eventos e colocar o sistema em estado inativo seguro.</li>
          <li>Exibir a tela de conclusão com opção para retomar a qualquer momento.</li>
        </ul>
        <p class="note-text">
          <em>Nota: Em conformidade com as políticas de segurança dos navegadores web modernos, a janela não pode ser fechada compulsoriamente via script sem consentimento do sistema operacional.</em>
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cancelTermination">
          Cancelar
        </button>
        <button class="btn btn-danger" @click="confirmTermination">
          <Power class="icon-sm" />
          <span>Confirmar Encerramento</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, Power } from 'lucide-vue-next'
import { useAppLifecycle } from '../../composables/useAppLifecycle.js'

const { confirmModalOpen, confirmTermination, cancelTermination } = useAppLifecycle()
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
  max-width: 520px;
  background: var(--bg-card);
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: var(--spacing-6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.alert-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(245, 158, 11, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.modal-subtitle {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.modal-body {
  margin-bottom: var(--spacing-6);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.body-text {
  margin-bottom: var(--spacing-3);
}

.action-list {
  padding-left: var(--spacing-5);
  margin-bottom: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.action-list li {
  color: var(--text-primary);
}

.note-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
  border-left: 2px solid var(--border-light);
  padding-left: var(--spacing-3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

.icon-lg {
  width: 26px;
  height: 26px;
}

.icon-sm {
  width: 15px;
  height: 15px;
}

.text-amber {
  color: var(--amber-warning);
}
</style>
