// single-spa itself. The host serves it so the root config and every application it loads share one
// instance — two copies would be two application registries, and nothing would ever mount.
export { getMountedApps, registerApplication, start } from 'single-spa';
