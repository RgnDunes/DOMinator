import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  DOMNode,
  DOMTreeStats,
  AppSettings,
  MessageType,
  DOMTreeFilter,
  DOMTreeSnapshot,
  Bookmark,
} from "./types";
import {
  filterDOMTree,
  searchDOMTree,
  findNodeById,
  exportDOMTreeAsText,
  exportDOMTreeAsJSON,
  generateUniqueId,
} from "./utils";
import "../css/panel.css";

// Import subcomponents
import DOMTree from "./components/DOMTree";
import Inspector from "./components/Inspector";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import PerformanceView from "./components/PerformanceView";
import AccessibilityView from "./components/AccessibilityView";

// Main Panel component
const Panel: React.FC = () => {
  // State for DOM tree data
  const [domTree, setDomTree] = useState<DOMNode | null>(null);
  const [stats, setStats] = useState<DOMTreeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for UI
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedNode, setSelectedNode] = useState<DOMNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<DOMNode | null>(null);
  const [filter, setFilter] = useState<DOMTreeFilter>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<DOMNode[]>([]);
  const [activeTab, setActiveTab] = useState<
    "tree" | "performance" | "accessibility"
  >("tree");
  const [snapshots, setSnapshots] = useState<DOMTreeSnapshot[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Reference to port for communication with background script
  const portRef = useRef<chrome.runtime.Port | null>(null);

  // Initialize panel
  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get(["settings", "bookmarks", "snapshots"], (data) => {
      if (data.settings) setSettings(data.settings);
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.snapshots) setSnapshots(data.snapshots);

      // Set up port connection to background script
      const port = chrome.runtime.connect({ name: "dominator-panel" });
      portRef.current = port;

      // Listen for messages from background script
      port.onMessage.addListener(handleMessage);

      // Request DOM tree from content script
      port.postMessage({ type: MessageType.RequestDOMTree });

      // Clean up on unmount
      return () => {
        port.disconnect();
      };
    });
  }, []);

  // Handle messages from background script
  const handleMessage = (message: any) => {
    if (!message.type) return;

    switch (message.type) {
      case MessageType.DOMTreeResponse:
        if (message.payload) {
          setDomTree(message.payload.root);
          setStats(message.payload.stats);
          setLoading(false);
        }
        break;

      case MessageType.NodeDetailsResponse:
        if (selectedNode && message.payload) {
          // Update selected node with detailed information
          setSelectedNode({
            ...selectedNode,
            computedStyle: message.payload.computedStyle,
            boxModel: message.payload.boxModel,
          });
        }
        break;
    }
  };

  // Handle node selection
  const handleNodeSelect = (node: DOMNode) => {
    setSelectedNode(node);

    // Request detailed node information from content script
    if (portRef.current) {
      portRef.current.postMessage({
        type: MessageType.GetNodeDetails,
        payload: { path: node.path },
      });
    }
  };

  // Handle node hover
  const handleNodeHover = (node: DOMNode | null) => {
    setHoveredNode(node);

    if (settings?.highlightOnHover && portRef.current) {
      if (node) {
        portRef.current.postMessage({
          type: MessageType.HighlightNode,
          payload: { path: node.path },
        });
      } else {
        portRef.current.postMessage({
          type: MessageType.ClearHighlight,
        });
      }
    }
  };

  // Apply filter to DOM tree
  const filteredTree =
    domTree && Object.keys(filter).length > 0
      ? filterDOMTree(domTree, filter)
      : domTree;

  // Apply search to DOM tree
  useEffect(() => {
    if (domTree && searchTerm.trim().length > 0) {
      const results = searchDOMTree(domTree, searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [domTree, searchTerm]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      darkMode: !settings.darkMode,
    };

    // Save updated settings
    chrome.storage.sync.set({ settings: updatedSettings }, () => {
      setSettings(updatedSettings);
    });
  };

  // Save current state as a snapshot
  const saveSnapshot = () => {
    if (!domTree || !stats) return;

    const snapshot: DOMTreeSnapshot = {
      id: generateUniqueId(),
      timestamp: Date.now(),
      name: `Snapshot ${snapshots.length + 1}`,
      root: domTree,
      stats,
    };

    const updatedSnapshots = [...snapshots, snapshot];

    // Save to storage
    chrome.storage.sync.set({ snapshots: updatedSnapshots }, () => {
      setSnapshots(updatedSnapshots);
    });
  };

  // Toggle bookmark for a node
  const toggleBookmark = (node: DOMNode) => {
    // Check if already bookmarked
    const existingIndex = bookmarks.findIndex((b) => b.nodeId === node.id);
    let updatedBookmarks: Bookmark[];

    if (existingIndex >= 0) {
      // Remove bookmark
      updatedBookmarks = bookmarks.filter((_, i) => i !== existingIndex);
    } else {
      // Add bookmark
      const newBookmark: Bookmark = {
        id: generateUniqueId(),
        nodeId: node.id,
        path: node.path,
        name: node.tagName
          ? `${node.tagName}${
              node.attributes?.find((a) => a.name === "id")?.value
                ? `#${node.attributes.find((a) => a.name === "id")?.value}`
                : ""
            }`
          : node.nodeName,
        timestamp: Date.now(),
      };

      updatedBookmarks = [...bookmarks, newBookmark];
    }

    // Save to storage
    chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
      setBookmarks(updatedBookmarks);
    });
  };

  // Add note to a node
  const addNote = (node: DOMNode, note: string) => {
    if (!domTree) return;

    // Find and update the node in the tree
    const updatedTree = { ...domTree };
    const nodeToUpdate = findNodeById(updatedTree, node.id);

    if (nodeToUpdate) {
      nodeToUpdate.notes = note;
      setDomTree(updatedTree);
    }
  };

  // Export DOM tree
  const exportDOM = (format: "json" | "text") => {
    if (!domTree) return;

    let data: string;

    if (format === "json") {
      data = exportDOMTreeAsJSON(domTree);
    } else {
      data = exportDOMTreeAsText(domTree);
    }

    // Send export request to background script
    chrome.runtime.sendMessage({
      type: MessageType.ExportDOM,
      payload: {
        format,
        data,
      },
    });
  };

  // Loading state
  if (loading) {
    return <div className="panel-container">Loading DOM tree...</div>;
  }

  // Error state
  if (error) {
    return <div className="panel-container">Error: {error}</div>;
  }

  // No DOM tree
  if (!filteredTree) {
    return <div className="panel-container">No DOM tree available</div>;
  }

  return (
    <div className={`panel-container ${settings?.darkMode ? "dark-mode" : ""}`}>
      <Toolbar
        onToggleDarkMode={toggleDarkMode}
        darkMode={settings?.darkMode || false}
        onSaveSnapshot={saveSnapshot}
        onExport={exportDOM}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        searchResults={searchResults.length}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />

      <div className="main-content">
        <Sidebar
          onFilterChange={setFilter}
          currentFilter={filter}
          bookmarks={bookmarks}
          snapshots={snapshots}
          stats={stats}
          onSelectBookmark={(bookmark) => {
            if (domTree) {
              const node = findNodeById(domTree, bookmark.nodeId);
              if (node) handleNodeSelect(node);
            }
          }}
          onDeleteBookmark={(bookmarkId) => {
            const updatedBookmarks = bookmarks.filter(
              (b) => b.id !== bookmarkId
            );
            chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
              setBookmarks(updatedBookmarks);
            });
          }}
        />

        {activeTab === "tree" && (
          <>
            <div className="tree-container">
              <DOMTree
                tree={filteredTree}
                selectedNode={selectedNode}
                onSelectNode={handleNodeSelect}
                onHoverNode={handleNodeHover}
                expandedDepth={settings?.autoExpandDepth || 2}
                showAttributes={settings?.showAttributes || true}
                showValues={settings?.showNodeValues || true}
                searchResults={searchResults}
              />
            </div>

            {selectedNode && (
              <Inspector
                node={selectedNode}
                onAddNote={(note) => addNote(selectedNode, note)}
                onToggleBookmark={() => toggleBookmark(selectedNode)}
                isBookmarked={bookmarks.some(
                  (b) => b.nodeId === selectedNode.id
                )}
              />
            )}
          </>
        )}

        {activeTab === "performance" && (
          <PerformanceView
            domTree={domTree}
            stats={stats}
            onSelectNode={handleNodeSelect}
          />
        )}

        {activeTab === "accessibility" && (
          <AccessibilityView
            domTree={domTree}
            stats={stats}
            onSelectNode={handleNodeSelect}
          />
        )}
      </div>
    </div>
  );
};

// Create stub components that will be implemented later
const DOMTree: React.FC<any> = () => <div>DOM Tree Component</div>;
const Inspector: React.FC<any> = () => <div>Inspector Component</div>;
const Toolbar: React.FC<any> = () => <div>Toolbar Component</div>;
const Sidebar: React.FC<any> = () => <div>Sidebar Component</div>;
const PerformanceView: React.FC<any> = () => <div>Performance View</div>;
const AccessibilityView: React.FC<any> = () => <div>Accessibility View</div>;

// Render the panel
ReactDOM.render(<Panel />, document.getElementById("panel-root"));
