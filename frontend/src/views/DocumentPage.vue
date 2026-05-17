<template>
  <section class="documents">
    <h1>Мои документы</h1>
    <div class="documents__container">
      <div class="documents__storage">
        <div class="storage__header">
          <StorageSearch />
          <StorageFilter />
        </div>
        <DocumentsArea />
      </div>
      <NotesSection />
    </div>
  </section>
</template>

<script>
import DocumentsArea from '@/components/DocumentsArea.vue';
import StorageFilter from '@/components/StorageFilter.vue';
import StorageSearch from '@/components/StorageSearch.vue';
import NotesSection from '@/components/NotesSection.vue';

export default {
  name: 'DocumentPage',
  components: {
    StorageFilter,
    StorageSearch,
    DocumentsArea,
    NotesSection
  }
}
</script>

<style scoped>
h1 {
  padding-bottom: 20px;
}

.documents {
  width: 100%;
  height: auto;
}

.documents__storage {
  width: 650px;
}

.storage__header {
  padding-bottom: 15px;
}

.documents__container {
  display: flex;
  justify-content: space-between;
}
</style>