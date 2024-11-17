import { createApp } from 'vue';
import AppVue from './AppVue.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import Planificaciones from './planificaciones/index.vue';
import PrimeVue from 'primevue/config';
import DatePicker from 'primevue/datepicker'
// In main.js or AppVue.vue
window.addEventListener('vueRouteChange', (event) => {
  router.push(event.detail);
});


const routes = [
  {
    path: '/planificaciones/crear',
    component: Planificaciones
  },
  {
    path: '/planificaciones/:planificacionId(\\d+)',
    component: Planificaciones
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp(AppVue);
app.use(router)
   .use(PrimeVue)
   .component('DatePicker', DatePicker);

// Mount the app to the DOM
app.mount('#vue-root');