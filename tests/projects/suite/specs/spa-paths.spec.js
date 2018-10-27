import {
  pluginsInstall,
  pluginsHooks,
  pluginsError,
  pluginsContext,
  redirect,
  vuex,
  asyncData,
  middlewares,
  errorHandler,
} from './tests';

describe('SPA paths', () => {
  pluginsInstall.client();

  pluginsHooks.client();

  pluginsError.client();

  pluginsContext.client();

  redirect.client().helper();

  vuex.client();

  asyncData.client();

  middlewares.client();

  errorHandler.client().method();
});
