<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import SearchBar from './SearchBar.vue';
import { useRouter } from 'vue-router';
import Logo from '../assets/images/logo.png';
import { useMobileDetection } from '../composables/useMobileDetection';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';

const router = useRouter();
const authStore = useAuthStore();
const watchlistStore = useWatchlistStore();
const isScrolled = ref<boolean>(false);
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);
const { isMobile } = useMobileDetection();

const handleScroll = () => {
  const scrollTop = window.scrollY;
  isScrolled.value = scrollTop > 50;
};

const redirectToCatalog = () => {
  router.push('/');
  searchBarRef.value?.clearSearch();
};

const handleSignOut = async () => {
  try {
    await authStore.signOut();
    watchlistStore.clear();
    router.push('/');
  } catch {
    // surfaced via authStore.error
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  authStore.fetchCurrentUser();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header
    class="fixed transition-all duration-300 ease-in-out top-0 left-0 right-0 z-50"
    :class="[
      isScrolled || isMobile
        ? 'bg-background'
        : 'bg-gradient-to-b from-background via-background/50 to-transparent',
    ]"
  >
    <div class="container mx-auto px-6 py-4 h-18">
      <div class="flex justify-between items-center">
        <img
          v-if="!isMobile"
          :src="Logo"
          alt="MazeFlix"
          class="h-10 cursor-pointer"
          @click="redirectToCatalog"
        />
        <div v-else>
          <span @click="redirectToCatalog" class="text-xl font-bold">For you</span>
        </div>
        <div class="flex items-center gap-4">
          <SearchBar ref="searchBarRef" />
          <nav class="flex items-center gap-3">
            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/watchlist"
                class="text-sm px-3 py-1.5 rounded border border-gray-700 hover:border-primary transition-colors duration-200"
              >
                Watchlist
              </router-link>
              <span class="hidden sm:inline text-sm text-gray-300">{{
                authStore.user?.email
              }}</span>
              <p v-if="authStore.error" role="alert" class="hidden sm:inline text-sm text-red-400">
                {{ authStore.error }}
              </p>
              <button
                @click="handleSignOut"
                class="text-sm px-3 py-1.5 rounded border border-gray-700 hover:border-primary transition-colors duration-200 cursor-pointer"
              >
                Sign out
              </button>
            </template>
            <template v-else-if="authStore.initialized">
              <router-link
                to="/signin"
                class="text-sm px-3 py-1.5 rounded border border-gray-700 hover:border-primary transition-colors duration-200"
              >
                Sign in
              </router-link>
              <router-link
                to="/signup"
                class="text-sm px-3 py-1.5 rounded bg-primary hover:opacity-90 transition-opacity duration-200"
              >
                Sign up
              </router-link>
            </template>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>
