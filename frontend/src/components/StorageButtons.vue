<template>
  <div class="storage__buttons">
    <button class="button main__button">
      <img src="@/assets/create.png" class="button__icon" />
      <p class="button__text">Создать</p>
    </button>
    <button class="button">
      <img src="@/assets/upload.png" class="button__icon" />
      <p class="button__text">Загрузить</p>
    </button>
    <button class="button">
      <img src="@/assets/download.png" class="button__icon" />
      <p class="button__text">Скачать</p>
    </button>
    <button class="button">
      <img src="@/assets/delete.png" class="button__icon" />
      <p class="button__text">Удалить</p>
    </button>
    <button class="button">
      <img src="@/assets/rename.png" class="button__icon" />
      <p class="button__text">Переименовать</p>
    </button>
    <button class="button">
      <img src="@/assets/archive.png" class="button__icon" />
      <p class="button__text">Архив</p>
    </button>
    <div class="storage__view">
      <button class="view__button" @click="setView('tile')">
        <img 
          src="@/assets/tile.png" 
          class="view__icon" 
          :class="{ 'selected': currentView === 'tile' }"
        />
      </button>
      <button class="view__button" @click="setView('list')">
        <img 
          src="@/assets/list.png" 
          class="view__icon list" 
          :class="{ 'selected': currentView === 'list' }"
        />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentView: {
      type: String,
      required: true,
      default: 'tile'
    }
  },
  methods: {
     setView(view) {
      console.log('Кнопка нажата, пытаюсь установить вид:', view);
      this.$emit('view-changed', view);
      console.log('Событие view-changed отправлено');
    },
    mounted() {
    console.log('Компонент StorageButtons mounted, текущий вид:', this.currentView);
  }
  }
}
</script>

<style scoped>


.storage__buttons {
  width: 650px;
  height: 30px;
  display: flex;
  justify-content: space-between;
}

.button {
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  outline: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-radius: 10px;
  padding: 0 10px;
  transition: .2s;
}

.button__icon {
  width: 10px;
}

.button__text {
  font-size: 12px;
}

.button:hover:not(.main__button) {
  background-color: #e6e6e6;
}

.main__button {
  background-color: #333;
  color: #FFF;
}

.main__button .button__icon {
  filter: invert(1);
}

.main__button:hover {
  background-color: #a2a2a2;
}

.view__icon {
  width: 15px;
  filter: invert(0.5);
  transition: 0.2s;
}

.storage__view {
  display: flex;
  gap: 10px;
  padding: 0 5px;
  background-color: none;
}

.view__button {
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: none;
}

.list {
  width: 20px;
}

.view__button:hover .view__icon {
  filter: invert(0);
}

.selected {
  filter: invert(0) !important;
}


</style>