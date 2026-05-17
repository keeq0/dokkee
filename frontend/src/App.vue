<template>
  <router-view />
</template>

<script>
export default {
  name: 'App'
}
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
</style>
