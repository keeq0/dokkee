<template>
  <section class="about">
    <div class="about__description" ref="descriptionRef">
      <h3 class="about__title">Dockee</h3>
      <p class="about__text">
        Cовременное решение для быстрой и точной проверки юридических документов.
        Наш сервис использует передовые алгоритмы искусственного интеллекта для
        выявления ошибок, рисков и несоответствий в ваших договорах и
        соглашениях. Мы помогаем защитить бизнес от юридических рисков, экономим
        ваше время и средства, позволяя сосредоточиться на развитии.
      </p>
      <div class="about__bottom">
        <ul class="about__stats">
          <li class="stats__item">
            <h4 class="stats__title">Активных клиентов</h4>
            <p class="stats__value">{{ animatedStats.clients }}</p>
          </li>
          <li class="stats__item">
            <h4 class="stats__title">Партнеров</h4>
            <p class="stats__value">{{ animatedStats.partners }}</p>
          </li>
          <li class="stats__item">
            <h4 class="stats__title">Сервис работает</h4>
            <p class="stats__value">{{ animatedStats.years }}</p>
          </li>
          <li class="stats__item">
            <h4 class="stats__title">Точность</h4>
            <p class="stats__value">{{ animatedStats.accuracy }}</p>
          </li>
        </ul>
        <div class="about__documents">
          <p class="stats__value documents">
            {{ animatedStats.documentsChecked }}
          </p>
          <h4 class="stats__title documents__title">
            ДОКУМЕНТОВ ПРОВЕРЕНО НАШИМ СЕРВИСОМ
          </h4>
        </div>
      </div>
      <img src="@/assets/landing/document.png" class="document__photo" />
    </div>

    <div class="about__benefits">
      <div
        v-for="(benefit, index) in benefits"
        :key="index"
        :ref="(el) => setBenefitRef(el, index)"
        :class="[
          'benefit__item',
          index % 2 === 0 ? 'benefit__item--right' : 'benefit__item--left'
        ]"
      >
        <div class="benefit__icon">
          <img :src="benefit.icon" :alt="benefit.title" />
        </div>
        <div class="benefit__content">
          <h4 class="benefit__title">{{ benefit.title }}</h4>
          <p class="benefit__text">{{ benefit.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      benefits: [
        {
          icon: require("@/assets/landing/icons/time.png"),
          title: "Сокращение времени",
          text: "Сокращение времени на экспертизу и согласование контрактов",
        },
        {
          icon: require("@/assets/landing/icons/optimization.png"),
          title: "Оптимизация работы",
          text: "Высвобождает время для стратегических задач вместо рутинной работы",
        },
        {
          icon: require("@/assets/landing/icons/protection.png"),
          title: "Точность алгоритмов",
          text: "Алгоритмы становятся точнее с каждым документом, снижая юридические риски",
        },
        {
          icon: require("@/assets/landing/icons/economy.png"),
          title: "Экономия ресурсов",
          text: "Автоматизированная проверка сокращает затраты на консультации и согласование",
        },
      ],
      animatedStats: {
        clients: "0",
        partners: "0",
        years: "0",
        accuracy: "0%",
        documentsChecked: "0",
      },
      targetStats: {
        clients: 2500,
        partners: 80,
        years: 4,
        accuracy: 99,
        documentsChecked: 40000,
      },
      animationDuration: 1500,
      startTime: null,
      animationFrame: null,
      animationStarted: false,
      observer: null,
      benefitObservers: [],
      benefitElements: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initObservers();
    });
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect();
    if (this.benefitObservers.length) {
      this.benefitObservers.forEach((obs) => obs.disconnect());
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  },
  methods: {
    initObservers() {
      // Наблюдатель за блоком описания
      if (this.$refs.descriptionRef) {
        const descObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.animationStarted) {
                entry.target.classList.add("description-visible");
                this.startAnimation();
                this.animationStarted = true;
                descObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );
        descObserver.observe(this.$refs.descriptionRef);
        this.observer = descObserver;
      }

      // Наблюдатели за каждым преимуществом
      if (this.benefitElements.length) {
        this.benefitElements.forEach((el) => {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("benefit-visible");
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 1 }
          );
          observer.observe(el);
          this.benefitObservers.push(observer);
        });
      }
    },
    setBenefitRef(el, index) {
      if (el) {
        this.benefitElements[index] = el;
      }
    },
    startAnimation() {
      this.startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - this.startTime;
        const progress = Math.min(1, elapsed / this.animationDuration);
        this.updateStats(progress);
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          this.finalizeStats();
        }
      };
      this.animationFrame = requestAnimationFrame(animate);
    },
    updateStats(progress) {
      const clientsVal = Math.floor(this.targetStats.clients * progress);
      this.animatedStats.clients = clientsVal.toString();

      const partnersVal = Math.floor(this.targetStats.partners * progress);
      this.animatedStats.partners = ">" + partnersVal;

      const yearsVal = Math.floor(this.targetStats.years * progress);
      this.animatedStats.years = yearsVal + " года";

      const accuracyVal = Math.floor(this.targetStats.accuracy * progress);
      this.animatedStats.accuracy = accuracyVal + "%";

      const docsVal = Math.floor(this.targetStats.documentsChecked * progress);
      this.animatedStats.documentsChecked = ">" + docsVal;
    },
    finalizeStats() {
      this.animatedStats.clients = this.targetStats.clients.toString();
      this.animatedStats.partners = ">" + this.targetStats.partners;
      this.animatedStats.years = this.targetStats.years + " года";
      this.animatedStats.accuracy = this.targetStats.accuracy + "%";
      this.animatedStats.documentsChecked =
        ">" + this.targetStats.documentsChecked;
    },
  },
};
</script>

<style scoped>
.about {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 25px;
}

.about__description {
  position: relative;
  width: 740px;
  height: 435px;
  border-radius: 40px;
  background-color: #6c67fd;
  padding: 20px 30px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1),
    transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.about__description.description-visible {
  opacity: 1;
  transform: translateY(0);
}

.benefit__item {
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1),
    transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.benefit__item--right {
  transform: translateX(10px);
}

.benefit__item--left {
  transform: translateX(-10px);
}

.benefit__item.benefit-visible {
  opacity: 1;
  transform: translateX(0);
}

h3 {
  font-size: 40px;
  font-weight: 800;
  color: #fff;
  padding-bottom: 15px;
}

.about__text {
  font-size: 16px;
  color: #fff;
  line-height: 150%;
  padding-bottom: 50px;
}

.about__stats {
  width: 350px;
  display: grid;
  grid-template-columns: 210px 140px;
  gap: 35px;
  row-gap: 13.64px;
  list-style: none;
  padding: 0;
}

.about__bottom {
  display: flex;
  justify-content: space-between;
}

.stats__item {
  display: flex;
  flex-direction: column;
}

.stats__title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
}

.stats__value {
  font-size: 40px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
}

.about__documents {
  width: 260px;
  height: 150px;
  border-radius: 20px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
}

.documents {
  color: #6c67fd;
  font-size: 45px;
}

.documents__title {
  text-align: center;
  font-size: 16px;
  color: #6c67fd;
}

.document__photo {
  position: absolute;
  width: 400px;
  height: 400px;
  top: 30px;
  right: 0px;
  transition: transform 0.3s ease;
}

.document__photo:hover {
  animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform-origin: center center;
}

@keyframes shake {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  10% {
    transform: translate(-5px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(5px, 1px) rotate(1deg);
  }
  30% {
    transform: translate(-4px, -1px) rotate(-0.8deg);
  }
  40% {
    transform: translate(4px, 0px) rotate(0.8deg);
  }
  50% {
    transform: translate(-3px, 1px) rotate(-0.5deg);
  }
  60% {
    transform: translate(2px, -1px) rotate(0.5deg);
  }
  70% {
    transform: translate(-1px, 0px) rotate(-0.3deg);
  }
  80% {
    transform: translate(1px, 0px) rotate(0.2deg);
  }
  90% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

.about__benefits {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-top: 20px;
}

.benefit__item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.benefit__icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
}

.benefit__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.benefit__content {
  flex: 1;
}

.benefit__title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #000;
}

.benefit__text {
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  color: #333;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .about {
    width: 90%;
    flex-direction: column;
  }

  .about__description {
    width: 100%;
    height: auto;
    min-height: 435px;
  }

  .about__benefits {
    width: 100%;
  }
}

@media (max-width: 992px) {
  .about__bottom {
    flex-direction: column;
    gap: 20px;
  }

  .about__stats {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }

  .about__documents {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .document__photo {
    display: none;
  }

  .about__description {
    padding: 30px 20px;
  }
}

@media (max-width: 768px) {
  h3 {
    font-size: 40px;
    padding-bottom: 10px;
    text-align: center;
  }

  .about__text {
    font-size: 14px;
    padding-bottom: 30px;
    text-align: center;
  }

  .stats__title {
    font-size: 12px;
  }

  .stats__value {
    font-size: 28px;
  }

  .documents {
    font-size: 45px;
  }

  .documents__title {
    font-size: 12px;
  }

  .benefit__icon {
    width: 50px;
    height: 50px;
  }

  .benefit__title {
    font-size: 16px;
  }

  .benefit__text {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .about__stats {
    gap: 15px;
  }

  .stats__item {
    text-align: center;
  }

  .about__documents {
    height: 120px;
    border-radius: 30px;
  }

  .benefit__item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .about__benefits {
    gap: 20px;
  }
}
</style>