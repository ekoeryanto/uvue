import Vue from 'vue';
import { Store } from 'vuex';
import sanitizeComponent from '../lib/sanitizeComponent';
import onHotReload from '../lib/onHotReload';

/**
 * Vuex plugin
 */
export default {
  /**
   * Get store from Vue options and inject it to context
   */
  beforeCreate(context, _, options) {
    // Default options
    this.$options = {
      fetch: true,
      onHttpRequest: true,
      ...this.$options,
    };

    if (options.store || !(options.store instanceof Store)) {
      // Get store from new Vue options
      context.store = options.store;

      // Handle HMR
      onHotReload(() => {
        this.resolveOnHttpRequest(context, true);
      }, 'vuex.onHttpRequest');
    } else {
      Vue.utils.warn('UVue Vuex plugin installed but no store found!');
    }
  },

  /**
   * Read data from SSR to hydrate store
   */
  async beforeStart(context) {
    const { store } = context;

    // onHttpRequest
    await this.resolveOnHttpRequest(context);

    if (store && process.client && process.ssr && window.__DATA__) {
      const { state } = window.__DATA__;
      store.replaceState(state);
    }
  },

  /**
   * Call fetch() methods on pages components
   */
  async routeResolve(context) {
    await this.resolveFetch(context);
  },

  /**
   * Call onHttpRequest action and send data to __DATA__
   */
  beforeReady(context) {
    const { store, ssr } = context;
    if (store && process.server) {
      // Inject store data in __DATA__ on server side
      ssr.data.state = store.state;
    }
  },

  async resolveFetch(context) {
    const { routeComponents, store } = context;

    if (store && this.$options.fetch) {
      // Get pages components
      if (routeComponents.length) {
        await Promise.all(
          routeComponents.map(c => {
            const Component = sanitizeComponent(c);
            // For each component lookup for fetch() method
            if (Component.options.fetch) {
              return Component.options.fetch(context);
            }
          }),
        );
      }
    }
  },

  async resolveOnHttpRequest(context, fromHMR = false) {
    const { store } = context;

    if (this.$options.onHttpRequest && store._actions.onHttpRequest) {
      if (process.server || !process.ssr || window.__SPA_ROUTE__ || fromHMR) {
        await store.dispatch('onHttpRequest', context);
      }
    }
  },
};
