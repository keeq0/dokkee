<template>
  <div
    class="drop-menu__zone"
    :class="{ 'drop-menu__zone--dragover': isDragging }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="onZoneClick"
  >
    <svg class="animated-border" width="100%" height="100%">
      <rect
        x="3"
        y="3"
        width="calc(100% - 6px)"
        height="calc(100% - 6px)"
        rx="18"
        ry="18"
        fill="none"
        stroke="#6c67fd"
        stroke-width="2"
        stroke-dasharray="10 8"
        stroke-linecap="round"
      />
    </svg>

    <p class="drop-menu__instruction">Загрузите файл(-ы) сюда</p>
    <img src="@/assets/upload.svg" class="drop-menu__icon" alt="Иконка загрузки" />
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".pdf,.docx"
      @change="onFileInputChange"
      style="display: none;"
    />
  </div>
</template>

<script>
export default {
  name: 'DropMenu',
  emits: ['files-added'],
  data() {
    return {
      isDragging: false
    };
  },
  methods: {
    onDragOver() {
      this.isDragging = true;
    },
    onDragLeave() {
      this.isDragging = false;
    },
    onDrop(event) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      this.$emit('files-added', droppedFiles);
      this.isDragging = false;
    },
    onZoneClick() {
      this.$refs.fileInput.click();
    },
    onFileInputChange(event) {
      const selectedFiles = Array.from(event.target.files);
      this.$emit('files-added', selectedFiles);
      event.target.value = null;
    }
  }
};
</script>

<style scoped>
.drop-menu__zone {
  position: relative;
  width: 100%;
  height: 130px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  color: #6c67fd;
  overflow: hidden;
}

.animated-border {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  animation: dash-animation 60s linear infinite;
}

.drop-menu__zone:hover {
  background-color: #f0f0f0;
}

.drop-menu__zone--dragover {
  background-color: #eaeaea;
}

.drop-menu__instruction {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin: 0;
  z-index: 1;
}

.drop-menu__icon {
  margin-top: 5px;
  z-index: 1;
}

@keyframes dash-animation {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
