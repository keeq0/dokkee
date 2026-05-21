<template>
  <div class="app-layout">
    <div v-if="auth.isAuthenticated" class="user-bar">
      <span class="user-bar__username" data-testid="user-bar-username">
        {{ auth.user.username }}
      </span>
      <router-link
        v-if="auth.isSuperAdmin"
        to="/admin"
        class="user-bar__link"
        data-testid="user-bar-admin-link"
      >
        Админка
      </router-link>
      <button
        type="button"
        class="user-bar__logout"
        data-testid="user-bar-logout"
        @click="onLogout"
      >
        Выйти
      </button>
    </div>

    <ServiceHeader />
    <ServiceLayout />
    <ServiceFooter />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ServiceHeader from '@/components/ServiceHeader.vue'
import ServiceLayout from '@/components/ServiceLayout.vue'
import ServiceFooter from '@/components/ServiceFooter.vue'

const router = useRouter()
const auth = useAuthStore()

async function onLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<script>
export default {
  name: 'AppLayout',
  components: { ServiceHeader, ServiceLayout, ServiceFooter }
}
</script>

<style scoped>
.user-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 8px 24px;
  background: #f7f7fb;
  font-size: 13px;
  border-bottom: 1px solid #e5e5f0;
}
.user-bar__username { color: #333; font-weight: 500; }
.user-bar__link { color: #6C67FD; text-decoration: underline; }
.user-bar__logout {
  background: none;
  border: 1px solid #d6d6e7;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  color: #444;
}
.user-bar__logout:hover { background: #efeff5; }
</style>
