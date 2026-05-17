<template>
  <div>
    <ServiceHeader />
    <ServiceLayout />
    <ServiceFooter />
  </div>
</template>

<script>
import ServiceFooter from '@/components/ServiceFooter.vue';
import ServiceHeader from '@/components/ServiceHeader.vue'
import ServiceLayout from '@/components/ServiceLayout.vue'

export default {
  name: 'ServicePage',
  components: { 
    ServiceHeader,
    ServiceLayout,
    ServiceFooter }
}
</script>
