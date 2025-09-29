declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: any
    ) => void;
  }
}

export {};