import { create } from "zustand";

export interface DOMNode {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  textContent?: string;
  children: DOMNode[];
  parentId?: string;
  xpath?: string;
  cssSelector?: string;
  depth: number;
  collapsed?: boolean;
}

interface DOMStore {
  domTree: DOMNode | null;
  selectedNode: DOMNode | null;
  searchResults: DOMNode[];
  isLoading: boolean;
  loadDOMTree: (tabId: number) => void;
  selectNode: (nodeId: string) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  searchNodes: (query: string) => void;
  enhancedDOMEnabled: boolean;
  toggleEnhancedDOM: () => void;
  bookmarkedNodes: DOMNode[];
  bookmarkNode: (node: DOMNode) => void;
  removeBookmark: (nodeId: string) => void;
}

export const useStore = create<DOMStore>((set, get) => ({
  domTree: null,
  selectedNode: null,
  searchResults: [],
  isLoading: false,
  enhancedDOMEnabled: false,
  bookmarkedNodes: [],

  loadDOMTree: (tabId: number) => {
    set({ isLoading: true });

    // Send message to content script to get DOM tree
    chrome.tabs.sendMessage(tabId, { action: "getDOMTree" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError);
        set({ isLoading: false });
        return;
      }

      set({
        domTree: response.domTree,
        isLoading: false,
      });
    });
  },

  selectNode: (nodeId: string) => {
    const findNode = (node: DOMNode | null, id: string): DOMNode | null => {
      if (!node) return null;
      if (node.id === id) return node;

      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }

      return null;
    };

    const node = findNode(get().domTree, nodeId);

    if (node) {
      set({ selectedNode: node });

      // Highlight the node in the page
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "highlightNode",
            nodeId,
          });
        }
      });
    }
  },

  toggleNodeCollapse: (nodeId: string) => {
    const toggleCollapse = (node: DOMNode): DOMNode => {
      if (node.id === nodeId) {
        return { ...node, collapsed: !node.collapsed };
      }

      return {
        ...node,
        children: node.children.map(toggleCollapse),
      };
    };

    set((state) => ({
      domTree: state.domTree ? toggleCollapse(state.domTree) : null,
    }));
  },

  searchNodes: (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    const results: DOMNode[] = [];

    const searchInNode = (node: DOMNode) => {
      // Check if node matches the query
      const matchesTag = node.tagName
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesId = node.attributes.id
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const matchesClass = node.attributes.class
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const matchesText = node.textContent
        ?.toLowerCase()
        .includes(query.toLowerCase());

      if (matchesTag || matchesId || matchesClass || matchesText) {
        results.push(node);
      }

      // Search in children
      node.children.forEach(searchInNode);
    };

    const domTree = get().domTree;
    if (domTree) {
      searchInNode(domTree);
    }

    set({ searchResults: results });
  },

  toggleEnhancedDOM: () => {
    const newValue = !get().enhancedDOMEnabled;
    set({ enhancedDOMEnabled: newValue });

    // Send message to content script to toggle enhanced DOM
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleEnhancedDOM",
          enabled: newValue,
        });
      }
    });
  },

  bookmarkNode: (node: DOMNode) => {
    set((state) => ({
      bookmarkedNodes: [...state.bookmarkedNodes, node],
    }));
  },

  removeBookmark: (nodeId: string) => {
    set((state) => ({
      bookmarkedNodes: state.bookmarkedNodes.filter(
        (node) => node.id !== nodeId
      ),
    }));
  },
}));
