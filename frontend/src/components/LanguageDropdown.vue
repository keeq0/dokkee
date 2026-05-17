<template>
    <div
      class="language-dropdown"
      @mouseenter="isOpen = true"
      @mouseleave="isOpen = false"
    >
      <button class="header__language">
        {{ currentLanguage }}
      </button>
      <ul class="language-dropdown__list" :class="{ open: isOpen }">
        <li
          v-for="lang in languages"
          :key="lang"
          @click="$emit('change-language', lang)"
          :class="['language-dropdown__item', { selected: lang === currentLanguage }]"
        >
          {{ lang }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LanguageDropdown',
    props: {
      currentLanguage: String,
      languages: Array
    },
    data() {
      return {
        isOpen: false
      }
    }
  }
  </script>
  
  <style scoped>
  .language-dropdown {
    position: relative;
    display: inline-block;
  }
  .header__language {
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 500;
    color: #a2a2a2;
    cursor: pointer;
    transition: color 0.2s;
    padding: 15px 10px;
  }
  .header__language:hover {
    color: #000;
  }
  .language-dropdown__list {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border-radius: 8px;
    list-style: none;
    padding: 0;
    width: 80px;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.5s ease;
    z-index: 1000;
    background-color: none;
    
  }
  .language-dropdown__list.open {
    max-height: 300px;
  }
  .language-dropdown__item {
    padding: 10px;
    cursor: pointer;
    font-size: 14px;
    text-align: center;
    transition: background 0.2s;
  }
  .language-dropdown__item:hover {
    background-color: #f4f4f4;
  }
  .language-dropdown__item.selected {
    font-weight: bold;
  }
  </style>
  