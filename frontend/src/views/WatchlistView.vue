<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWatchlistStore } from '../stores/watchlist';
import { useShowsStore } from '../stores/shows';
import { type Show } from '../types/tvmaze';
import ShowCard from '../components/ShowCard.vue';
import Loading from '../components/Loading.vue';
import EmptyState from '../components/EmptyState.vue';

const router = useRouter();
const watchlistStore = useWatchlistStore();
const showsStore = useShowsStore();

const shows = ref<Show[]>([]);
const loading = ref(true);

const loadShows = async () => {
  loading.value = true;
  await watchlistStore.fetchWatchlist();

  if (watchlistStore.error) {
    loading.value = false;
    return;
  }

  // Fetched sequentially, not via Promise.all: showsStore is a shared singleton, and concurrent
  // calls would race its loading/show/error fields against each other.
  const loadedShows: Show[] = [];
  for (const showId of watchlistStore.showIds) {
    const show = await showsStore.getShowById(showId);
    if (show) loadedShows.push(show);
  }
  shows.value = loadedShows;
  loading.value = false;
};

const handleShowClick = (show: Show) => {
  router.push(`/show/${show.id}`);
};

onMounted(() => {
  loadShows();
});
</script>

<template>
  <main class="container mx-auto px-6 pt-32 pb-16">
    <h1 class="text-2xl font-bold mb-6">My Watchlist</h1>

    <Loading v-if="loading" message="Loading your watchlist..." />

    <section
      v-else-if="shows.length > 0"
      class="flex flex-wrap gap-2"
      role="list"
      aria-label="Watchlist"
    >
      <ShowCard
        v-for="show in shows"
        :key="show.id"
        :show="show"
        @click="handleShowClick"
        role="listitem"
      />
    </section>

    <EmptyState v-else-if="watchlistStore.error" :message="watchlistStore.error" />

    <EmptyState v-else message="Your watchlist is empty. Add shows from their detail page." />
  </main>
</template>
