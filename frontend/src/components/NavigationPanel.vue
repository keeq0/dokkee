<template>
  <ul class="navigation">
    <li
      class="navigation__item"
      :class="{ active: activeNav === 'Главная' }"
      @click="setActive('Главная')"
    >
      <img src="@/assets/main.svg" class="navigation__icon" alt="" />
      <p class="navigation__text">Главная</p>
    </li>
    <li
      class="navigation__item"
      :class="{ active: activeNav === 'Документы' }"
      @click="setActive('Документы')"
    >
      <img src="@/assets/documents.svg" class="navigation__icon" alt="" />
      <p class="navigation__text">Документы</p>
    </li>
    <li
      class="navigation__item"
      :class="{ active: activeNav === 'Аналитика' }"
      @click="setActive('Аналитика')"
    >
      <img src="@/assets/analysis.svg" class="navigation__icon" alt="" />
      <p class="navigation__text">Аналитика</p>
    </li>
    <li class="line" />
    <li
      class="navigation__item"
      :class="{ active: activeNav === 'Аккаунт' }"
      @click="setActive('Аккаунт')"
    >
      <img src="@/assets/account.svg" class="navigation__icon" alt="" />
      <p class="navigation__text">Аккаунт</p>
    </li>
    <li
      class="navigation__item"
      :class="{ active: activeNav === 'Выйти' }"
      @click="setActive('Выйти')"
    >
      <img src="@/assets/exit.svg" class="navigation__icon" alt="" />
      <p class="navigation__text">Выйти</p>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'NavigationPanel',
  data() {
    return {
      activeNav: 'Главная'
    }
  },
  created() {
    // При загрузке читаем сохранённый пункт из localStorage
    const saved = localStorage.getItem('activeNav')
    if (saved) {
      this.activeNav = saved
    }
  },
  methods: {
    setActive(item) {
      this.activeNav = item
      // Сохраняем выбор пользователя
      localStorage.setItem('activeNav', item)
      // Навигация по роутеру
      switch (item) {
        case 'Главная':
          this.$router.push({ name: 'MainPage' })
          break
        case 'Документы':
          this.$router.push({ name: 'DocumentPage' })
          break
        case 'Аналитика':
          this.$router.push({ name: 'AnalysisPage' })
          break
        case 'Аккаунт':
          this.$router.push({ name: 'AccountPage' })
          break
        case 'Выйти':
          // Здесь можно добавить логику выхода
          break
      }
    }
  }
}
</script>

<style scoped>
.navigation {
  width: 130px;
  height: 500px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
}

.navigation__item {
  width: 130px;
  height: 40px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 0 10px;
  transition: 0.2s;
}

.navigation__icon {
  width: 20px;
  height: 20px;
  transition: 0.1s;
}

.navigation__text {
  color: #a2a2a2;
  transition: 0.2s;
  font-size: 12px;
  margin: 0;
}

.navigation__item:hover {
  background-color: #6C67FD;
}

.navigation__item:hover .navigation__text {
  color: #FFF;
}

.navigation__item:hover .navigation__icon {
  filter: contrast(50%);
}

.navigation__item.active {
  background-color: #6C67FD;
}

.navigation__item.active .navigation__text {
  color: #FFF;
}

.navigation__item.active .navigation__icon {
  filter: contrast(50%);
}

.line {
  width: 100%;
  height: 1px;
  background-color: #D9D9D9;
  margin: 5px 0;
  list-style: none;
}

.navigation__item:hover .navigation__icon {
  filter: contrast(50);
}

.navigation__item.active .navigation__icon {
  filter: contrast(50);
}
</style>
