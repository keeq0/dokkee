<template>
  <div class="statistics__docs">
    <!-- Фоновая заливка -->
    <div class="liquid-fill" :style="fillStyle">
      <!-- Анимированная волна у верхней границы -->
      <div class="wave"></div>
    </div>
    <!-- Текстовый слой выше заливки -->
    <div class="docs">
      <p class="docs__percentage">{{ percentage }}%</p>
      <p class="docs__text">ДОКУМЕНТОВ</p>
    </div>
    <p class="docs__info">
      соответствуют стандартам качества
    </p>
  </div>
</template>

<script>
export default {
  name: 'StatisticsDocs',
  props: {
    percentage: {
      type: Number,
      required: true
    }
  },
  computed: {
    fillStyle() {
      return {
        height: `${this.percentage}%`,
        backgroundColor: '#6C67FD',
        transition: 'height 0.05s ease-out',
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%'
      }
    }
  }
}
</script>

<style scoped>
.statistics__docs {
  width: 150px;
  height: 250px;
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  background-color: rgba(108,103,253,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
}

.liquid-fill {
  z-index: 1;
  border-radius: 0 0 20px 20px;
}

.wave {
  position: absolute;
  top: -25px;         /* волна выступает над границей */
  left: 0;
  width: 100%;        /* удвоенная ширина для бесшовного скролла */
  height: 40px;       /* высота волны */
  pointer-events: none;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 C20 0 40 20 60 10 C80 0 100 20 120 10 L120 20 L0 20 Z" fill="%236C67FD"/></svg>') repeat-x;
  background-size: 120px 40px;
  animation: wave 6s linear infinite;
  z-index: 2;
}

.docs {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 20px;
  position: relative;
  z-index: 3;
}

.docs__percentage {
  font-size: 40px;
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 3px rgba(0,0,0,0.5);
}

.docs__text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 3px rgba(0,0,0,0.5);
}

.docs__info {
  width: 120px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  position: relative;
  z-index: 3;
}

@keyframes wave {
  0%   { background-position:   0   0; }
  25%  { background-position: -60px 0; }
  50%  { background-position: -120px 0; }
  75%  { background-position: -180px 0; }
  100% { background-position: -240px 0; }
}
</style>
