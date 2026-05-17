<template>
  <div class="analysis">
    <div class="analysis__left">
      <h1>Статистика и аналитика</h1>
      <AnalysisOptions />
      <AnalysisStatistics />
    </div>
    <div class="analysis__right">
      <h1>Анализ моих документов</h1>
      <AnalysisFilesOptions ref="filesOptions" />
      <AnalysisDocuments 
        :documents="documents"
        @document-selected="handleDocumentSelect"
      />
    </div>
  </div>
</template>

<script>
import AnalysisDocuments from '@/components/AnalysisDocuments.vue';
import AnalysisFilesOptions from '@/components/AnalysisFilesOptions.vue';
import AnalysisOptions from '@/components/AnalysisOptions.vue';
import AnalysisStatistics from '@/components/AnalysisStatistics.vue';

export default {
  name: 'AnalysisPage',
  components: {
    AnalysisOptions,
    AnalysisStatistics,
    AnalysisFilesOptions,
    AnalysisDocuments
  },
  data() {
    return {
      documents: []
    }
  },
  mounted() {
    // Получаем документы из компонента AnalysisFilesOptions после монтирования
    this.documents = this.$refs.filesOptions.documents;
  },
  methods: {
    handleDocumentSelect(document) {
      console.log('Selected document:', document);
      // Здесь можно добавить логику обработки выбранного документа
    }
  }
}
</script>

<style scoped>
.analysis {
  display: flex;
  gap: 30px;
}

.analysis__left,
.analysis__right {
  flex: 1;
}

</style>