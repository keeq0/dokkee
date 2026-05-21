<template>
  <div class="register-page">
    <form class="register-form" @submit.prevent="onSubmit" novalidate>
      <h1>Регистрация</h1>

      <label class="field">
        <span>Логин</span>
        <input
          v-model.trim="username"
          type="text"
          autocomplete="username"
          data-testid="register-username"
        >
      </label>

      <label class="field">
        <span>Пароль</span>
        <input
          v-model="password"
          type="password"
          autocomplete="new-password"
          data-testid="register-password"
        >
      </label>

      <label class="field">
        <span>Повторите пароль</span>
        <input
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          data-testid="register-confirm"
        >
      </label>

      <p v-if="error" class="error" data-testid="register-error">{{ error }}</p>

      <button
        type="submit"
        class="submit"
        :disabled="!canSubmit || submitting"
        data-testid="register-submit"
      >
        {{ submitting ? 'Регистрация...' : 'Создать аккаунт' }}
      </button>

      <p class="hint">
        Уже есть аккаунт?
        <router-link :to="{ name: 'Login' }" data-testid="register-login-link">Войти</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')
const submitting = ref(false)

const canSubmit = computed(() =>
  username.value.length > 0 &&
  password.value.length > 0 &&
  password.value === confirm.value
)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await auth.register({ username: username.value, password: password.value })
    router.push('/app')
  } catch (e) {
    error.value = e?.response?.data?.message || 'Не удалось зарегистрироваться'
  } finally {
    submitting.value = false
  }
}
</script>

<script>
export default { name: 'RegisterPage' }
</script>

<style scoped>
.register-page { display: flex; justify-content: center; padding: 80px 16px; }
.register-form { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 16px; }
.register-form h1 { color: #6C67FD; margin-bottom: 8px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.field input { padding: 10px 12px; border: 1px solid #d6d6e7; border-radius: 8px; font-size: 14px; }
.error { color: #c0392b; font-size: 13px; }
.submit { margin-top: 8px; padding: 12px; background: #6C67FD; color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
.submit:disabled { opacity: 0.5; cursor: not-allowed; }
.hint { font-size: 13px; color: #555; text-align: center; }
.hint a { color: #6C67FD; text-decoration: underline; }
</style>
