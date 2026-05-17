<template>
    <div class="header__notification-wrapper">
      <button
        class="header__notification"
        :class="{ 'header__notification--active': open }"
        @click="$emit('toggle')"
      >
        <img src="@/assets/notification.svg" class="header__icon" alt="Уведомления" />
        <span class="notification__badge" v-if="notifications.length > 0">
          {{ notifications.length }}
        </span>
      </button>
  
      <transition name="notification__fade">
        <div v-if="open" class="notification__panel">
          <p class="notification__title">Новые уведомления!</p>
  
          <div
            class="notification__item"
            v-for="(note, i) in notifications"
            :key="i"
          >
            <div class="notification__content">
              <img :src="note.icon" class="notification__icon" alt="" />
              <p class="notification__text" v-html="note.text" />
              <div class="notification__dot"></div>
            </div>
            <strong class="notification__time">{{ note.time }}</strong>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotificationPanel',
    props: {
      open: Boolean
    },
    data() {
      return {
        notifications: [
          {
            icon: require('@/assets/bad_notification.png'),
            text: 'Срок вашей подписки <strong>закончился</strong>. Для того, чтобы продлить действие подписки, перейдите в личный ка..',
            time: '17 минут назад'
          },
          {
            icon: require('@/assets/info_notification.png'),
            text: 'Внимание! Срок вашей подписки заканчивается <strong>28.03.2025</strong>. Для того, чтобы его продлить, перейдите в л..',
            time: '3 дня назад'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .header__notification-wrapper {
    position: relative;
  }
  
  .header__notification {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f4f4f4;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }
  
  .header__notification:hover,
  .header__notification--active {
    background-color: #d9d9d9;
  }
  
  .header__icon {
    width: 20px;
    height: 20px;
  }
  
  .notification__badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #6c67fd;
    color: white;
    font-size: 10px;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .notification__fade-enter-active,
  .notification__fade-leave-active {
    transition: all 0.25s ease;
  }
  .notification__fade-enter-from,
  .notification__fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
  .notification__fade-enter-to,
  .notification__fade-leave-from {
    opacity: 1;
    transform: translateY(0);
  }
  
  .notification__panel {
    position: absolute;
    top: 130%;
    right: 0;
    width: 325px;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 2px 3px 3px rgba(0, 0, 0, 0.02);
    padding: 16px;
    z-index: 999;
    border: 1px solid #e6e6e6;
  }
  
  .notification__title {
    font-size: 16px;
    font-weight: 600;
  }
  
  .notification__item {
    position: relative;
    padding-bottom: 10px;
    border-bottom: 1px solid #e6e6e6;
    margin-top: 20px;
  }
  
  .notification__item:last-child {
    border-bottom: none;
  }
  
  .notification__content {
    display: flex;
    gap: 7px;
    align-items: center;
    position: relative;
  }
  
  .notification__icon {
    width: 40px;
    height: 40px;
  }
  
  .notification__text {
    font-size: 11px;
    width: 220px;
  }
  
  .notification__dot {
    width: 6px;
    height: 6px;
    border-radius: 10px;
    background: #6c67fd;
  }
  
  .notification__time {
    color: #6c67fd;
    font-size: 11px;
    padding: 5px 47px;
  }
  </style>
  