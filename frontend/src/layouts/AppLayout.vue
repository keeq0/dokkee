<template>
  <div class="app-layout">
    <ServiceHeader />
    <ServiceLayout />
    <ServiceFooter />
  </div>
</template>

<script>
import ServiceHeader from '@/components/ServiceHeader.vue'
import ServiceLayout from '@/components/ServiceLayout.vue'
import ServiceFooter from '@/components/ServiceFooter.vue'

export default {
  name: 'AppLayout',
  components: {
    ServiceHeader,
    ServiceLayout,
    ServiceFooter
  }
}
</script>
