<template>
  <div class="file-list">
    <div class="file-list__header">
      <div class="header__path">
        <img src="@/assets/home.svg" class="path__icon" alt="Home" />
        <p class="path">
          <span>Home</span> / <span>Работа</span> / <strong>Университет</strong>
        </p>
      </div>
      <div class="header__search">
        <input type="text" class="search" placeholder="Поиск файлов" />
        <img src="@/assets/search.svg" class="search__icon" alt="Search" />
      </div>
    </div>  
    <ul class="file-list__list">
      <li class="list__item">
        <img src="@/assets/folder.svg" class="file__icon" alt="Folder" />
        <p class="file__name">Работа</p> 
      </li>
      <li class="list__item">
        <img src="@/assets/folder.svg" class="file__icon" alt="Folder" />
        <p class="file__name">OZON Банк</p> 
      </li>
      <li class="list__item">
        <img src="@/assets/folder.svg" class="file__icon" alt="Folder" />
        <p class="file__name">Документы</p> 
      </li>
      <li class="list__item">
        <img src="@/assets/folder.svg" class="file__icon" alt="Folder" />
        <p class="file__name">Контракты</p> 
      </li>
      <li class="list__item">
        <img src="@/assets/folder.svg" class="file__icon" alt="Folder" />
        <p class="file__name">Отчёты</p> 
      </li>
    </ul>
    <div class="file-list__footer">
      <p class="footer__files">Выбрано файлов: 0</p>
      <button class="footer__button">
        Загрузить
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadFilesList'
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.file-list__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
}

.footer__files {
  font-size: 12px;
}

.footer__button {
  width: 100px;
  height: 25px;
  cursor: not-allowed;
  border: none;
  outline: none;
  border-radius: 8px;
  font-weight: 600;
  background: rgba(108,103,253, 0.2);
  color: #fff;
}

.file-list {
  position: absolute;
  width: 450px;
  height: fit-content;
  background-color: #FFF;
  border: 1px solid #E6E6E6;
  border-radius: 20px;
  padding: 10px 15px;
  z-index: 1000;
  animation: fadeIn 0.15s ease-in-out;
}

.file-list__header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}

.header__path {
  display: flex;
  align-items: center;
  gap: 5px;
}

.path__icon {
  width: 10px;
  height: 10px;
}

.path {
  font-size: 10px;
  font-weight: 600;
  color: #A2A2A2;
}

strong {
  color: #000;
}

span:hover {
  color: #000;
  cursor: pointer;
}

.header__search {
  height: 25px;
  background-color: #f4f4f4;
  border-radius: 10px;
  display: flex;
  gap: 5px;
  padding: 0 10px;
  align-items: center;
}

.search {
  outline: none;
  border: none;
  color: #000;
  font-size: 12px;
  background-color: #f4f4f4;
}

.search__icon {
  width: 10px;
  height: 10px;
}

.file-list__list {
  padding: 5px 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 30px;
}

.list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
}

.list__item:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

.file__icon {
  height: 25px;
}

.file__name {
  font-size: 14px;
  font-weight: 500;
}
</style>
