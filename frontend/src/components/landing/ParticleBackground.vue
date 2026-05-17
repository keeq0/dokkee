<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script>
export default {
  name: 'ParticleBackground',
  props: {
    particleCount: {
      type: Number,
      default: 80,
    },
    connectDistance: {
      type: Number,
      default: 150,
    },
    mouseConnectDistance: {
      type: Number,
      default: 200,
    },
    color: {
      type: String,
      default: '#6C67FD',
    },
    maxSpeed: {
      type: Number,
      default: 1.2,
    },
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      animationId: null,
      particles: [],
      mouseX: null,
      mouseY: null,
      dpr: window.devicePixelRatio || 1,
      effectiveConnectDistance: this.connectDistance,
      effectiveMouseConnectDistance: this.mouseConnectDistance,
      dotSize: 2,
      lineWidth: 1,
    };
  },
  mounted() {
    this.initCanvas();
    this.initParticles();
    this.addEventListeners();
    this.animate();
  },
  beforeUnmount() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseleave', this.handleMouseLeave);
  },
  watch: {
    connectDistance(newVal) {
      this.effectiveConnectDistance = newVal;
      this.adaptToScreen();
    },
    mouseConnectDistance(newVal) {
      this.effectiveMouseConnectDistance = newVal;
      this.adaptToScreen();
    },
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
    },
    resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.canvas.width = width * this.dpr;
      this.canvas.height = height * this.dpr;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);

      this.adaptToScreen();
      this.initParticles();
    },
    adaptToScreen() {
      const width = window.innerWidth;
      if (width <= 768) {
        this.dotSize = 1.5;
        this.lineWidth = 1;
        this.effectiveConnectDistance = Math.min(100, this.connectDistance);
        this.effectiveMouseConnectDistance = Math.min(150, this.mouseConnectDistance);
      } else {
        this.dotSize = 2.5;
        this.lineWidth = 1.5;
        this.effectiveConnectDistance = this.connectDistance;
        this.effectiveMouseConnectDistance = this.mouseConnectDistance;
      }
    },
    initParticles() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let count = this.particleCount;

      if (window.innerWidth <= 768) {
        count = Math.min(50, count);
      }

      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * this.maxSpeed,
          vy: (Math.random() - 0.5) * this.maxSpeed,
        });
      }
    },
    addEventListeners() {
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mouseleave', this.handleMouseLeave);
    },
    handleResize() {
      this.resizeCanvas();
    },
    handleMouseMove(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    },
    handleMouseLeave() {
      this.mouseX = null;
      this.mouseY = null;
    },
    updateParticles() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      for (let p of this.particles) {
        // Движение
        p.x += p.vx;
        p.y += p.vy;

        // Отражение от границ с лёгким случайным изменением направления
        if (p.x < 0) {
          p.x = 0;
          p.vx = -p.vx + (Math.random() - 0.5) * 0.3;
        }
        if (p.x > width) {
          p.x = width;
          p.vx = -p.vx + (Math.random() - 0.5) * 0.3;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy = -p.vy + (Math.random() - 0.5) * 0.3;
        }
        if (p.y > height) {
          p.y = height;
          p.vy = -p.vy + (Math.random() - 0.5) * 0.3;
        }

        // Ограничение максимальной скорости (чтобы не улетали слишком быстро)
        let speed = Math.hypot(p.vx, p.vy);
        if (speed > this.maxSpeed) {
          p.vx = (p.vx / speed) * this.maxSpeed;
          p.vy = (p.vy / speed) * this.maxSpeed;
        }

        // Очень слабое случайное ускорение для живого движения (без систематического дрейфа)
        p.vx += (Math.random() - 0.5) * 0.03;
        p.vy += (Math.random() - 0.5) * 0.03;

        // Лёгкое затухание, чтобы скорость не росла бесконечно
        p.vx *= 0.998;
        p.vy *= 0.998;
      }
    },
    drawLines() {
      const ctx = this.ctx;
      const particles = this.particles;
      const mouseX = this.mouseX;
      const mouseY = this.mouseY;

      ctx.lineWidth = this.lineWidth;

      // Соединения между частицами
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance < this.effectiveConnectDistance) {
            const opacity = (1 - distance / this.effectiveConnectDistance) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 103, 253, ${opacity})`;
            ctx.stroke();
          }
        }
      }

      // Соединения с курсором
      if (mouseX !== null && mouseY !== null) {
        for (let p of particles) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distance = Math.hypot(dx, dy);

          if (distance < this.effectiveMouseConnectDistance) {
            const opacity = (1 - distance / this.effectiveMouseConnectDistance) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(108, 103, 253, ${opacity})`;
            ctx.stroke();
          }
        }
      }
    },
    drawDots() {
      const ctx = this.ctx;
      for (let p of this.particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 103, 253, 0.8)`;
        ctx.fill();
        // Лёгкое свечение
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.dotSize * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 103, 253, 0.1)`;
        ctx.fill();
      }
    },
    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.updateParticles();
      this.drawLines();
      this.drawDots();
      this.animationId = requestAnimationFrame(this.animate);
    },
  },
};
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  display: block;
}
</style>