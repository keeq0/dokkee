<template>
  <div class="analysis__documents">
    <div class="documents">
      <div class="documents__header">
        <img src="@/assets/home.svg" class="header__icon" />
        <p class="path">
          <span>Home</span> / <span>Работа</span> / <span class="selected">Университет</span>
        </p>
      </div>
      <ul class="documents__list">
        <li 
          v-for="(doc, index) in documents" 
          :key="index" 
          class="document"
          :class="{ 'active': selectedDocument && selectedDocument.name === doc.name }"
          @click="selectDocument(doc)"
          :style="{ 'animation-delay': `${index * 0.1}s` }"
        >
          <img src="@/assets/folder.png" class="document__icon" />
          <div class="document__name">
            <p class="name">{{ doc.name }}</p>
            <div class="color" :class="doc.color"></div>
          </div>
        </li>
      </ul>
    </div>
    <transition name="fade">
      <div class="documents__info" v-if="selectedDocument">
        <div class="info__header">
          <h3>{{ selectedDocument.name }}</h3>
          <p class="info__size">{{ selectedDocument.size }}</p>
        </div>
        <ul class="info__list">
          <li class="info__item">
            <p class="info__filename">Папки</p>
            <p class="info__value" ref="foldersValue">{{ animatedValues.folders || 0 }}</p>
          </li>
          <li class="info__item">
            <p class="info__filename">Файлы</p>
            <p class="info__value" ref="filesValue">{{ animatedValues.files || 0 }}</p>
          </li>
          <li class="info__item">
            <p class="info__filename">Качество</p>
            <p class="info__value" ref="qualityValue">{{ animatedValues.quality || '0%' }}</p>
          </li>
          <li class="info__item">
            <p class="info__filename">Контрагенты</p>
            <p class="info__value" ref="contractorsValue">{{ animatedValues.contractors || 0 }}</p>
          </li>
          <li class="info__item">
            <p class="info__filename">Риски</p>
            <p class="info__value" ref="risksValue">{{ animatedValues.risks || 0 }}</p>
          </li>
        </ul>
      </div>
    </transition>
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
      selectedDocument: null,
      animatedValues: {
        folders: 0,
        files: 0,
        quality: '0%',
        contractors: 0,
        risks: 0
      },
      animationFrame: null
    }
  },
  created() {
    if (this.documents.length > 0) {
      this.selectedDocument = this.documents[0];
      this.animateValues(this.selectedDocument);
    }
  },
  beforeUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  },
  methods: {
    selectDocument(doc) {
      this.selectedDocument = doc;
      this.animateValues(doc);
      this.$emit('document-selected', doc);
    },
    animateValues(newDoc) {
      const duration = 500;
      const startTime = performance.now();
      const startValues = { ...this.animatedValues };
      
      const currentQuality = parseInt(startValues.quality) || 0;
      const newQuality = parseInt(newDoc.quality) || 0;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.animatedValues = {
          folders: Math.floor(this.easeInOutQuad(progress, startValues.folders, newDoc.folders - startValues.folders)),
          files: Math.floor(this.easeInOutQuad(progress, startValues.files, newDoc.files - startValues.files)),
          quality: `${Math.floor(this.easeInOutQuad(progress, currentQuality, newQuality - currentQuality))}%`,
          contractors: Math.floor(this.easeInOutQuad(progress, startValues.contractors, newDoc.contractors - startValues.contractors)),
          risks: Math.floor(this.easeInOutQuad(progress, startValues.risks, newDoc.risks - startValues.risks))
        };
        
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        }
      };
      
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      this.animationFrame = requestAnimationFrame(animate);
    },
    easeInOutQuad(t, b, c) {
      t /= 0.5;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    }
  }
}
</script>

<style scoped>
h3 {
  font-size: 16px;
}
.info__list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 5px;
}
.info__item {
  width: 180px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #e6e6e6;
}
.analysis__documents {
  display: flex;
  gap: 20px;
}
.info__header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border: 1px solid #6C67FD;
  border-radius: 10px;
}
.info__size {
  color: #a2a2a2;
  font-size: 12px;
}
.documents {
  width: 265px;
  height: 260px;
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  padding: 10px;
}
.documents__header {
  display: flex;
  gap: 5px;
  padding-bottom: 10px;
}
.info__value {
  font-size: 14px;
  font-weight: 700;
  color: #6C67FD;
  transition: all 0.3s ease;
}
.path {
  font-size: 12px;
  color: #a2a2a2;
}
.selected {
  font-weight: bold;
  color: #000;
}
.documents__list {
  display: flex;
  list-style: none;
  flex-direction: column;
  gap: 5px;
}
.document {
  width: 100%;
  height: 35px;
  border-radius: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 0 10px;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.3s forwards;
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.document.active {
  background-color: #f3f3f3;
}
.document.active .document__icon {
  filter: invert(0.1);
}
.document__icon {
  width: 30px;
  height: 22px;
}
.document__name {
  display: flex;
  gap: 5px;
  align-items: center;
}
.name {
  font-size: 14px;
}
.color {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
.green {
  background-color: green;
}
.blue {
  background-color: blue;
}
.red {
  background-color: red;
}
.purple {
  background-color: purple;
}
.yellow {
  background-color: yellow;
}
.document:hover {
  background-color: #f3f3f3;
  cursor: pointer;
}
.document:hover .document__icon {
  filter: invert(0.1);
}
span {
  font-weight: 600;
}
span:hover:not(.selected) {
  color: #000;
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>