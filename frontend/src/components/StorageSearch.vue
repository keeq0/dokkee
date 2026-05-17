<template>
    <div class="storage__search">
        <input class="search__input" placeholder="Поиск файлов" type="text"/>
        <img src="@/assets/search_icon.png" class="search__icon" />
    </div>
</template>
<script>
export default {
    
}
</script>
<style>
    
.storage__header {
  display: flex;
  gap: 10px;
}

.storage__search {
  width: 200px;
  height: 30px;
  background-color: #f4f4f4;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.search__input {
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