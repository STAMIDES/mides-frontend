<template>
  <div class="main-container">
    <Planificaciones />
    <RightSidebar />
  </div>
</template>

<script>
import Planificaciones from '../components/montevideoMap.vue';
import RightSidebar from '../components/rightSideNavBar.vue';

export default {
  name: 'MainPage',
  components: {
    Planificaciones,
    RightSidebar
  }
};
</script>

<style scoped>
.main-container {
  position: relative;
  height: 100vh;
  width: 100vw;
}
</style>