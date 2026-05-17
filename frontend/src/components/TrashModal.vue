<template>
  <transition name="modal">
    <div v-if="show" class="trash-modal">
      <div class="trash__header">
        <h2>Корзина</h2>
        <img @click="close" src="@/assets/trash-exit.png" class="trash__exit"/>
      </div>
      <div class="trash__buttons">
        <button class="button main__button">
            <img src="@/assets/clear-trash.png" class="button__icon" />
            <p class="button_text">Очистить</p>
        </button>
        <button class="button ">
            <img src="@/assets/delete.png" class="button__icon" />
            <p class="button_text">Удалить</p>
        </button>
        <button class="button ">
            <img src="@/assets/recover.png" class="button__icon" />
            <p class="button_text">Восстановить</p>
        </button>
      </div>
      <div class="trash__documents">
            <div class="documents__header">
            <img src="@/assets/home.svg" class="header__icon" />
            <p class="path">
            <span>Home</span> / <span>Работа</span> / <span class="selected">Университет</span>
            </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.trash-modal {
  position: fixed;
  top: 56.5%;
  left: 42.5%;
  transform: translate(-50%, -50%);
  width: 650px;
  height: 370px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  padding: 30px 30px;
}



.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.trash__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.trash__exit {
    width: 15px;
    height: 15px;
    cursor: pointer;
    transition: .2s;
}

.trash__exit:hover {
    filter: invert(0.5);
}

.trash__buttons {
    margin-top: 15px;
    display: flex;
    gap: 15px;
    align-items: center;
}

.button {
    width: fit-content;
    height: 30px;
    padding: 0 10px;
    border: none;
    outline: none;
    background-color: none;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    cursor: pointer;
    background-color: #fff;
}

.button:hover:not(.main__button) {
  background-color: #f4f4f4;
}

.main__button {
  background-color: #333;
  color: #FFF;
  transition: all 0.3s ease;
}

.button__icon {
    width: 10px;
    height: 10px;
}

.main__button .button__icon {
  filter: invert(0);
}

.main__button:hover {
  background-color: #a2a2a2;
}

.trash__documents {
    margin-top: 15px;
    width: 100%;
    height: 200px;
    overflow: scroll;
    border:1px solid #e6e6e6;
    border-radius: 20px;
    padding: 10px;
}


.documents__header {
  display: flex;
  gap: 5px;
  padding-bottom: 15px;
}

.path {
  font-size: 10px;
  font-weight: 600;
  color: #a2a2a2;
}

span {
  transition: all 0.3s ease;
}

.selected {
  font-weight: 700;
  color: #000;
}

span:hover:not(.selected) {
  color: #000;
  cursor: pointer;
}
</style>