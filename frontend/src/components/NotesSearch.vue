<template>
  <div class="notes__search">
    <input placeholder="Поиск" type="text" class="search__input" />
    <img src="@/assets/search_icon.png" class="search__icon" />
  </div>
</template>

<script>
export default {
  name: 'NotesSearch'
}
</script>

<style scoped>
.notes__search {
  width: 130px;
  height: 30px;
  border-radius: 10px;
  background-color: #f4f4f4;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search__input {
  width: 100%;
  background-color: transparent;
  outline: none;
  border: none;
  color: #a2a2a2;
  font-size: 10px;
}

.search__icon {
  width: 15px;
  height: 15px;
}
</style>