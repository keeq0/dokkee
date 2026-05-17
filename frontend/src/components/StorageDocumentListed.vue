<template>
  <li class="document">
    <div class="document__left">
      <img src="@/assets/folder.png" class="document__folder" />
      <div class="document__name">
        <p class="name">{{ name }}</p>
        <div :class="['color', color]"></div>
      </div>
    </div>

    <div class="document__right">
      <div class="document__created">
        <p class="">{{ createdDate }}</p>
      </div>
      <p class="document__size">{{ size }}</p>
      <p class="document__activity">{{ lastModified }}</p>
      <div class="document__options" @click="$emit('options-click')">
        <div class="options__dot"></div>
        <div class="options__dot"></div>
        <div class="options__dot"></div>
      </div>
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
    },
    createdDate: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.document {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  transition: .2s;
}

.document:hover {
    background-color: #f3f3f3;
    cursor: pointer;
}

.document__left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.document__right {
  display: flex;
  gap: 40px;
  align-items: center;
}



.document__name {
  width: 150px;
  text-align: start;
  display: flex;
  align-items: center;
  gap: 10px;
}

.color {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.name {
  color: #000;
  font-size: 11.5px;
  font-weight: 500;
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
  width: 60px;
  text-align: center;
  font-size: 10px;
  color: #a2a2a2;
}

.document__size {
  width: 50px;
  text-align: center;
    font-size: 10px;
    font-weight: 500;
}

.document__created {
    width: 120px;
    text-align: center;
    color: #6C67FD;
    font-size: 10px;
}

.document__options {
  width: 20px;
  height: 10px;
  display: flex;
  gap: 1px;
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

.document:hover .document__folder {
    filter: invert(0.1);
}

.document__folder {
  width: 29px;
  height: 22px;
  transition: .3s;
}
</style>