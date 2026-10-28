<template>
  <div
    class="editor-view-container"
    :class="{
      'is-focus-mode': isFocusMode,
      'is-sidebar-open': !isSidebarCollapsed
    }"
  >
    <!-- BARRA SUPERIOR REFINADA DO EDITOR (Espaçosa, Autoexplicativa e com Micro-Animações) -->
    <header class="editor-top-bar card-elevated">
      <!-- 1. GRUPO ESQUERDA: Identificação da Rede e Propriedades Estruturais -->
      <div class="top-bar-cluster cluster-left">
        <!-- Badge da Seção -->
        <div class="editor-brand-chip" title="Módulo de Modelagem e Edição de Grafos">
          <div class="brand-icon-box">
            <Network class="icon-xs" />
          </div>
          <span class="editor-brand-text font-bold">Editor</span>
        </div>

        <!-- Campo de Nome com Alta Affordance de Edição e Estilo Clean -->
        <label
          for="graph-name-input"
          class="editable-name-field"
          title="Clique para editar o nome da rede (Pressione Enter para salvar)"
        >
          <input
            id="graph-name-input"
            v-model="graphName"
            @blur="updateName"
            @keyup.enter="updateName"
            type="text"
            class="clean-name-input font-bold"
            placeholder="Nome da Rede..."
            aria-label="Nome da Rede"
          />
          <Edit3 class="icon-xs edit-affordance-icon" />
        </label>

        <div class="bar-divider"></div>

        <!-- Segmento Autoexplicativo: Direcionamento do Grafo -->
        <div class="topology-segment" title="Defina se o tráfego nas conexões é de mão dupla ou sentido único">
          <div class="segment-pill-track" role="group" aria-label="Direcionamento da Rede">
            <button
              type="button"
              class="pill-option-btn fluffy-option-btn"
              :class="{ active: !graph.directed }"
              @click="setDirected(false)"
              title="Não-Direcionado (Mão Dupla): arestas sem seta, conexões bidirecionais (u ↔ v)"
            >
              <ArrowLeftRight class="icon-xs pill-icon" />
              <span class="fluffy-label">Mão Dupla</span>
            </button>
            <button
              type="button"
              class="pill-option-btn fluffy-option-btn"
              :class="{ active: graph.directed }"
              @click="setDirected(true)"
              title="Direcionado (Sentido Único): arestas com setas no sentido especificado (u ➔ v)"
            >
              <ArrowRight class="icon-xs pill-icon" />
              <span class="fluffy-label">Direcionado</span>
            </button>
          </div>
        </div>

        <!-- Segmento Autoexplicativo: Ponderação de Arestas -->
        <div class="topology-segment" title="Defina se as conexões possuem pesos numéricos personalizados ou peso unitário (1)">
          <div class="segment-pill-track" role="group" aria-label="Ponderação de Arestas">
            <button
              type="button"
              class="pill-option-btn fluffy-option-btn"
              :class="{ active: graph.weighted }"
              @click="setWeighted(true)"
              title="Grafo Ponderado: arestas com pesos numéricos reais (km, latência em ms, custo)"
            >
              <Scale class="icon-xs pill-icon" />
              <span class="fluffy-label">Com Pesos</span>
            </button>
            <button
              type="button"
              class="pill-option-btn fluffy-option-btn"
              :class="{ active: !graph.weighted }"
              @click="setWeighted(false)"
              title="Sem Pesos (Unitário): todas as conexões têm peso fixo igual a 1"
            >
              <Hash class="icon-xs pill-icon" />
              <span class="fluffy-label">Sem Pesos</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. GRUPO CENTRO: Modos de Trabalho Claros e Didáticos -->
      <nav class="top-bar-cluster cluster-center" aria-label="Espaços de Trabalho do Editor">
        <div class="workspaces-pill-track">
          <button
            type="button"
            class="workspace-tab-btn fluffy-option-btn"
            :class="{ active: activeMode === 'visual' }"
            @click="activeMode = 'visual'"
            title="Canvas Visual: desenhe e interaja com os nós e arestas diretamente no canvas interativo"
          >
            <Sparkles class="icon-xs tab-icon" />
            <span class="fluffy-label font-bold">Visual</span>
          </button>

          <button
            type="button"
            class="workspace-tab-btn fluffy-option-btn"
            :class="{ active: activeMode === 'classic' }"
            @click="activeMode = 'classic'"
            title="Tabela Estruturada: gerencie vértices e conexões em formulários e tabelas detalhadas"
          >
            <Table class="icon-xs tab-icon" />
            <span class="fluffy-label font-bold">
              <span>Estruturado</span>
              <span class="tab-count-badge font-mono">{{ graph.vertices.length }}V</span>
            </span>
          </button>

          <button
            type="button"
            class="workspace-tab-btn fluffy-option-btn"
            :class="{ active: activeMode === 'json' }"
            @click="activeMode = 'json'"
            title="JSON & Presets: visualize o código JSON do grafo, importe ou carregue modelos prontos"
          >
            <FileCode class="icon-xs tab-icon" />
            <span class="fluffy-label font-bold">JSON</span>
          </button>
        </div>
      </nav>

      <!-- 3. GRUPO DIREITA: Diagnóstico, Missões, Modo Foco e Testar no Lab -->
      <div class="top-bar-cluster cluster-right">
        <!-- Aviso / Diagnóstico Discreto com Micro-Animação de Pulso -->
        <div
          v-if="activeWarning"
          class="compact-warning-chip"
          :title="`Diagnóstico da Rede: ${activeWarning}`"
        >
          <AlertTriangle class="icon-xs text-amber warning-pulse-icon" />
          <span class="warning-text font-bold">Aviso</span>
        </div>

        <!-- Botão Gamificado de Missões & Desafios com Micro Progressão -->
        <button
          class="missions-pill-btn"
          :class="{ 'all-done': allCompleted }"
          @click="isChallengesOpen = true"
          :title="`Missões Topológicas: ${completedCount} de ${totalCount} concluídas. Clique para abrir.`"
        >
          <Trophy class="icon-xs trophy-icon" />
          <span class="missions-counter font-mono font-bold">{{ completedCount }}/{{ totalCount }}</span>
          <div class="missions-progress-ring">
            <div class="missions-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
          </div>
        </button>

        <!-- Alternador de Modo Foco / Tela Ampla -->
        <button
          class="focus-mode-btn"
          :class="{ active: isFocusMode }"
          @click="toggleFocusMode"
          :title="isFocusMode ? 'Sair do Modo Foco (restaurar barras e menu lateral)' : 'Ativar Modo Foco: expande o canvas para tela total'"
        >
          <Minimize2 v-if="isFocusMode" class="icon-xs focus-icon" />
          <Maximize2 v-else class="icon-xs focus-icon" />
          <span class="focus-text font-bold">{{ isFocusMode ? 'Restaurar' : 'Foco' }}</span>
        </button>

        <!-- Ação Primária Destacada: Testar no Laboratório -->
        <router-link
          to="/algorithms"
          class="btn-simulate-lab"
          title="Executar algoritmos (Dijkstra, Kruskal, DFS, BFS) com esta rede no Laboratório"
        >
          <div class="play-icon-bubble">
            <Play class="icon-xs" />
          </div>
          <span class="btn-text font-bold">Testar no Lab</span>
        </router-link>
      </div>
    </header>

    <!-- ÁREA DE CONSTRUÇÃO PRINCIPAL EM TELA AMPLA -->
    <main class="editor-main-viewport">
      <!-- MODO 1: CONSTRUÇÃO VISUAL (TELA CHEIA) -->
      <div v-show="activeMode === 'visual'" class="mode-workspace-wrapper">
        <VisualGraphCanvas />
      </div>

      <!-- MODO 2: EDIÇÃO ESTRUTURADA (CLÁSSICA) -->
      <div v-if="activeMode === 'classic'" class="mode-workspace-wrapper">
        <ClassicEditorTab />
      </div>

      <!-- MODO 3: IMPORTAR / EXPORTAR JSON & PRESETS -->
      <div v-if="activeMode === 'json'" class="mode-workspace-wrapper">
        <JsonEditorTab />
      </div>
    </main>

    <!-- Drawer Lateral de Missões & Desafios -->
    <ChallengesDrawer
      :isOpen="isChallengesOpen"
      @close="isChallengesOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Network,
  Edit3,
  ArrowLeftRight,
  ArrowRight,
  Scale,
  Hash,
  Sparkles,
  Table,
  FileCode,
  Trophy,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Play
} from 'lucide-vue-next'
import { useGraph } from '../composables/useGraph.js'
import { useGraphChallenges } from '../composables/useGraphChallenges.js'
import { useLayout } from '../composables/useLayout.js'
import VisualGraphCanvas from '../components/editor/VisualGraphCanvas.vue'
import ClassicEditorTab from '../components/editor/ClassicEditorTab.vue'
import JsonEditorTab from '../components/editor/JsonEditorTab.vue'
import ChallengesDrawer from '../components/editor/ChallengesDrawer.vue'

const {
  graph,
  validation,
  setDirected,
  setWeighted,
  setName
} = useGraph()

const {
  completedCount,
  totalCount,
  progressPercent,
  allCompleted
} = useGraphChallenges()

const {
  isSidebarCollapsed,
  isFocusMode,
  toggleFocusMode
} = useLayout()

// Modo de Trabalho ('visual' | 'classic' | 'json')
const activeMode = ref('visual')

// Nome do Grafo
const graphName = ref(graph.value.name)
watch(() => graph.value.name, (val) => { graphName.value = val })

function updateName() {
  if (graphName.value.trim()) {
    setName(graphName.value.trim())
  }
}

// Aviso Compacto Derivado
const activeWarning = computed(() => {
  if (!validation.value) return null
  if (validation.value.errors && validation.value.errors.length > 0) {
    return validation.value.errors[0]
  }
  if (validation.value.warnings && validation.value.warnings.length > 0) {
    return validation.value.warnings[0]
  }
  return null
})

// Drawer de Missões
const isChallengesOpen = ref(false)
</script>

<style scoped>
.editor-view-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  height: 100%;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  transition: padding var(--transition-normal);
  container-type: inline-size;
  container-name: editor;
}

.editor-view-container.is-focus-mode {
  padding: 0;
  gap: 0;
}

/* =========================================================================
   BARRA SUPERIOR REFINADA (52px de altura com respiro, alinhamento e profundidade)
   ========================================================================= */
.editor-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 0.4rem;
  height: 52px;
  min-height: 52px;
  padding: 0 0.65rem;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
  z-index: 10;
  transition: all var(--transition-normal);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.editor-top-bar::-webkit-scrollbar {
  display: none;
}

.is-focus-mode .editor-top-bar {
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  height: 44px;
  min-height: 44px;
  padding: 0 var(--spacing-3);
  background: var(--bg-surface);
}

.top-bar-cluster {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.cluster-left {
  flex-shrink: 0;
}

.cluster-center {
  flex-shrink: 0;
}

.cluster-right {
  flex-shrink: 0;
  margin-left: auto;
  gap: 0.4rem;
}

/* Badge do Editor */
.editor-brand-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  flex-shrink: 0;
}

.brand-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-brand-text {
  font-size: var(--text-xs);
  letter-spacing: -0.01em;
}

/* Campo de Nome com Alta Affordance de Edição e Estilo Clean */
.editable-name-field {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  cursor: text;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.editable-name-field:hover {
  background: var(--bg-surface);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-xs);
  transform: translateY(-0.5px);
}

.editable-name-field:hover .edit-affordance-icon {
  color: var(--color-primary);
  opacity: 1;
  transform: rotate(-12deg) scale(1.15);
}

.editable-name-field:focus-within {
  background: var(--bg-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-bg);
}

.editable-name-field:focus-within .edit-affordance-icon {
  color: var(--color-primary);
  opacity: 0.9;
}

.clean-name-input {
  width: 125px;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-primary);
  font-size: var(--text-xs);
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
  cursor: text;
  transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.clean-name-input:focus {
  width: 175px;
}

.edit-affordance-icon {
  color: var(--text-muted);
  opacity: 0.65;
  flex-shrink: 0;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.bar-divider {
  width: 1px;
  height: 20px;
  background: var(--border-subtle);
  flex-shrink: 0;
  margin: 0 0.1rem;
}

/* Segmentos Didáticos de Topologia (Direção e Custos) */
.topology-segment {
  display: flex;
  align-items: center;
}

.segment-pill-track {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 2.5px;
  gap: 2px;
}

/* =========================================================================
   CONTROLES FLUFFY (Opções inativas mostram apenas ícone; ativa expande elástica)
   ========================================================================= */

.fluffy-option-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.32rem 0.52rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  position: relative;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
  transition: 
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    padding 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fluffy-option-btn .pill-icon,
.fluffy-option-btn .tab-icon {
  flex-shrink: 0;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
}

/* Label que encolhe a zero quando inativa e expande fluffy quando ativa */
.fluffy-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 0;
  opacity: 0;
  transform: scale(0.75) translateX(-8px);
  overflow: hidden;
  white-space: nowrap;
  pointer-events: none;
  margin-left: 0;
  transition: 
    max-width 0.36s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.36s cubic-bezier(0.34, 1.56, 0.64, 1),
    margin-left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hover em opções inativas (ícone ganha destaque sutil) */
.fluffy-option-btn:hover:not(.active) {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-0.5px) scale(1.06);
}

.fluffy-option-btn:hover:not(.active) .pill-icon,
.fluffy-option-btn:hover:not(.active) .tab-icon {
  transform: scale(1.12);
  color: var(--text-primary);
}

.fluffy-option-btn:active {
  transform: scale(0.95);
}

/* ESTADO ATIVO: Expansão fofa (fluffy pop) com sombra macia */
.fluffy-option-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(79, 99, 246, 0.14), 0 1px 3px rgba(16, 24, 40, 0.06);
  font-weight: 700;
  padding: 0.32rem 0.72rem;
  animation: fluffyPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fluffy-option-btn.active .fluffy-label {
  max-width: 160px;
  opacity: 1;
  transform: scale(1) translateX(0);
  margin-left: 0.4rem;
  pointer-events: auto;
}

.fluffy-option-btn.active .pill-icon,
.fluffy-option-btn.active .tab-icon {
  color: var(--color-primary);
  transform: scale(1.12);
}

@keyframes fluffyPop {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* =========================================================================
   2. CENTRO: MODOS DE TRABALHO TRACK
   ========================================================================= */
.workspaces-pill-track {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 3px;
}

.tab-count-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.38rem;
  border-radius: 4px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 700;
}

/* =========================================================================
   3. DIREITA: DIAGNÓSTICO, MISSÕES, FOCO E BOTÃO PRIMÁRIO
   ========================================================================= */

/* Aviso com Pulso Delicado */
.compact-warning-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border-radius: var(--radius-md);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 0.72rem;
  color: var(--color-warning);
  cursor: help;
  user-select: none;
  animation: fadeIn 0.3s ease;
}

.warning-pulse-icon {
  animation: pulseWarn 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulseWarn {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.9); }
}

/* Botão de Missões Gamificadas */
.missions-pill-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.65rem;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.missions-pill-btn:hover {
  border-color: var(--border-accent);
  background: var(--bg-surface);
  transform: translateY(-1px);
  box-shadow: var(--shadow-xs);
}

.missions-pill-btn:active {
  transform: scale(0.97);
}

.missions-pill-btn:hover .trophy-icon {
  animation: trophyWiggle 0.6s ease;
}

@keyframes trophyWiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(-12deg) scale(1.15); }
  60% { transform: rotate(12deg) scale(1.15); }
}

.missions-pill-btn.all-done {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.08);
}

.trophy-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.missions-counter {
  color: var(--text-primary);
}

.missions-progress-ring {
  width: 26px;
  height: 5px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-left: 0.1rem;
}

.missions-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.missions-pill-btn.all-done .missions-progress-fill {
  background: #10b981;
}

/* Botão de Modo Foco */
.focus-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.65rem;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.focus-mode-btn .focus-icon {
  transition: transform 0.25s ease;
}

.focus-mode-btn:hover {
  color: var(--color-primary);
  background: var(--bg-surface);
  border-color: var(--border-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-xs);
}

.focus-mode-btn:active {
  transform: scale(0.97);
}

.focus-mode-btn:hover .focus-icon {
  transform: scale(1.15);
}

.focus-mode-btn.active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

/* Botão Primário: Testar no Laboratório */
.btn-simulate-lab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.75rem;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #4f63f6 0%, #3e51e8 100%);
  color: #ffffff;
  font-size: var(--text-xs);
  box-shadow: 0 2px 8px rgba(79, 99, 246, 0.28);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  user-select: none;
  flex-shrink: 0;
}

.btn-simulate-lab:hover {
  background: linear-gradient(135deg, #5b6efa 0%, #4f63f6 100%);
  transform: translateY(-1.5px);
  box-shadow: 0 4px 14px rgba(79, 99, 246, 0.42);
  color: #ffffff;
}

.btn-simulate-lab:active {
  transform: translateY(0) scale(0.97);
}

.play-icon-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}

.btn-simulate-lab:hover .play-icon-bubble {
  transform: scale(1.15) translateX(1px);
}

/* =========================================================================
   ÁREA DE CONSTRUÇÃO PRINCIPAL (FLEX: 1)
   ========================================================================= */
.editor-main-viewport {
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.is-focus-mode .editor-main-viewport {
  border-radius: 0;
  border: none;
}

.mode-workspace-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

/* =========================================================================
   ADAPTAÇÃO AUTOMÁTICA (MENU LATERAL ABERTO / TELAS MENORES)
   ========================================================================= */

/* Quando a sidebar estiver aberta */
.is-sidebar-open .editor-brand-text {
  display: none;
}

.is-sidebar-open .focus-text {
  display: none;
}

.is-sidebar-open .clean-name-input {
  width: 95px;
}

.is-sidebar-open .clean-name-input:focus {
  width: 140px;
}

.is-sidebar-open .compact-warning-chip {
  max-width: 95px;
}

/* Container Queries para containers menores que 1260px */
@container editor (max-width: 1260px) {
  .editor-brand-text {
    display: none;
  }
  .focus-text {
    display: none;
  }
  .clean-name-input {
    width: 95px;
  }
  .clean-name-input:focus {
    width: 140px;
  }
  .compact-warning-chip {
    max-width: 95px;
  }
}

/* Espaço ainda mais compacto (< 1100px) */
@container editor (max-width: 1100px) {
  .missions-progress-ring {
    display: none;
  }
  .clean-name-input {
    width: 75px;
  }
  .compact-warning-chip .warning-text {
    display: none;
  }
}

/* Fallback Media Queries */
@media (max-width: 1350px) {
  .focus-text,
  .editor-brand-text {
    display: none;
  }
  .clean-name-input {
    width: 95px;
  }
  .clean-name-input:focus {
    width: 140px;
  }
  .compact-warning-chip {
    max-width: 95px;
  }
}

@media (max-width: 1000px) {
  .missions-progress-ring {
    display: none;
  }
  .clean-name-input {
    width: 75px;
  }
}
</style>
