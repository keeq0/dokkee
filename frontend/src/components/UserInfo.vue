<template>
    <div class="header__user">
      <img src="@/assets/user.png" class="header__avatar" alt="Профиль" />
      <div class="header__userinfo">
        <strong>{{ userName + ' ' + surname }}</strong>
        <div class="header__subscription">
          <p class="header__plan">{{ subscription }}</p>
          <div class="header__balance">
            <p class="header__balance-value">{{ balance }}</p>
            <img src="@/assets/balance.svg" class="header__icon" alt="Баланс" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserInfo',
    props: {
      userName: String,
      surname: String,
      subscription: String,
      balance: Number
    }
  }
  </script>
  
  <style scoped>
  .header__user {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .header__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }
  .header__userinfo {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .header__subscription {
    display: flex;
    gap: 10px;
    font-size: 14px;
    color: #a2a2a2;
  }
  .header__plan:hover {
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;
  }
  .header__balance {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .header__balance-value {
    margin: 0;
  }

  .strong {
    font-size: 14px;
  }
  </style>
  