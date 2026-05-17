<template>
  <div class="statistics">
    <StatisticsDocs :percentage="percentage" />
    <div class="statistics__right">
      <DocumentsChecked />
      <StatisticsDanger />
      <StatisticsContragents />
    </div>
  </div>
</template>

<script>
import StatisticsDocs from './StatisticsDocs.vue'
import DocumentsChecked from './DocumentsChecked.vue'
import StatisticsDanger from './StatisticsDanger.vue'
import StatisticsContragents from './StatisticsContragents.vue'

export default {
  name: 'AnalysisStatistics',
  components: {
    StatisticsDocs,
    DocumentsChecked,
    StatisticsDanger,
    StatisticsContragents
  },
  data() {
    return {
      percentage: 0
    }
  },
  mounted() {
    setTimeout(() => {
      const target = 82
      const duration = 1000  // длительность анимации в миллисекундах
      const startTime = performance.now()

      const update = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        this.percentage = Math.round(target * progress)
        if (progress < 1) {
          requestAnimationFrame(update)
        }
      }

      requestAnimationFrame(update)
    }, 50)
  }
}
</script>

<style>
.statistics {
  padding-top: 25px;
  display: flex;
  justify-content: space-between;
}

.statistics__right {
  display: flex;
  gap:20px;
  column-gap: 25px;
  flex-wrap: wrap;
  max-width: 350px;
}
</style>
