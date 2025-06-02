export interface DOMNode {
  id: string;
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;
  tagName?: string;
  attributes?: DOMNodeAttribute[];
  children: DOMNode[];
  textContent?: string;
  computedStyle?: Record<string, string>;
  boxModel?: BoxModel;
  eventListeners?: EventListenerInfo[];
  accessibility?: AccessibilityInfo;
  performance?: PerformanceInfo;
  depth: number;
  path: string;
  index: number;
  parent: string | null;
  isBookmarked?: boolean;
  notes?: string;
  isVisible?: boolean;
  isHidden?: boolean;
}

export interface DOMNodeAttribute {
  name: string;
  value: string;
}

export interface BoxModel {
  width: number;
  height: number;
  margin: Rect;
  border: Rect;
  padding: Rect;
  content: Rect;
}

export interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface EventListenerInfo {
  type: string;
  useCapture: boolean;
  passive: boolean;
  once: boolean;
  scriptId?: string;
  lineNumber?: number;
  columnNumber?: number;
  handler?: string;
}

export interface AccessibilityInfo {
  role?: string;
  name?: string;
  description?: string;
  issues: AccessibilityIssue[];
}

export interface AccessibilityIssue {
  type: AccessibilityIssueType;
  message: string;
  severity: "warning" | "error";
}

export enum AccessibilityIssueType {
  MissingAlt = "missing-alt",
  MissingLabel = "missing-label",
  MissingRole = "missing-role",
  ContrastIssue = "contrast-issue",
  SemanticsIssue = "semantics-issue",
  AriaIssue = "aria-issue",
  KeyboardIssue = "keyboard-issue",
}

export interface PerformanceInfo {
  reflows?: number;
  layoutShifts?: number;
  paintCount?: number;
  elementSize?: number;
  styleComplexity?: number;
  deepNesting?: boolean;
  heavyInlineStyles?: boolean;
  largeDataset?: boolean;
}

export interface DOMTreeSnapshot {
  id: string;
  timestamp: number;
  name: string;
  root: DOMNode;
  stats: DOMTreeStats;
}

export interface DOMTreeStats {
  totalNodes: number;
  maxDepth: number;
  elementCount: Record<string, number>;
  hiddenElements: number;
  accessibilityIssues: number;
  performanceIssues: number;
}

export interface DOMTreeFilter {
  tagNames?: string[];
  attributes?: { name: string; value?: string }[];
  textContent?: string;
  hideScriptTags?: boolean;
  hideComments?: boolean;
  hideEmptyTextNodes?: boolean;
  hideInvisibleElements?: boolean;
  showOnlyAccessibilityIssues?: boolean;
  showOnlyPerformanceIssues?: boolean;
}

export interface DOMSearchResult {
  node: DOMNode;
  matchType: "tagName" | "attribute" | "textContent" | "id" | "class";
  match: string;
}

export interface AppSettings {
  darkMode: boolean;
  autoExpandDepth: number;
  showAttributes: boolean;
  showNodeValues: boolean;
  liveUpdateMode: boolean;
  highlightOnHover: boolean;
  maxNodesBeforeVirtualization: number;
  defaultExportFormat: "json" | "text" | "image";
  autosaveSnapshots: boolean;
  snapshotIntervalSeconds: number;
}

export interface Bookmark {
  id: string;
  nodeId: string;
  path: string;
  name: string;
  timestamp: number;
  notes?: string;
}

export enum MessageType {
  RequestDOMTree = "REQUEST_DOM_TREE",
  DOMTreeResponse = "DOM_TREE_RESPONSE",
  HighlightNode = "HIGHLIGHT_NODE",
  ClearHighlight = "CLEAR_HIGHLIGHT",
  GetNodeDetails = "GET_NODE_DETAILS",
  NodeDetailsResponse = "NODE_DETAILS_RESPONSE",
  SaveSnapshot = "SAVE_SNAPSHOT",
  SnapshotSaved = "SNAPSHOT_SAVED",
  UpdateSettings = "UPDATE_SETTINGS",
  AddBookmark = "ADD_BOOKMARK",
  RemoveBookmark = "REMOVE_BOOKMARK",
  AddNote = "ADD_NOTE",
  ToggleLiveMode = "TOGGLE_LIVE_MODE",
  ExportDOM = "EXPORT_DOM",
  ExportComplete = "EXPORT_COMPLETE",
}

export interface Message {
  type: MessageType;
  payload?: any;
}
