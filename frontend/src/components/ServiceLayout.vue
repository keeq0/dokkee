<template>
    <div class="layout">
      <NavigationPanel/>
      <router-view />
    </div>
  </template>
  
  <script>
  import NavigationPanel from './NavigationPanel.vue'
  
  export default {
    components: {
        NavigationPanel,
     },
  }
  </script>
  
  <style scoped>
  .layout {
    margin: 0 auto;
    display: flex;
    width: 1250px;
    padding-top: 50px;
    gap: 50px;
  }
  </style>
  