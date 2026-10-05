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
const isDisabled = computed(() => isToggling.value || watchlistStore.loading);

onMounted(() => {
  if (!watchlistStore.initialized) {
    watchlistStore.fetchWatchlist();
  }
});

const handleClick = async () => {
  if (isDisabled.value) return;

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
    :disabled="isDisabled"
    type="button"
    class="flex items-center gap-2 h-11 px-4 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 hover:border-primary transition-colors duration-200 cursor-pointer disabled:cursor-wait"
    :class="{ 'text-primary': isInWatchlist, 'text-white': !isInWatchlist }"
    :aria-label="isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
    :aria-pressed="isInWatchlist"
  >
    <Heart :filled="isInWatchlist" class="h-5 w-5 shrink-0" />
    <span class="text-sm font-medium whitespace-nowrap">{{
      isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'
    }}</span>
  </button>
</template>
