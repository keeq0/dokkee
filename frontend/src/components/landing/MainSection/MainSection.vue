<template>
  <section
    id="service"
    class="service"
    :class="{ animate: isAnimated }"
  >
    <div class="service__description">
      <div class="service__badge">
        <img
          src="@/assets/landing/icons/service_stars.png"
          class="icon__stars"
          alt="Звёзды"
        />
        ИИ-технологии нового поколения
      </div>
      <h1 class="service__title">
        Сервис анализа и проверки документов
        <span class="color-blue">с помощью ИИ</span>
      </h1>
      <h2 class="service__subtitle">
        Мгновенная проверка документов с минимальными затратами. Сосредоточьтесь
        на росте бизнеса, а безопасность оставьте нам
      </h2>
      <div class="service__bottom">
        <button class="service__button">
          <img
            src="@/assets/landing/icons/service_button.png"
            class="icon"
            alt="Начать"
          />
          Начать пользоваться
        </button>
        <p class="service__hint">
          Попробуйте <strong class="free">бесплатно</strong>
        </p>
      </div>
    </div>
    <img
      src="@/assets/landing/service_photo.svg"
      class="service__photo"
      alt="Документы"
    />
  </section>
</template>

<script>
export default {
  name: "MainSection",
  data() {
    return {
      isAnimated: false,
    };
  },
  mounted() {
    setTimeout(() => {
      this.isAnimated = true;
    }, 50);
  },
};
</script>

<style scoped>
.service {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service__description {
  width: 700px;
}

.service__badge,
.service__title,
.service__subtitle,
.service__bottom {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1),
    transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.service__badge {
  transition-delay: 0s;
}
.service__title {
  transition-delay: 0.1s;
}
.service__subtitle {
  transition-delay: 0.2s;
}
.service__bottom {
  transition-delay: 0.3s;
}

.service__photo {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.2s,
    transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.2s;
}

.service.animate .service__badge,
.service.animate .service__title,
.service.animate .service__subtitle,
.service.animate .service__bottom {
  opacity: 1;
  transform: translateY(0);
}

.service.animate .service__photo {
  opacity: 1;
  transform: translateY(0);
}

.service__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #e6e6e6;
  border-radius: 50px;
  padding: 4px 16px;
  margin-bottom: 10px;
  background: white;
  color: #6c67fd;
  font-size: 11px;
  font-weight: 700;
}

.icon__stars {
  width: 15px;
  height: 15px;
}

.service__title {
  font-size: 40px;
  font-weight: 700;
  color: #000;
}

.color-blue {
  color: #6c67fd;
}

.service__subtitle {
  font-size: 18px;
  font-weight: 300;
  color: #000;
  padding-bottom: 50px;
  margin: 0;
}

.service__bottom {
  display: flex;
  align-items: center;
  gap: 15px;
}

.service__button {
  width: 280px;
  height: 50px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  outline: none;
  border: none;
  background-color: #6c67fd;
  transition: background-color 0.2s;
}

.service__button:hover {
  background-color: #4d48d8;
  cursor: pointer;
}

.icon {
  width: 18px;
  height: 18px;
}

.service__hint {
  font-size: 14px;
  color: #a2a2a2;
}

.free {
  padding: 5px;
  border: 1px solid #e6e6e6;
  color: #a2a2a2;
  border-radius: 50px;
  backdrop-filter: blur(1px);
  background-color: rgba(240,240,240,0.5)
}

.service__photo {
  animation: float 3s ease-in-out infinite;
  max-width: 400px;
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 1200px) {
  .service {
    width: 90%;
    flex-direction: column;
    text-align: center;
  }
  .service__description {
    width: 100%;
  }
  .service__badge {
    justify-content: center;
  }
  .service__bottom {
    justify-content: center;
  }
  .service__photo {
    margin-top: 40px;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .service__title {
    font-size: 26px;
  }
  
  .service__subtitle {
    font-size: 16px;
    padding-bottom: 30px;
  }
  
  .service__button {
    width: 220px;
    height: 45px;
    font-size: 14px;
  }
  
  .service__photo {
    max-width: 250px;
  }
  
  .service__hint {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .service__title {
    font-size: 26px;
  }
  
  .service__subtitle {
    font-size: 14px;
    padding-bottom: 25px;
  }
  
  .service__button {
    width: 200px;
    height: 42px;
    font-size: 13px;
  }
  
  .service__photo {
    max-width: 200px;
  }
  
  .service__bottom {
    flex-direction: column;
    gap: 12px;
  }

  .icon {
    width: 15px;
    height: 15px;
  }
}
</style>