export const clerkEnabled: boolean =
  (window as Window & { __CLERK_ENABLED__?: boolean }).__CLERK_ENABLED__ ===
    true ||
  (!REACT_ENV_PRODUCTION &&
    localStorage.getItem('clerkEnabled') === 'true');
