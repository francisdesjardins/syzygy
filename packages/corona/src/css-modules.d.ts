/**
 * CSS modules, declared here so this package type-checks on its own.
 *
 * The host declares the same thing for its own files; both resolve to the same shape, and a class
 * name that does not exist reads as `undefined` rather than as an error either way — which is why
 * the stylesheets travel with the components that use them instead of being left behind.
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
