<template>
  <div class="landing-page">
    <ParticleBackground
      :particle-count="20"
      :connect-distance="150"
      :mouse-connect-distance="200"
      color="#6C67FD"
      :max-speed="1.2"
    />
    <TheHeader />
    <MainSection />
    <AboutSection />
    <SubscriptionSection />
  </div>
</template>

<script>
import AboutSection from '@/components/landing/AboutSection/AboutSection.vue'
import MainSection from '@/components/landing/MainSection/MainSection.vue'
import TheHeader from '@/components/landing/TheHeader/TheHeader.vue'
import ParticleBackground from '@/components/landing/ParticleBackground.vue'
import SubscriptionSection from '@/components/landing/SubscriptionSection/SubscriptionSection.vue'

export default {
  name: 'LandingPage',
  components: {
    TheHeader,
    MainSection,
    AboutSection,
    ParticleBackground,
    SubscriptionSection
  }
}
</script>

<style scoped>
.landing-page {
  position: relative;
  z-index: 1;
  background: transparent;
  font-family: 'Montserrat', sans-serif;
}

.landing-page :deep(a) {
  color: #000;
  text-decoration: none;
}

.landing-page :deep(h1) {
  padding-bottom: 20px;
}

.landing-page :deep(section) {
  padding: 50px 0;
}

.landing-page :deep(.color-blue) {
  color: #6C67FD;
}

@media (max-width: 576px) {
  .landing-page :deep(section) {
    padding: 30px 0;
  }
}
</style>
