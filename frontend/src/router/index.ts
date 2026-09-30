import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Catalog',
    component: () => import('../views/CatalogView.vue'),
  },
  {
    path: '/show/:id',
    name: 'ShowDetail',
    component: () => import('../views/ShowDetailView.vue'),
    props: true,
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import('../views/SignInView.vue'),
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('../views/SignUpView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
