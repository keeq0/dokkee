<template>
  <div class="documents-footer">
    <MemoryBar :documents="documents" />
    <button class="trash" @click="showTrashModal = true">
      <img src="@/assets/trash.png" class="trash__icon" />
      <p class="trash__text">Корзина</p>
    </button>

    <TrashModal :show="showTrashModal" @close="showTrashModal = false">
      <slot name="modal-content"></slot>
    </TrashModal>

    <transition name="fade">
      <div v-if="showTrashModal" class="modal-overlay" @click="showTrashModal = false"></div>
    </transition>
  </div>
</template>

<script>
import MemoryBar from './MemoryBar.vue';
import TrashModal from './TrashModal.vue';

export default {
  components: {
    MemoryBar,
    TrashModal
  },
  props: {
    documents: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      showTrashModal: false
    }
  }
}
</script>

<style scoped>
.documents-footer {
  margin-top: 15px;
  width: 650px;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.trash {
  width: 100px;
  height: 25px;
  border-radius: 5px;
  background-color: #333;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.trash:hover {
  background-color: #a2A2A2;
}

.trash__icon {
  width: 10px;
  height: 10px;
}

.trash__text {
  font-size: 12px;
  color: #FFF;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>