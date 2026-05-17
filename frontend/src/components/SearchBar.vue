<template>
    <div class="header__search">
      <input class="header__input" placeholder="Поиск" />
      <img
        src="@/assets/search.svg"
        class="header__icon header__icon--search"
        alt="Поиск"
      />
    </div>
  </template>
  
  <script>
  export default {
    name: 'SearchBar'
  }
  </script>
  
  <style scoped>
  .header__search {
    width: 270px;
    height: 40px;
    background-color: #f4f4f4;
    border-radius: 30px;
    padding: 5px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header__input {
    background: none;
    border: none;
    outline: none;
    width: 90%;
  }
  .header__icon {
    width: 20px;
    height: 20px;
  }
  .header__icon--search {
    cursor: pointer;
  }
  </style>
  