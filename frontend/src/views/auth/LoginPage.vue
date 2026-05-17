<template>
  <div class="login-placeholder">
    <h1>Вход</h1>
    <p>Страница входа появится в PR-5.</p>
    <router-link to="/">На главную</router-link>
  </div>
</template>

<script>
export default {
  name: 'LoginPage'
}
</script>

<style scoped>
.login-placeholder {
  max-width: 480px;
  margin: 100px auto;
  padding: 40px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
}

.login-placeholder h1 {
  margin-bottom: 16px;
  color: #6C67FD;
}

.login-placeholder p {
  margin-bottom: 24px;
  color: #444;
}

.login-placeholder a {
  color: #6C67FD;
  text-decoration: underline;
}
</style>
