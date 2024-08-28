import { createApp } from 'vue';
import AppVue from './AppVue.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import Planificaciones from './planificaciones/index.vue';

// In main.js or AppVue.vue
window.addEventListener('vueRouteChange', (event) => {
  router.push(event.detail);
});


const routes = [
  {
    path: '/planificaciones/crear',
    component: Planificaciones
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

createApp(AppVue).use(router).mount('#vue-root');