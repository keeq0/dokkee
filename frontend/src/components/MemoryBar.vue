<template>
  <div class="memory-bar">
    <div class="memory-bar__container">
      <div 
        class="memory-bar__fill" 
        :class="{ 'over-limit': isOverLimit }"
        :style="{ width: fillPercentage + '%' }"
      ></div>
    </div>
    <div class="memory-bar__info">
    <div>
      <span class="memory-bar__value">{{ animatedMemory }}</span>
      <span class="memory-bar__total"> / 2 ГБ</span>
      </div>
      <span class="memory-bar__label">Использование памяти</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    documents: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      fillPercentage: 0,
      animatedMemory: '0 МБ',
      maxMemory: 2048, // 2 ГБ в МБ
      animationDuration: 500,
      animationDelay: 500,
      barDelay: 200,
      animationFrameId: null
    }
  },
  computed: {
    usedMemoryMB() {
      if (!this.documents || !Array.isArray(this.documents)) return 0;
      
      return this.documents.reduce((total, doc) => {
        if (!doc?.size) return total;
        
        const sizeStr = String(doc.size).replace(',', '.');
        const size = parseFloat(sizeStr) || 0;
        const unit = String(doc.size).replace(/[^а-яА-Яa-zA-Z]/g, '').toLowerCase();
        
        switch(unit) {
          case 'тб':
          case 'tb':
            return total + size * 1024 * 1024;
          case 'гб':
          case 'gb':
            return total + size * 1024;
          case 'мб':
          case 'mb':
            return total + size;
          case 'кб':
          case 'kb':
            return total + size / 1024;
          case 'байт':
          case 'byte':
          case 'b':
            return total + size / (1024 * 1024);
          case 'бит':
          case 'bit':
          case 'б':
            return total + size / (8 * 1024 * 1024);
          default:
            return total + size;
        }
      }, 0);
    },
    isOverLimit() {
      return this.usedMemoryMB > this.maxMemory;
    },
    formattedUsedMemory() {
      return this.formatMemory(this.usedMemoryMB);
    }
  },
  mounted() {
    this.startAnimation();
  },
  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  watch: {
    documents: {
      deep: true,
      handler() {
        this.startAnimation();
      }
    }
  },
  methods: {
    formatMemory(mb) {
      if (mb >= 1024 * 1024) {
        return `${(mb / (1024 * 1024)).toFixed(2)} ТБ`;
      }
      if (mb >= 1024) {
        return `${(mb / 1024).toFixed(2)} ГБ`;
      }
      if (mb < 1) {
        const kb = mb * 1024;
        if (kb < 1) {
          const bytes = kb * 1024;
          if (bytes < 1) {
            const bits = bytes * 8;
            return `${bits.toFixed(2)} бит`;
          }
          return `${bytes.toFixed(2)} Байт`;
        }
        return `${kb.toFixed(2)} КБ`;
      }
      return `${mb.toFixed(2)} МБ`;
    },
    startAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      setTimeout(() => {
        this.animateValues();
      }, this.animationDelay);
    },
    animateValues() {
      const targetPercentage = Math.min((this.usedMemoryMB / this.maxMemory) * 100, 100);
      const targetMemory = this.usedMemoryMB;
      const startTime = performance.now();
      let currentMemory = 0;
      
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / this.animationDuration, 1);
        
        // Анимация цифр
        currentMemory = progress * targetMemory;
        this.animatedMemory = this.formatMemory(currentMemory);
        
        // Анимация прогресс-бара с задержкой
        if (elapsedTime > this.barDelay) {
          const barProgress = Math.min((elapsedTime - this.barDelay) / (this.animationDuration - this.barDelay), 1);
          this.fillPercentage = barProgress * targetPercentage;
        }
        
        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          this.animatedMemory = this.formattedUsedMemory;
          this.fillPercentage = targetPercentage;
        }
      };
      
      this.fillPercentage = 0;
      this.animatedMemory = '0 МБ';
      this.animationFrameId = requestAnimationFrame(animate);
    }
  }
}
</script>

<style scoped>
.memory-bar {
  width: 320px;
}

.memory-bar__container {
  height: 25px;
  background-color: #d9d9d9;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.memory-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #6C67FD;
  transition: background-color 0.3s ease;
}

.memory-bar__fill.over-limit {
  background-color: #ff4d4f;
}

.memory-bar__info {
  display: flex;
  margin-top: 5px;
  justify-content: space-between;
}

.memory-bar__value {
  font-size: 12px;
  color: #a2a2a2;
  text-align: left;
}

.memory-bar__total {
  font-size: 12px;
  color: #a2a2a2;
}

.memory-bar__label {
  font-size: 12px;
}
</style>