<template>
  <li class="document">
    <img src="@/assets/folder.png" class="document__folder" />
    <div class="document__name">
      <div :class="['color', color]"></div>
      <p class="name">{{ name }}</p>
    </div>
    <p class="document__activity">Посл. изм: {{ lastModified }}</p>
    <div class="document__options" @click="$emit('options-click')">
      <div class="options__dot"></div>
      <div class="options__dot"></div>
      <div class="options__dot"></div>
    </div>
  </li>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'green'
    },
    lastModified: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.document {
  position: relative;
  width: 143px;
  height: 100px;
}

.document__folder {
  width: 100%;
  transition: .2s;
}

.document:hover:not(.document__options) .document__folder {
  filter: invert(0.1);
  cursor: pointer;
}

.document:hover .document__activity {
  color: #a2a2a2;
}

.document__name {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  top: 20px;
  left: 10px;
}

.color {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.name {
  color: #333;
  font-size: 16.5px;
  font-weight: 600;
}

.green {
  background-color: #00FF26;
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

.document__activity {
  position: absolute;
  font-size: 9.5px;
  font-weight: 600;
  color: #d0d0d0;
  left: 10px;
  top: 85px;
  transition: .2s;
}

.document__options {
  width: 20px;
  height: 10px;
  position: absolute;
  display: flex;
  gap: 1px;
  top: 85px;
  left: 120px;
  transition: .2s;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.options__dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: #a2a2a2;
  transition: .2s;
}

.document__options:hover .options__dot {
  background-color: #333;
}
</style>