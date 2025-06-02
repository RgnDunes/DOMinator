// This declaration file provides type definitions for Chrome extension APIs
// that TypeScript is unable to find automatically.

declare namespace chrome {
  namespace runtime {
    interface InstalledDetails {
      reason: string;
    }

    interface Port {
      onMessage: {
        addListener: (callback: (message: any) => void) => void;
      };
      onDisconnect: {
        addListener: (callback: () => void) => void;
      };
      postMessage: (message: any) => void;
      name: string;
    }

    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }

    function onInstalled(callback: (details: InstalledDetails) => void): void;
    function onInstalled(callback: (details: InstalledDetails) => void): void;
    function onConnect(callback: (port: Port) => void): void;
    function sendMessage(
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    function onMessage(
      callback: (
        message: any,
        sender: MessageSender,
        sendResponse: (response?: any) => void
      ) => boolean | void
    ): void;
  }

  namespace storage {
    interface StorageArea {
      get(
        keys: string | string[] | Object | null,
        callback: (items: { [key: string]: any }) => void
      ): void;
      set(items: Object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;
    }

    const sync: StorageArea;
    const local: StorageArea;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      windowId: number;
      highlighted: boolean;
      active: boolean;
      pinned: boolean;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
    }

    function query(
      queryInfo: {
        active?: boolean;
        currentWindow?: boolean;
        highlighted?: boolean;
        pinned?: boolean;
        status?: string;
        title?: string;
        url?: string | string[];
        windowId?: number;
        windowType?: string;
        index?: number;
      },
      callback: (result: Tab[]) => void
    ): void;

    function sendMessage(
      tabId: number,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
  }

  namespace downloads {
    interface DownloadOptions {
      url: string;
      filename?: string;
      conflictAction?: string;
      saveAs?: boolean;
      method?: string;
      headers?: { [key: string]: string }[];
      body?: string;
    }

    function download(
      options: DownloadOptions,
      callback?: (downloadId: number) => void
    ): void;
  }
}
