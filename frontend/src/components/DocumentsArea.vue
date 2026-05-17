<template>
  <div class="storage-container">
    <!-- Кнопки управления -->
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
      
      <!-- Кнопки переключения вида -->
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

    <!-- Область документов -->
   <div 
      class="documents-area"
      :class="{ 'height-transition': isViewChanging }"
      ref="documentsArea"
    >
      <div class="area__header">
        <img src="@/assets/home.svg" class="header__icon" />
        <p class="path">
          <span>Home</span> / <span>Работа</span> / <span class="selected">Университет</span>
        </p>
      </div>
      
      <!-- Режим плитки -->
      <ul v-if="currentView === 'tile'" class="documents__list tile-view">
        <div class="tile-container">
          <StorageDocumentTiled
            v-for="(doc, index) in documents"
            :key="'tile-'+index"
            :name="doc.name"
            :color="doc.color"
            :last-modified="doc.lastModified"
            :data-index="index"
            class="tile-item"
            @options-click="handleOptionsClick"
          />
          
          <!-- Кнопка нового файла для tile вида -->
          <li 
            class="new-file tile-item" 
            @click="createFile"
            :data-index="documents.length"
            key="new-file-tile"
          >
            <div class="new-file__plus">+</div>
            <p class="new-file__text">Новый файл</p>
          </li>
        </div>
      </ul>
      
      <!-- Режим списка -->
      <ul v-else class="documents__list list-view">
        <div class="list-container">
          <StorageDocumentListed
            v-for="(doc, index) in documents"
            :key="'list-'+index"
            :name="doc.name"
            :color="doc.color"
            :last-modified="doc.lastModified"
            :created-date="doc.createdDate"
            :size="doc.size"
            :data-index="index"
            class="list-item"
            @options-click="handleOptionsClick"
          />
          
          <!-- Кнопка нового файла для list вида -->
          <li 
            class="new-file__list list-item" 
            @click="createFile"
            :data-index="documents.length"
            key="new-file-list"
          >
            <div class="list__folder">+</div>
            <p class="list__text">Новый файл</p>
          </li>
        </div>
      </ul>
    </div>
     <DocumentsFooter :documents="documents" />
  </div>
</template>

<script>
import StorageDocumentTiled from './StorageDocumentTiled.vue';
import StorageDocumentListed from './StorageDocumentListed.vue';
import DocumentsFooter from './DocumentsFooter.vue';

export default {
  components: {
    StorageDocumentTiled,
    StorageDocumentListed,
    DocumentsFooter
  },
  data() {
    return {
      currentView: 'tile',
      isViewChanging: false,
      viewChangeTimeout: null,
      documents: [
        { name: 'Работа', color: 'green', lastModified: '22.03.2025', createdDate: '15.01.2024', size: '25 MB' },
        { name: 'OZON Банк', color: 'blue', lastModified: '22.03.2025', createdDate: '10.02.2024', size: '10.5 MB' },
        { name: 'Документы', color: 'red', lastModified: '22.03.2025', createdDate: '05.03.2024', size: '575 Мб' },
        { name: 'Контракты', color: 'purple', lastModified: '22.03.2025', createdDate: '20.01.2024', size: '17 MB' },
        { name: 'Отчёты', color: 'yellow', lastModified: '22.03.2025', createdDate: '12.02.2024', size: '13 MB' },
      ],
      observer: null
    }
  },
  mounted() {
    this.setupAnimationObserver();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  created() {
    const savedView = localStorage.getItem('documentView');
    if (savedView) {
      this.currentView = savedView;
    }
  },
  methods: {
    handleOptionsClick() {
      console.log('Options clicked');
    },
    createFile() {
      console.log('Создание нового файла');
    },
     setView(view) {
      if (this.currentView !== view) {
        this.isViewChanging = true;
        
        // Очищаем предыдущий таймаут, если есть
        if (this.viewChangeTimeout) {
          clearTimeout(this.viewChangeTimeout);
        }
        
        this.currentView = view;
        localStorage.setItem('documentView', view);
        
        // Устанавливаем таймаут для сброса флага переключения
        this.viewChangeTimeout = setTimeout(() => {
          this.isViewChanging = false;
        }, 500); // Должно соответствовать длительности анимации
        
        this.$nextTick(() => {
          this.setupAnimationObserver();
        });
      }
    },
    setupAnimationObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index'));
            const delay = index * 50; // 50ms задержка между элементами
            
            if (entry.target.classList.contains('tile-item')) {
              // Анимация для плиточного вида
              setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
              }, delay);
            } else if (entry.target.classList.contains('list-item')) {
              // Анимация для спискового вида
              setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
              }, delay);
            }
            
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      document.querySelectorAll('.tile-item, .list-item').forEach(el => {
        this.observer.observe(el);
      });
    }
  }
}
</script>

<style scoped>
.storage-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Стили для кнопки нового файла в списке */
.new-file__list {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  border-radius: 10px;
  opacity: 0;
  transform: translateX(-20px);
}

.new-file__list:hover {
  background-color: #f3f3f3;
}

.new-file__list:hover .list__folder {
  background-color: #e0e0e0;
}

.list__folder {
  width: 30px;
  height: 20px;
  background-color: #f2f2f2;
  color: #a2a2a2;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.list__text {
  font-size: 10px;
  font-weight: 700;
  transition: color 0.3s ease;
}

/* Стили только для кнопок управления */
.storage__buttons {
  width: 650px;
  height: 30px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
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
  transition: all 0.3s ease;
}

.button__icon {
  width: 10px;
  transition: filter 0.3s ease;
}

.button__text {
  font-size: 12px;
  transition: color 0.3s ease;
}

.button:hover:not(.main__button) {
  background-color: #e6e6e6;
}

.main__button {
  background-color: #333;
  color: #FFF;
  transition: all 0.3s ease;
}

.main__button .button__icon {
  filter: invert(1);
}

.main__button:hover {
  background-color: #a2a2a2;
}

/* Стили для переключения вида */
.storage__view {
  display: flex;
  gap: 10px;
  padding: 0 5px;
}

.view__icon {
  width: 15px;
  filter: invert(0.5);
  transition: all 0.3s ease;
}

.view__icon.list {
  width: 20px;
}

.view__button {
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: none;
  transition: transform 0.3s ease;
}

.view__button:hover .view__icon {
  filter: invert(0);
}

.selected {
  filter: invert(0) !important;
}

/* Общие стили для области документов */
.documents-area {
  width: 100%;
  min-height: 270px;
  background-color: #fff;
  border-radius: 20px;
  border: 1px solid #e6e6e6;
  padding: 10px 10px;
  transition: all 0.3s ease;
}

.documents-area.height-transition {
  transition: 
    height 0.5s ease-out,
    all 0.3s ease;
  overflow: hidden;
}

.area__header {
  display: flex;
  gap: 5px;
  padding-bottom: 15px;
}

.path {
  font-size: 10px;
  font-weight: 600;
  color: #a2a2a2;
}

span {
  transition: all 0.3s ease;
}

.selected {
  font-weight: 700;
  color: #000;
}

span:hover:not(.selected) {
  color: #000;
  cursor: pointer;
}

/* Стили для списка документов */
.documents__list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  list-style: none;
}

.documents__list.list-view {
  flex-direction: column;
  gap: 10px;
  flex-wrap: nowrap;
}

.tile-container, .list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  width: 100%;
}

.list-container {
  flex-direction: column;
  gap: 8px;
}

/* Анимации для плиточного вида */
.tile-item {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Анимации для спискового вида */
.list-item {
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

/* Стили для кнопки нового файла в плитке */
.new-file {
  width: 143px;
  height: 100px;
  background-color: #EEE;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.new-file:hover {
  background-color: #DDD;
}

.new-file:hover .new-file__text {
  color: #a2a2a2;
}

.new-file__plus {
  font-size: 32px;
  font-weight: bold;
  color: #a2a2a2;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.new-file__text {
  position: absolute;
  bottom: 5px;
  left: 10px;
  font-size: 8px;
  font-weight: 600;
  color: #d0d0d0;
  margin: 0;
  transition: all 0.3s ease;
}
</style>