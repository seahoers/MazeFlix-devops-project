<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useWatchlistStore } from '../stores/watchlist';
import Heart from '../assets/icons/Heart.vue';

type Props = {
  showId: number;
};

const props = defineProps<Props>();
const watchlistStore = useWatchlistStore();
const isToggling = ref(false);

const isInWatchlist = computed(() => watchlistStore.isInWatchlist(props.showId));

onMounted(() => {
  if (!watchlistStore.initialized) {
    watchlistStore.fetchWatchlist();
  }
});

const handleClick = async () => {
  if (isToggling.value) return;

  try {
    isToggling.value = true;
    await watchlistStore.toggle(props.showId);
  } catch {
    // surfaced via watchlistStore.error
  } finally {
    isToggling.value = false;
  }
};
</script>

<template>
  <button
    @click="handleClick"
    :disabled="isToggling"
    type="button"
    class="flex items-center justify-center h-11 w-11 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 hover:border-primary transition-colors duration-200 cursor-pointer disabled:cursor-wait"
    :class="{ 'text-primary': isInWatchlist, 'text-white': !isInWatchlist }"
    :aria-label="isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
    :aria-pressed="isInWatchlist"
  >
    <Heart :filled="isInWatchlist" class="h-6 w-6" />
  </button>
</template>
