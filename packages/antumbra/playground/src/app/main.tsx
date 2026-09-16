import '@/app/styles/app.css';

/**
 * Two doors, and neither loads the other's graph.
 *
 * `?gallery` is the component suite's: Playwright navigates here and calls `window.mount(...)`, so
 * the contract has to exist before anything of ours renders — installed from an effect it arrives a
 * commit too late. Both branches import **dynamically**, because a static import runs whether or not
 * its branch does, and the router's graph reaching a test page is how a provider's side effect ends
 * up in a measurement that never asked for one.
 */
if (new URLSearchParams(globalThis.location.search).has('gallery')) {
  const loading = import('@/pages/stories/model/gallery');
  Object.assign(globalThis, {
    mount: async (params: { story: string }) => {
      (await loading).mount(params);
    },
    unmount: async () => {
      (await loading).unmount();
    },
  });
} else {
  void import('@/app/bootstrap').then((app) => {
    app.bootstrap();
  });
}
