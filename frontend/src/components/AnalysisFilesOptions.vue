<template>
  <div class="analysis__options">
    <div class="options__search">
      <input
        class="search__input"
        type="text"
        placeholder="Поиск файлов"
        v-model="searchQuery"
        @input="$emit('search', searchQuery)"
      />
      <img src="@/assets/search_icon.png" class="search__icon" />
    </div>
    <AnalysisMemoryBar :documents="documents" />
  </div>
</template>

<script>
import AnalysisMemoryBar from './AnalysisMemoryBar.vue'

export default {
  name: 'AnalysisFilesOptions',
  components: { AnalysisMemoryBar },
  data() {
    return {
      searchQuery: '',
      documents: [
        { 
          name: 'Работа', 
          color: 'green', 
          lastModified: '22.03.2025', 
          createdDate: '15.01.2024', 
          size: '75 MB',
          folders: 6,
          files: 42,
          quality: '53%',
          contractors: 4,
          risks: 278
        },
        { 
          name: 'OZON Банк', 
          color: 'blue', 
          lastModified: '22.03.2025', 
          createdDate: '10.02.2024', 
          size: '160.5 MB',
          folders: 8,
          files: 35,
          quality: '67%',
          contractors: 3,
          risks: 145
        },
        { 
          name: 'Документы', 
          color: 'red', 
          lastModified: '22.03.2025', 
          createdDate: '05.03.2024', 
          size: '150 Мб',
          folders: 12,
          files: 87,
          quality: '42%',
          contractors: 7,
          risks: 312
        },
        { 
          name: 'Контракты', 
          color: 'purple', 
          lastModified: '22.03.2025', 
          createdDate: '20.01.2024', 
          size: '88 MB',
          folders: 5,
          files: 23,
          quality: '78%',
          contractors: 2,
          risks: 98
        },
        { 
          name: 'Отчёты', 
          color: 'yellow', 
          lastModified: '22.03.2025', 
          createdDate: '12.02.2024', 
          size: '25 MB',
          folders: 3,
          files: 15,
          quality: '85%',
          contractors: 1,
          risks: 42
        },
      ]
    }
  }
}
</script>

<style scoped>
.analysis__options {
  margin-top: 25px;
  display: flex;
  gap: 20px;
  padding-bottom: 10px;
}

.options__search {
  width: 200px;
  height: 30px;
  background-color: #f4f4f4;
  border-radius: 10px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search__input {
  flex: 1;
  border: none;
  background: transparent;
  color: #a2a2a2;
  font-size: 10px;
  outline: none;
}

.search__icon {
  width: 10px;
  height: 10px;
}
</style>