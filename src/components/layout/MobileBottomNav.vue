<template>
  <nav class="mobile-bottom-nav">
    <router-link
      v-for="item in primaryNav"
      :key="item.path"
      :to="item.path"
      class="mobile-nav-item"
      active-class="is-active"
      @click="closeMobileDrawer"
    >
      <div class="nav-icon-wrapper">
        <component :is="item.icon" class="mobile-icon" />
      </div>
      <span class="mobile-label">{{ item.label }}</span>
    </router-link>

    <!-- Botão de Menu Mais / Drawer -->
    <button
      class="mobile-nav-item"
      :class="{ 'is-active': isMobileDrawerOpen }"
      @click="toggleMobileDrawer"
      title="Menu Completo e Exemplos"
    >
      <div class="nav-icon-wrapper">
        <Menu class="mobile-icon" />
      </div>
      <span class="mobile-label">Menu</span>
    </button>
  </nav>
</template>

<script setup>
import {
  LayoutDashboard,
  Network,
  Box,
  Binary,
  Menu
} from 'lucide-vue-next'
import { useMobileNav } from '../../composables/useMobileNav.js'

const { isMobileDrawerOpen, toggleMobileDrawer, closeMobileDrawer } = useMobileNav()

const primaryNav = [
  { path: '/', label: 'Visão', icon: LayoutDashboard },
  { path: '/editor', label: 'Editor', icon: Network },
  { path: '/explorer', label: '3D', icon: Box },
  { path: '/algorithms', label: 'Algoritmos', icon: Binary }
]
</script>

<style scoped>
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    height: calc(56px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--bg-surface);
    border-top: 1px solid var(--border-light);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    z-index: 50;
    align-items: center;
    justify-content: space-around;
  }

  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: 100%;
    color: var(--text-muted);
    font-size: 0.65rem;
    font-weight: 500;
    text-decoration: none;
    background: none;
    border: none;
    padding: 0;
    transition: all var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
  }

  .nav-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 24px;
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
  }

  .mobile-icon {
    width: 18px;
    height: 18px;
  }

  .mobile-nav-item.is-active {
    color: var(--color-primary);
    font-weight: 700;
  }

  .mobile-nav-item.is-active .nav-icon-wrapper {
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }
}
</style>
