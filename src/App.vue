<template>
  <router-view v-if="$route.path === '/login'" />
  <div v-else class="app-layout">
    <TopNav />
    <div class="main-layout">
      <Sidebar />
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopNav from '@/components/TopNav.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  height: calc(100vh - 56px);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
