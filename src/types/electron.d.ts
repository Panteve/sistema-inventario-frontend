export {};

declare global {
  interface Window {
    electronAPI: {
      saveToken: (token: string) => Promise<void>;
      getToken: () => Promise<string | null>;
      deleteToken: () => Promise<void>;
    };
  }
}
