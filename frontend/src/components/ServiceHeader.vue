<template>
    <header class="header">
      <div class="header__left">
        <a href="#" class="header__logo-link">
          <div class="header__logo-rectangle">
            <div class="header__logo-rectangle--inside"></div>
          </div>
          <p>Dockee</p>
        </a>
        <div class="header__message">
          <strong>Добрый день, {{ userName }}!</strong>
          <p class="header__subtext">Мы рады, что вы здесь</p>
        </div>
      </div>
  
      <div class="header__right">
        <LanguageDropdown
          :current-language="language"
          :languages="languages"
          @change-language="selectLanguage"
        />
        <SearchBar />
        <NotificationPanel
          :open="isNotificationOpen"
          @toggle="toggleNotifications"
        />
        <UserInfo
          :user-name="userName"
          :surname="surname"
          :subscription="subscription"
          :balance="balance"
        />
      </div>
    </header>
  </template>
  
  <script>
  import LanguageDropdown from './LanguageDropdown.vue'
  import SearchBar from './SearchBar.vue'
  import NotificationPanel from './NotificationPanel.vue'
  import UserInfo from './UserInfo.vue'
  
  export default {
    name: 'ServiceHeader',
    components: {
      LanguageDropdown,
      SearchBar,
      NotificationPanel,
      UserInfo
    },
    data() {
      return {
        userName: 'Сергей',
        surname: 'Мякотных',
        language: 'RU',
        languages: ['RU', 'EN', 'DE', 'FR', 'ES'],
        subscription: 'Продвинутая',
        balance: 15,
        isNotificationOpen: false
      }
    },
    methods: {
      selectLanguage(lang) {
        this.language = lang
      },
      toggleNotifications() {
        this.isNotificationOpen = !this.isNotificationOpen
      }
    }
  }
  </script>
  
  <style scoped>
  .header {
    margin: 0 auto;
    width: 1250px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header__left {
    display: flex;
    align-items: center;
    gap: 30px;
  }
  
  .header__logo {
    height: 22px;
  }
  
  .header__message {
    display: flex;
    flex-direction: column;
  }
  
  .header__subtext {
    font-size: 12px;
    color: #a2a2a2;
    font-weight: 500;
    padding-top: 5px;
  }
  
  .header__right {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .header__logo-rectangle {
    width: 26px;
    height: 26px;
    background-color: #6C67FD;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header__logo-rectangle--inside {
    width: 10px;
    height: 10px;
    background-color: #FFF;
    border-radius: 50px;
  }

  .header__logo-link {
    font-size: 24px;
    font-weight: 700;
    color: #000;
    display: flex;
    align-items: center;
    gap: 5px;

  }
  </style>
  