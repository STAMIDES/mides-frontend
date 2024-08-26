import { createApp } from 'vue';
import AppVue from './AppVue.vue';
import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from './HelloWorld.vue';


const routes = [
  {
    path: '/planificaciones',
    component: HelloWorld
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(AppVue).use(router).mount('#vue-root');