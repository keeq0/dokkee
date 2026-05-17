<template>
  <div class="documents__checked">
    <div class="checked__right">
      <h3>Проверено документов</h3>
      <p>Сервис вместе с вами проанализировал большое количество документов</p>
    </div>
    <div class="checked__left">
      <p class="documents-number">{{ count }}</p>
      <p class="documents__text">документов</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentsChecked',
  data() {
    return {
      count: 0,    // текущее анимированное значение
      target: 927  // итоговое значение
    }
  },
  mounted() {
    const duration = 500  // длительность анимации в миллисекундах (быстрее)
    const startTime = performance.now()

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      this.count = Math.round(this.target * progress)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }
}
</script>

<style scoped>
.documents__checked {
  width: 350px;
  height: 125px;
  border-radius: 20px;
  border: 1px solid #e6e6e6;
  padding: 15px;
  display: flex;
  align-items: flex-end;
}

.checked__right {
  width: 250px;
}

.checked__right h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.checked__right p {
  font-size: 13px;
  font-weight: 300;
  line-height: 150%;
}

.checked__left {
  text-align: center;
}

.documents-number {
  font-size: 40px;
  font-weight: 900;
  color: #6C67FD;
  margin: 0;
}

.documents__text {
  margin-top: -5px;
  font-size: 10px;
  font-weight: 400;
  color: #a2a2a2;
  margin: 0;
  
}
</style>
