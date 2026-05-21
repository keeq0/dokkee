<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="onSubmit" novalidate>
      <h1>Вход</h1>

      <label class="field">
        <span>Логин</span>
        <input
          v-model.trim="username"
          type="text"
          autocomplete="username"
          data-testid="login-username"
        >
      </label>

      <label class="field">
        <span>Пароль</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          data-testid="login-password"
        >
      </label>

      <p v-if="error" class="error" data-testid="login-error">{{ error }}</p>

      <button
        type="submit"
        class="submit"
        :disabled="!canSubmit || submitting"
        data-testid="login-submit"
      >
        {{ submitting ? 'Вход...' : 'Войти' }}
      </button>

      <p class="hint">
        Нет аккаунта?
        <router-link :to="{ name: 'Register' }" data-testid="login-register-link">
          Зарегистрироваться
        </router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

const canSubmit = computed(() => username.value.length > 0 && password.value.length > 0)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await auth.login({ username: username.value, password: password.value })
    const raw = route.query.next
    const next = typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app'
    router.push(next)
  } catch (e) {
    error.value = e?.response?.data?.message || 'Не удалось войти'
  } finally {
    submitting.value = false
  }
}
</script>

<script>
export default { name: 'LoginPage' }
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding: 80px 16px;
}
.login-form {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login-form h1 { color: #6C67FD; margin-bottom: 8px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.field input {
  padding: 10px 12px;
  border: 1px solid #d6d6e7;
  border-radius: 8px;
  font-size: 14px;
}
.error { color: #c0392b; font-size: 13px; }
.submit {
  margin-top: 8px;
  padding: 12px;
  background: #6C67FD;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}
.submit:disabled { opacity: 0.5; cursor: not-allowed; }
.hint { font-size: 13px; color: #555; text-align: center; }
.hint a { color: #6C67FD; text-decoration: underline; }
</style>
