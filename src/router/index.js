import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import GraphEditorView from '../views/GraphEditorView.vue'
import GraphExplorerView from '../views/GraphExplorerView.vue'
import AlgorithmLabView from '../views/AlgorithmLabView.vue'
import DataStructureView from '../views/DataStructureView.vue'
import ComplexityView from '../views/ComplexityView.vue'
import DocumentationView from '../views/DocumentationView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Visão Geral' }
  },
  {
    path: '/editor',
    name: 'editor',
    component: GraphEditorView,
    meta: { title: 'Editor de Grafos' }
  },
  {
    path: '/explorer',
    name: 'explorer',
    component: GraphExplorerView,
    meta: { title: 'Exploração 3D' }
  },
  {
    path: '/algorithms',
    name: 'algorithms',
    component: AlgorithmLabView,
    meta: { title: 'Laboratório de Algoritmos' }
  },
  {
    path: '/structures',
    name: 'structures',
    component: DataStructureView,
    meta: { title: 'Estruturas de Dados' }
  },
  {
    path: '/complexity',
    name: 'complexity',
    component: ComplexityView,
    meta: { title: 'Análise de Complexidade' }
  },
  {
    path: '/docs',
    name: 'docs',
    component: DocumentationView,
    meta: { title: 'Documentação & Ajuda' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
