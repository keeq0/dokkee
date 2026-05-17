<template>
  <div class="documents__notes">
    <div class="notes__header">
      <div class="header__left">
        <h3>Заметки</h3>
        <p class="notes__date">23 марта, воскресенье</p>
      </div>
      <button class="header__button" @click="addNewNote">
        +
      </button>
    </div>
    <div class="notes__options">
      <NotesSearch />
      <NotesFilter />
    </div>
    <div class="notes__list">
      <NotesItem
        v-for="(note, index) in notes"
        :key="index"
        :title="note.title"
        :content="note.content"
        :files="note.files"
        :modifiedDate="note.modifiedDate"
        :index="index"
      />
    </div>
  </div>
</template>

<script>
import NotesSearch from '@/components/NotesSearch.vue';
import NotesFilter from '@/components/NotesFilter.vue';
import NotesItem from '@/components/NotesItem.vue';

export default {
  name: 'NotesSection',
  components: {
    NotesSearch,
    NotesFilter,
    NotesItem
  },
  data() {
    return {
      currentDate: this.formatDate(new Date()),
      notes: [
        {
          title: 'Дублирование условий',
          content: 'Обнаружено дублирование условий в пунктах 3.2 и 5.1. Необходимо согласовать изменения с юристом.',
          files: ['Договор_поставки_2025.pdf', 'Правки_юриста.docx'],
          modifiedDate: '2025-03-15'
        },
        {
          title: 'Отсутствует пункт о конфиденциальности',
          content: 'В разделе "Обязательства сторон" отсутствует пункт о конфиденциальности информации. Рекомендую добавить стандартную формулировку из шаблона.',
          files: ['Соглашение о сотрудничестве.docx', 'Шаблон_конфиденциальность.doc'],
          modifiedDate: '2025-03-16'
        },
        {
          title: 'Проверка актуальности реквизитов',
          content: 'Необходимо проверить актуальность банковских реквизитов контрагента перед подписанием.',
          files: ['presentation.pptx', 'Шаблон_конфиденциальность.doc'],
          modifiedDate: '2025-03-17'
        },
        {
          title: 'Дублирование условий',
          content: 'Обнаружено дублирование условий в пунктах 3.2 и 5.1. Необходимо согласовать изменения с юристом.',
          files: ['Договор_поставки_2025.pdf', 'Правки_юриста.docx'],
          modifiedDate: '2025-03-15'
        },
        {
          title: 'Отсутствует пункт о конфиденциальности',
          content: 'В разделе "Обязательства сторон" отсутствует пункт о конфиденциальности информации. Рекомендую добавить стандартную формулировку из шаблона.',
          files: ['Соглашение о сотрудничестве.docx', 'Шаблон_конфиденциальность.doc'],
          modifiedDate: '2025-03-16'
        },
        {
          title: 'Проверка актуальности реквизитов',
          content: 'Необходимо проверить актуальность банковских реквизитов контрагента перед подписанием.',
          files: ['presentation.pptx', 'Шаблон_конфиденциальность.doc'],
          modifiedDate: '2025-03-17'
        },
        {
          title: 'Дублирование условий',
          content: 'Обнаружено дублирование условий в пунктах 3.2 и 5.1. Необходимо согласовать изменения с юристом.',
          files: ['Договор_поставки_2025.pdf', 'Правки_юриста.docx'],
          modifiedDate: '2025-03-15'
        },
        {
          title: 'Отсутствует пункт о конфиденциальности',
          content: 'В разделе "Обязательства сторон" отсутствует пункт о конфиденциальности информации. Рекомендую добавить стандартную формулировку из шаблона.',
          files: ['Соглашение о сотрудничестве.docx', 'Шаблон_конфиденциальность.doc'],
          modifiedDate: '2025-03-16'
        },
        {
          title: 'Проверка актуальности реквизитов',
          content: 'Необходимо проверить актуальность банковских реквизитов контрагента перед подписанием.',
          files: ['presentation.pptx', 'Шаблон_конфиденциальность.doc'],
          modifiedDate: '2025-03-17'
        },
      ]
    }
  },
  methods: {
    addNewNote() {
      this.notes.unshift({
        title: 'Новая заметка',
        content: 'Введите текст вашей заметки здесь...',
        files: [],
        modifiedDate: new Date().toISOString().split('T')[0]
      });
    },
    formatDate(date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
  }
}
</script>

<style scoped>
.documents__notes {
  width: 320px;
  height: 500px;
  border-radius: 20px;
  border: 1px solid #e6e6e6;
  padding: 15px;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.documents__notes h3 {
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 5px;
  margin: 0;
  color: #333;
}

.notes__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
}

.header__button {
  width: 25px;
  height: 25px;
  border-radius: 5px;
  background-color: #333;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border: none;
  outline: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header__button:hover {
  background-color: #a2a2a2;
}

.notes__date {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.notes__options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.notes__list {
  max-height: 350px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  overflow: scroll;
}
</style>