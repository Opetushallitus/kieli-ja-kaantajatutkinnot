// Global Modules
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

// Global Vars
declare const REACT_ENV_PRODUCTION: boolean;
