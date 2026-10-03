import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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
  {
    path: '/watchlist',
    name: 'Watchlist',
    component: () => import('../views/WatchlistView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;

  const authStore = useAuthStore();
  if (!authStore.initialized) {
    await authStore.fetchCurrentUser();
  }

  return authStore.isAuthenticated || { name: 'SignIn' };
});

export default router;
