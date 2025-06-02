import React, { useState } from "react";
import {
  DOMTreeFilter,
  Bookmark,
  DOMTreeSnapshot,
  DOMTreeStats,
} from "../types";

interface SidebarProps {
  onFilterChange: (filter: DOMTreeFilter) => void;
  currentFilter: DOMTreeFilter;
  bookmarks: Bookmark[];
  snapshots: DOMTreeSnapshot[];
  stats: DOMTreeStats | null;
  onSelectBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onFilterChange,
  currentFilter,
  bookmarks,
  snapshots,
  stats,
  onSelectBookmark,
  onDeleteBookmark,
}) => {
  const [activeSection, setActiveSection] = useState<
    "filters" | "bookmarks" | "snapshots" | "stats"
  >("filters");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Handle adding a tag to filter
  const handleAddTag = () => {
    if (tagFilter && !filterTags.includes(tagFilter.toLowerCase())) {
      const updatedTags = [...filterTags, tagFilter.toLowerCase()];
      setFilterTags(updatedTags);
      setTagFilter("");

      // Update filter
      onFilterChange({
        ...currentFilter,
        tagNames: updatedTags,
      });
    }
  };

  // Handle removing a tag from filter
  const handleRemoveTag = (tag: string) => {
    const updatedTags = filterTags.filter((t) => t !== tag);
    setFilterTags(updatedTags);

    // Update filter
    onFilterChange({
      ...currentFilter,
      tagNames: updatedTags.length > 0 ? updatedTags : undefined,
    });
  };

  // Handle checkbox filters
  const handleToggleFilter = (filterName: keyof DOMTreeFilter) => {
    onFilterChange({
      ...currentFilter,
      [filterName]: !currentFilter[filterName],
    });
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Render the filters section
  const renderFilters = () => (
    <div className="sidebar-section">
      <h3 className="sidebar-section-title">Filter Elements</h3>

      <div className="filter-group">
        <label className="filter-label">Filter by Tag Name</label>
        <div className="tag-input-container">
          <input
            type="text"
            className="search-box"
            placeholder="e.g., div, span, img..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <button className="button button-secondary" onClick={handleAddTag}>
            Add
          </button>
        </div>

        {filterTags.length > 0 && (
          <div className="tags-container">
            {filterTags.map((tag) => (
              <div key={tag} className="tag">
                {tag}
                <span
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">Show/Hide Elements</label>

        <div className="filter-option">
          <input
            type="checkbox"
            id="hideScriptTags"
            checked={!!currentFilter.hideScriptTags}
            onChange={() => handleToggleFilter("hideScriptTags")}
          />
          <label htmlFor="hideScriptTags">Hide Script Tags</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="hideComments"
            checked={!!currentFilter.hideComments}
            onChange={() => handleToggleFilter("hideComments")}
          />
          <label htmlFor="hideComments">Hide Comments</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="hideEmptyTextNodes"
            checked={!!currentFilter.hideEmptyTextNodes}
            onChange={() => handleToggleFilter("hideEmptyTextNodes")}
          />
          <label htmlFor="hideEmptyTextNodes">Hide Empty Text Nodes</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="hideInvisibleElements"
            checked={!!currentFilter.hideInvisibleElements}
            onChange={() => handleToggleFilter("hideInvisibleElements")}
          />
          <label htmlFor="hideInvisibleElements">Hide Invisible Elements</label>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Special Filters</label>

        <div className="filter-option">
          <input
            type="checkbox"
            id="showOnlyAccessibilityIssues"
            checked={!!currentFilter.showOnlyAccessibilityIssues}
            onChange={() => handleToggleFilter("showOnlyAccessibilityIssues")}
          />
          <label htmlFor="showOnlyAccessibilityIssues">
            Show Only Accessibility Issues
          </label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="showOnlyPerformanceIssues"
            checked={!!currentFilter.showOnlyPerformanceIssues}
            onChange={() => handleToggleFilter("showOnlyPerformanceIssues")}
          />
          <label htmlFor="showOnlyPerformanceIssues">
            Show Only Performance Issues
          </label>
        </div>
      </div>
    </div>
  );

  // Render the bookmarks section
  const renderBookmarks = () => (
    <div className="sidebar-section">
      <h3 className="sidebar-section-title">Bookmarks</h3>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          No bookmarks yet. Click the bookmark button in the inspector to add
          one.
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bookmark-item">
              <div
                className="bookmark-name"
                onClick={() => onSelectBookmark(bookmark)}
              >
                {bookmark.name}
              </div>
              <div className="bookmark-path">{bookmark.path}</div>
              <div className="bookmark-time">
                {formatDate(bookmark.timestamp)}
              </div>
              <button
                className="bookmark-delete"
                onClick={() => onDeleteBookmark(bookmark.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render the snapshots section
  const renderSnapshots = () => (
    <div className="sidebar-section">
      <h3 className="sidebar-section-title">DOM Snapshots</h3>

      {snapshots.length === 0 ? (
        <div className="empty-state">
          No snapshots yet. Click the snapshot button to save the current DOM
          state.
        </div>
      ) : (
        <div className="snapshots-list">
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="snapshot-item">
              <div className="snapshot-name">{snapshot.name}</div>
              <div className="snapshot-time">
                {formatDate(snapshot.timestamp)}
              </div>
              <div className="snapshot-stats">
                {snapshot.stats.totalNodes} nodes, {snapshot.stats.maxDepth} max
                depth
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render the stats section
  const renderStats = () => (
    <div className="sidebar-section">
      <h3 className="sidebar-section-title">DOM Statistics</h3>

      {!stats ? (
        <div className="empty-state">No statistics available</div>
      ) : (
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-label">Total Nodes</div>
            <div className="stat-value">{stats.totalNodes}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Maximum Depth</div>
            <div className="stat-value">{stats.maxDepth}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Hidden Elements</div>
            <div className="stat-value">{stats.hiddenElements}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Accessibility Issues</div>
            <div className="stat-value">{stats.accessibilityIssues}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Performance Issues</div>
            <div className="stat-value">{stats.performanceIssues}</div>
          </div>

          <h4 className="stat-subtitle">Element Count</h4>
          <div className="element-count-list">
            {Object.entries(stats.elementCount)
              .sort(
                ([, countA], [, countB]) =>
                  (countB as number) - (countA as number)
              )
              .slice(0, 10)
              .map(([tag, count]) => (
                <div key={tag} className="element-count-item">
                  <div className="element-tag">{tag}</div>
                  <div className="element-count">{count}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <div
          className={`sidebar-tab ${
            activeSection === "filters" ? "active" : ""
          }`}
          onClick={() => setActiveSection("filters")}
        >
          Filters
        </div>
        <div
          className={`sidebar-tab ${
            activeSection === "bookmarks" ? "active" : ""
          }`}
          onClick={() => setActiveSection("bookmarks")}
        >
          Bookmarks
        </div>
        <div
          className={`sidebar-tab ${
            activeSection === "snapshots" ? "active" : ""
          }`}
          onClick={() => setActiveSection("snapshots")}
        >
          Snapshots
        </div>
        <div
          className={`sidebar-tab ${activeSection === "stats" ? "active" : ""}`}
          onClick={() => setActiveSection("stats")}
        >
          Stats
        </div>
      </div>

      <div className="sidebar-content">
        {activeSection === "filters" && renderFilters()}
        {activeSection === "bookmarks" && renderBookmarks()}
        {activeSection === "snapshots" && renderSnapshots()}
        {activeSection === "stats" && renderStats()}
      </div>
    </div>
  );
};

export default Sidebar;
