<template>
  <section class="subscription">
    <div class="subscription__info">
      <h2 class="subscription__uptitle">ВАРИАНТЫ СОТРУДНИЧЕСТВА</h2>
      <h1 class="subscription__title">Наши гибкие тарифные планы</h1>
      <p class="subscription__text">
        Оцените преимущества автоматизированной проверки юридических документов. Выбирайте оптимальный тариф в зависимости от масштаба вашего бизнеса и уровня поддержки, необходимого вашей команде.
      </p>
      <div class="subscription__types">
        <button 
          :class="['type__button', { active: activeTab === 'individual' }]"
          @click="activeTab = 'individual'"
        >
          Индивидуальные
        </button>
        <button 
          :class="['type__button', { active: activeTab === 'corporate' }]"
          @click="activeTab = 'corporate'"
        >
          Корпоративная
        </button>
      </div>
    </div>

    <div class="subscription__slider">
      <ul class="subscription__list">
        <li 
          v-for="(plan, idx) in currentPlans" 
          :key="idx"
          :class="[
            'subscription__item',
            { 'popular': plan.isPopular },
            { 'reversed': plan.isReversed }
          ]"
        >
          <div v-if="plan.isPopular" class="popular-badge">Популярно</div>
          <h3 class="item__title">{{ plan.title }}</h3>
          <h4 class="item__subtitle">{{ plan.subtitle }}</h4>
          <p class="item__price">{{ plan.price }}</p>
          <ul class="settings__list">
            <li v-for="(feature, fIdx) in plan.features" :key="fIdx" class="settings__item">
              <img src="@/assets/landing/sub-setting-icon.png" class="settings__icon" />
              {{ feature }}
            </li>
          </ul>
          <p class="subscription__comment">{{ plan.comment }}</p>
          <div class="subscription__footer">
            <button class="subscription__button">Выбрать</button>
            <img src="@/assets/landing/sub-info.png" class="info-icon" />
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SubscriptionSection',
  data() {
    return {
      activeTab: 'individual',
      individualPlans: [
        {
          title: 'ТЕСТОВАЯ',
          subtitle: 'Тестирование сервиса',
          price: 'Бесплатно',
          features: ['1 проверка / день', '1 устройство', '10 Мб хранилища'],
          comment: '+ доп. проверка за просмотр короткой рекламы',
          isPopular: false,
          isReversed: false,
        },
        {
          title: 'БАЗОВАЯ',
          subtitle: 'Тестирование сервиса',
          price: '799 ₽ / мес',
          features: ['10 проверок / день', '2 устройства', '900 Мб хранилища'],
          comment: '',
          isPopular: true,
          isReversed: false,
        },
        {
          title: 'ПРОДВИНУТАЯ',
          subtitle: 'Тестирование сервиса',
          price: '1799 ₽ / мес',
          features: ['50 проверок / день', '3 устройства', '2 Гб хранилища'],
          comment: '',
          isPopular: false,
          isReversed: true,
        },
      ],
      corporatePlans: [
        {
          title: 'ЛАЙТ',
          subtitle: 'Для малого бизнеса',
          price: '4990 ₽ / мес',
          features: ['100 проверок / день', '5 устройств', '10 Гб хранилища'],
          comment: '',
          isPopular: false,
          isReversed: false,
        },
        {
          title: 'СТАНДАРТ',
          subtitle: 'Для среднего бизнеса',
          price: '12900 ₽ / мес',
          features: ['500 проверок / день', '15 устройств', '50 Гб хранилища'],
          comment: 'Онboarding и обучение команды',
          isPopular: true,
          isReversed: false,
        },
        {
          title: 'ПРЕМИУМ',
          subtitle: 'Для крупных организаций',
          price: '29900 ₽ / мес',
          features: ['∞ проверок', '∞ устройств', '500 Гб хранилища'],
          comment: 'Интеграция с CRM и ERP',
          isPopular: false,
          isReversed: true,
        },
      ],
    };
  },
  computed: {
    currentPlans() {
      return this.activeTab === 'individual' ? this.individualPlans : this.corporatePlans;
    },
  },
};
</script>

<style scoped>
.subscription {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 30px;
}

.subscription__uptitle {
  font-size: 14px;
  font-weight: 600;
  color: #a2a2a2;
  padding-bottom: 13px;
}

.subscription__title {
  font-size: 40px;
  font-weight: bold;
  padding-bottom: 20px;
}

.subscription__info {
  width: 420px;
}

.subscription__text {
  padding-bottom: 30px;
  line-height: 150%;
}

.subscription__types {
  display: flex;
  gap: 15px;
}

.type__button {
  width: 200px;
  height: 50px;
  border-radius: 15px;
  outline: none;
  border: 1px solid #6C67FD;
  background-color: #FFF;
  color: #6C67FD;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.type__button.active {
  background-color: #6C67FD;
  color: #FFF;
}

.type__button:hover {
  background-color: #6C67FD;
  color: #FFF;
}

/* Слайдер для мобильных устройств */
.subscription__slider {

  flex: 1;
}

.subscription__list {
  display: flex;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.subscription__item {
  width: 240px;
  flex-shrink: 0;
  border-radius: 30px;
  box-shadow: 0 2px 3px 2px rgba(0, 0, 0, 0.1);
  padding: 15px;
  background-color: #FFF;
  position: relative;
  transition: all 0.2s;
}

/* Популярная карточка */
.subscription__item.popular {
  border: 2px solid #6C67FD;
  box-shadow: 0 4px 12px rgba(108, 103, 253, 0.2);
  position: relative;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #6C67FD;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 16px;
  border-radius: 50px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Реверсивная карточка (синяя) */
.subscription__item.reversed {
  background-color: #6C67FD;
  color: white;
  box-shadow: 0 6px 14px rgba(108, 103, 253, 0.3);
}

.subscription__item.reversed .item__title,
.subscription__item.reversed .item__subtitle,
.subscription__item.reversed .item__price,
.subscription__item.reversed .settings__item,
.subscription__item.reversed .subscription__comment,
.subscription__item.reversed .subscription__button {
  color: white;
}

.subscription__item.reversed .settings__item {
  border-bottom-color: rgba(255, 255, 255, 0.3);
}

.subscription__item.reversed .settings__icon {
  filter: brightness(0) invert(1);
}

.subscription__item.reversed .subscription__button {
  background-color: white;
  color: #6C67FD;
}

.subscription__item.reversed .info-icon {
  filter: brightness(0) invert(1);
}

.item__title {
  font-size: 18px;
  padding-bottom: 10px;
  font-weight: bold;
}

.item__subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #a2a2a2;
  padding-bottom: 30px;
}

.subscription__item.reversed .item__subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.item__price {
  font-size: 28px;
  font-weight: bold;
  color: #6C67FD;
  padding-bottom: 15px;
}

.settings__list {
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
}

.settings__item {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  padding: 10px 0;
  border-bottom: 1px solid #e6e6e6;
}

.settings__icon {
  width: 10px;
  height: 10px;
}

.subscription__comment {
  font-size: 12px;
  color: #a2a2a2;
  text-align: center;
  padding-bottom: 10px;
  height: 40px;
}

.subscription__button {
  width: 175px;
  height: 30px;
  background-color: #6C67FD;
  border-radius: 50px;
  color: #fff;
  font-weight: 500;
  font-size: 12px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.subscription__button:hover {
  opacity: 0.9;
  transform: scale(0.98);
}

.subscription__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-icon {
  width: 15px;
  height: 15px;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .subscription {
    width: 90%;
  }
}

@media (max-width: 992px) {
  .subscription {
    flex-direction: column;
    gap: 30px;
  }

  .subscription__info {
    width: 100%;
  }

  .subscription__list {
    gap: 20px;
  }

  .subscription__item {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .subscription__title {
    font-size: 32px;
  }

  .subscription__types {
    justify-content: center;
    flex-wrap: wrap;
  }

  .type__button {
    width: 170px;
    height: 45px;
    font-size: 14px;
  }

  .subscription__slider {
    width: 100%;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 10px;
  }

  .subscription__list {
    width: max-content;
    gap: 20px;
    scroll-snap-type: x mandatory;
  }

  .subscription__item {
    scroll-snap-align: start;
    width: 260px;
  }
}

@media (max-width: 480px) {
  .subscription__uptitle {
    font-size: 12px;
  }

  .subscription__title {
    font-size: 26px;
  }

  .type__button {
    width: 140px;
    height: 40px;
    font-size: 13px;
  }

  .subscription__item {
    width: 240px;
    padding: 12px;
  }

  .item__price {
    font-size: 24px;
  }

  .subscription__button {
    width: 150px;
  }
}
</style>