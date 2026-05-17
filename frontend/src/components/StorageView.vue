<template>
  <div class="storage-view">
    <StorageButtons 
      :current-view="currentView" 
      @view-changed="changeView"
    />
    <DocumentsArea 
      :current-view="currentView" 
      @create-file="createFile"
    />
  </div>
</template>

<script>
import StorageButtons from './StorageButtons.vue';
import DocumentsArea from './DocumentsArea.vue';

export default {
  components: {
    StorageButtons,
    DocumentsArea
  },
  data() {
    return {
      currentView: 'tile'
    }
  },
  methods: {
    changeView(view) {
      console.log('Обработчик view-changed вызван с параметром:', view);
      this.currentView = view;
      console.log('Текущий вид после изменения:', this.currentView);
    },
    createFile() {
      console.log('Создание нового файла');
    }
  },
  mounted() {
    console.log('Главный компонент StorageView mounted');
  }
}
</script>

<style scoped>
.storage-view {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
</style>