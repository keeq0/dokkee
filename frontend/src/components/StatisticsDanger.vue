<template>
    <div class="statistics__danger">
        <div class="danger__left">
            <p class="danger__number">{{ count }}</p>
            <p class="danger__text">РИСКОВ НАРУШЕНИЙ ОТКЛОНЕНИЙ</p>
        </div>
        <div class="danger__right">
            <img src="@/assets/sad-smile.png" class="danger__icon" />
            <p class="danger__percentage">>10%</p>
        </div>
    </div>
</template>

<script>
export default {
  name: 'StatisticsDanger',
  data() {
    return {
      count: 0,        // текущее отображаемое значение
      target: 425      // итоговое значение
    }
  },
  methods: {
    // Функция easeOutElastic для «пружинящего» эффекта
    easeOutElastic(x) {
      const c4 = (2 * Math.PI) / 3;
      return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
  },
  mounted() {
    const duration = 800;           // длительность анимации в мс
    const startTime = performance.now();

    const animate = now => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOutElastic(progress);
      this.count = Math.round(this.target * eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
}
</script>

<style scoped>
.statistics__danger {
    width: 170px;
    height: 110px;
    border: 1px solid #e6e6e6;
    border-radius: 20px;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
}

.danger__left {
    display: flex;
    flex-direction: column;
}

.danger__number {
    font-size: 30px;
    font-weight: 900;
    color: rgba(255,0,0,0.4);
    margin: 0;
}

.danger__text {
    width: 95px;
    font-size: 12px;
    font-weight: 500;
    margin: 0;
}

.danger__right {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px 0;
}

.danger__icon {
    width: 30px;
}

.danger__percentage {
    font-size: 12px;
    color: #a2a2a2;
    margin: 0;
}
</style>
