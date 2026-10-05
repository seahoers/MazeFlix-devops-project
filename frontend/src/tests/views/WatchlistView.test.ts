import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { router } from '../setup';
import WatchlistView from '../../views/WatchlistView.vue';
import { useWatchlistStore } from '../../stores/watchlist';
import { useShowsStore } from '../../stores/shows';
import { type Show } from '../../types/tvmaze';

const mockShow = (id: number): Show =>
  ({
    id,
    name: `Show ${id}`,
    genres: ['Drama'],
    rating: { average: 8 },
  }) as Show;

describe('WatchlistView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve());

    const watchlistStore = useWatchlistStore();
    watchlistStore.showIds = [];
    watchlistStore.initialized = false;
    watchlistStore.error = null;
  });

  const createWrapper = () => {
    return mount(WatchlistView, {
      global: {
        stubs: { ShowCard: true, Loading: true, EmptyState: true },
      },
    });
  };

  it('shows loading state initially', () => {
    const watchlistStore = useWatchlistStore();
    vi.spyOn(watchlistStore, 'fetchWatchlist').mockImplementation(() => new Promise(() => {}));

    const wrapper = createWrapper();

    expect(wrapper.findComponent({ name: 'Loading' }).exists()).toBe(true);
  });

  it('renders a card for each show in the watchlist', async () => {
    const watchlistStore = useWatchlistStore();
    vi.spyOn(watchlistStore, 'fetchWatchlist').mockImplementation(async () => {
      watchlistStore.showIds = [1, 2];
    });

    const showsStore = useShowsStore();
    vi.spyOn(showsStore, 'getShowById').mockImplementation(async (id: number) => mockShow(id));

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.findAllComponents({ name: 'ShowCard' })).toHaveLength(2);
    expect(wrapper.findComponent({ name: 'EmptyState' }).exists()).toBe(false);
  });

  it('shows an empty state when the watchlist has no shows', async () => {
    const watchlistStore = useWatchlistStore();
    vi.spyOn(watchlistStore, 'fetchWatchlist').mockImplementation(async () => {
      watchlistStore.showIds = [];
    });

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'EmptyState' }).exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: 'ShowCard' })).toHaveLength(0);
  });

  it('shows an error instead of an empty state when the fetch fails', async () => {
    const watchlistStore = useWatchlistStore();
    vi.spyOn(watchlistStore, 'fetchWatchlist').mockImplementation(async () => {
      watchlistStore.error = 'Failed to load watchlist';
    });

    const showsStore = useShowsStore();
    const getShowByIdSpy = vi.spyOn(showsStore, 'getShowById');

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'EmptyState' }).exists()).toBe(true);
    expect(getShowByIdSpy).not.toHaveBeenCalled();
  });

  it('skips shows that fail to load', async () => {
    const watchlistStore = useWatchlistStore();
    vi.spyOn(watchlistStore, 'fetchWatchlist').mockImplementation(async () => {
      watchlistStore.showIds = [1, 2];
    });

    const showsStore = useShowsStore();
    vi.spyOn(showsStore, 'getShowById').mockImplementation(async (id: number) =>
      id === 1 ? mockShow(1) : null,
    );

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.findAllComponents({ name: 'ShowCard' })).toHaveLength(1);
  });
});
