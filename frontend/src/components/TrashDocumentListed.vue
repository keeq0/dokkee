<template>
  <li class="trash-list">
    <div class="trash-list__icon" :style="{ backgroundColor: getColor(color) }">
      <img src="@/assets/file-trash.png" class="trash-list__file-icon" />
    </div>
    <div class="trash-list__name">{{ name }}</div>
    <div class="trash-list__location">{{ originalLocation }}</div>
    <div class="trash-list__size">{{ size }}</div>
    <div class="trash-list__date">{{ deletedDate }}</div>
  </li>
</template>

<script>
export default {
  props: {
    name: String,
    color: String,
    deletedDate: String,
    originalLocation: String,
    size: String
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
.trash-list {
  display: grid;
  grid-template-columns: 30px 2fr 2fr 1fr 1fr;
  align-items: center;
  gap: 15px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.trash-list:hover {
  background-color: #f9f9f9;
}

.trash-list__icon {
  width: 25px;
  height: 25px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trash-list__file-icon {
  width: 14px;
  height: 14px;
  filter: invert(0.5);
}

.trash-list__name,
.trash-list__location,
.trash-list__size,
.trash-list__date {
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-list__name {
  font-weight: 600;
}

.trash-list__location {
  color: #888;
}

.trash-list__size,
.trash-list__date {
  color: #999;
  text-align: right;
}
</style>