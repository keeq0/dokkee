<template>
  <div 
    class="note"
    :class="{ 'note--expanded': isExpanded }"
    @click.stop="toggleExpand"
    :style="{ animationDelay: `${index * 0.1}s` }"
  >
    <div class="note__info">
      <h4 class="note__title">{{ title }}</h4>
      <p class="note__files">
        {{ files.join(', ') }}
      </p>
      
      <div class="note__content-wrapper">
        <p class="note__content">
          {{ content }}
        </p>
      </div>
    </div>
    
    <span class="note__date">
      {{ formattedDate }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    files: {
      type: Array,
      default: () => []
    },
    modifiedDate: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  computed: {
    formattedDate() {
      const date = new Date(this.modifiedDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    }
  }
}
</script>

<style scoped>
.note {
  width: 100%;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 7px 10px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 60px;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.note--expanded {
  max-height: 500px;
}

.note:hover {
  border: 1px solid #6C67FD;
}

.note__info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 50px;
}

.note__title {
  width: 200px;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.note--expanded .note__title {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.note__files {
  width: 170px;
  font-size: 10px;
  font-weight: 500;
  color: #a2a2a2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.note--expanded .note__files {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.note__content-wrapper {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.note--expanded .note__content-wrapper {
  max-height: 300px;
  opacity: 1;
}

.note__content {
  font-size: 10px;
  color: #000;
  padding-top: 5px;
  padding-bottom: 15px;
  margin: 0;
}

.note__date {
  position: absolute;
  bottom: 7px;
  right: 10px;
  font-size: 11px;
  color: #6C67FD;
  font-weight: 500;
  transition: transform 0.2s ease;
}
</style>