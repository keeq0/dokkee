<template>
  <li class="trash-tile">
    <div class="trash-tile__icon" :style="{ backgroundColor: getColor(color) }">
      <img src="@/assets/file-trash.png" class="trash-tile__file-icon" />
    </div>
    <div class="trash-tile__info">
      <p class="trash-tile__name">{{ name }}</p>
      <p class="trash-tile__date">Удален: {{ deletedDate }}</p>
    </div>
  </li>
</template>

<script>
export default {
  props: {
    name: String,
    color: String,
    deletedDate: String
  },
  methods: {
    getColor(color) {
      const colors = {
        green: '#E6F4EA',
        blue: '#E6F1FE',
        red: '#FCE8E6',
        purple: '#F3E8FD',
        yellow: '#FEF7E0'
      };
      return colors[color] || '#F5F5F5';
    }
  }
}
</script>

<style scoped>
.trash-tile {
  width: 143px;
  height: 100px;
  background-color: #FFF;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.trash-tile:hover {
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.trash-tile__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.trash-tile__file-icon {
  width: 20px;
  height: 20px;
  filter: invert(0.5);
}

.trash-tile__info {
  text-align: center;
  width: 100%;
  padding: 0 10px;
}

.trash-tile__name {
  font-size: 10px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-tile__date {
  font-size: 8px;
  color: #999;
  margin: 3px 0 0;
}
</style>