import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import WatchlistButton from '../../components/WatchlistButton.vue';
import { useWatchlistStore } from '../../stores/watchlist';

describe('WatchlistButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = useWatchlistStore();
    store.showIds = [];
    store.initialized = false;
    store.error = null;
  });

  it('fetches the watchlist on mount when not already initialized', () => {
    const store = useWatchlistStore();
    const fetchSpy = vi.spyOn(store, 'fetchWatchlist').mockResolvedValue(undefined);

    mount(WatchlistButton, { props: { showId: 1 } });

    expect(fetchSpy).toHaveBeenCalled();
  });

  it('does not refetch when the watchlist is already initialized', () => {
    const store = useWatchlistStore();
    store.initialized = true;
    const fetchSpy = vi.spyOn(store, 'fetchWatchlist').mockResolvedValue(undefined);

    mount(WatchlistButton, { props: { showId: 1 } });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows an unfilled heart when the show is not in the watchlist', async () => {
    const store = useWatchlistStore();
    store.initialized = true;

    const wrapper = mount(WatchlistButton, { props: { showId: 1 } });
    await flushPromises();

    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false');
  });

  it('shows a filled heart when the show is already in the watchlist', async () => {
    const store = useWatchlistStore();
    store.initialized = true;
    store.showIds = [1];

    const wrapper = mount(WatchlistButton, { props: { showId: 1 } });
    await flushPromises();

    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true');
  });

  it('adds the show to the watchlist on click', async () => {
    const store = useWatchlistStore();
    store.initialized = true;
    const toggleSpy = vi.spyOn(store, 'toggle').mockImplementation(async (showId: number) => {
      store.showIds = [...store.showIds, showId];
    });

    const wrapper = mount(WatchlistButton, { props: { showId: 1 } });
    await flushPromises();

    await wrapper.get('button').trigger('click');
    await flushPromises();

    expect(toggleSpy).toHaveBeenCalledWith(1);
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true');
  });

  it('removes the show from the watchlist on click when already added', async () => {
    const store = useWatchlistStore();
    store.initialized = true;
    store.showIds = [1];
    const toggleSpy = vi.spyOn(store, 'toggle').mockImplementation(async (showId: number) => {
      store.showIds = store.showIds.filter((id) => id !== showId);
    });

    const wrapper = mount(WatchlistButton, { props: { showId: 1 } });
    await flushPromises();

    await wrapper.get('button').trigger('click');
    await flushPromises();

    expect(toggleSpy).toHaveBeenCalledWith(1);
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false');
  });

  it('disables the button while the initial watchlist fetch is in flight', async () => {
    const store = useWatchlistStore();
    let resolveFetch!: () => void;
    vi.spyOn(store, 'fetchWatchlist').mockImplementation(() => {
      store.loading = true;
      return new Promise<void>((resolve) => {
        resolveFetch = () => {
          store.loading = false;
          resolve();
        };
      });
    });

    const wrapper = mount(WatchlistButton, { props: { showId: 1 } });
    await flushPromises();

    expect(wrapper.get('button').attributes('disabled')).toBeDefined();

    resolveFetch();
    await flushPromises();
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined();
  });

  it('disables the button while a toggle is in flight', async () => {
    const store = useWatchlistStore();
    store.initialized = true;
    let resolveToggle!: () => void;
    vi.spyOn(store, 'toggle').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveToggle = resolve;
        }),
    );

    const wrapper = mount(WatchlistButton, { props: { showId: 1 } });
    await flushPromises();

    await wrapper.get('button').trigger('click');
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();

    resolveToggle();
    await flushPromises();
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined();
  });
});
