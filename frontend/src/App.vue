<template>
  <div v-if="auth.status === 'loading'" class="app-preloader" data-testid="app-preloader">
    <div class="spinner"></div>
  </div>
  <router-view v-else />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<script>
export default { name: 'App' }
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
}

::-webkit-scrollbar {
  width: 0;
}

a {
  color: transparent;
  text-decoration: none;
}

.blue {
  color: #6C67FD;
}

h1 {
  font-size: 28px;
}

.app-preloader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e7e7f5;
  border-top-color: #6C67FD;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
