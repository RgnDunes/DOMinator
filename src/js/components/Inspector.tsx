import React, { useState } from "react";
import { DOMNode, DOMNodeAttribute } from "../types";

interface InspectorProps {
  node: DOMNode;
  onAddNote: (note: string) => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
}

const Inspector: React.FC<InspectorProps> = ({
  node,
  onAddNote,
  onToggleBookmark,
  isBookmarked,
}) => {
  const [activeTab, setActiveTab] = useState<
    "properties" | "styles" | "accessibility" | "performance"
  >("properties");
  const [noteText, setNoteText] = useState<string>(node.notes || "");

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };

  const handleNoteSave = () => {
    onAddNote(noteText);
  };

  const renderProperties = () => {
    return (
      <div className="inspector-section">
        <h3 className="inspector-section-title">Basic Information</h3>

        <div className="property-row">
          <div className="property-name">Node Type</div>
          <div className="property-value">
            {node.nodeType === 1
              ? "Element"
              : node.nodeType === 3
              ? "Text"
              : node.nodeType === 8
              ? "Comment"
              : node.nodeType}
          </div>
        </div>

        <div className="property-row">
          <div className="property-name">Name</div>
          <div className="property-value">{node.nodeName}</div>
        </div>

        {node.tagName && (
          <div className="property-row">
            <div className="property-name">Tag</div>
            <div className="property-value">{node.tagName}</div>
          </div>
        )}

        {node.textContent && (
          <div className="property-row">
            <div className="property-name">Text Content</div>
            <div className="property-value">{node.textContent}</div>
          </div>
        )}

        <div className="property-row">
          <div className="property-name">Depth</div>
          <div className="property-value">{node.depth}</div>
        </div>

        <div className="property-row">
          <div className="property-name">Path</div>
          <div className="property-value">{node.path}</div>
        </div>

        {node.attributes && node.attributes.length > 0 && (
          <>
            <h3 className="inspector-section-title">Attributes</h3>
            {node.attributes.map((attr, index) => (
              <div className="property-row" key={index}>
                <div className="property-name">{attr.name}</div>
                <div className="property-value">{attr.value}</div>
              </div>
            ))}
          </>
        )}

        <h3 className="inspector-section-title">Actions</h3>
        <div className="inspector-actions">
          <button
            className={`button ${
              isBookmarked ? "button-primary" : "button-secondary"
            }`}
            onClick={onToggleBookmark}
          >
            {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
          </button>

          <div className="note-section">
            <textarea
              className="note-input"
              placeholder="Add a note about this node..."
              value={noteText}
              onChange={handleNoteChange}
            />
            <button className="button button-primary" onClick={handleNoteSave}>
              Save Note
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStyles = () => {
    if (!node.computedStyle) {
      return (
        <div className="inspector-section">Style information not available</div>
      );
    }

    const styleEntries = Object.entries(node.computedStyle);

    return (
      <div className="inspector-section">
        <h3 className="inspector-section-title">Computed Styles</h3>

        {styleEntries.length > 0 ? (
          styleEntries.map(([property, value]) => (
            <div className="property-row" key={property}>
              <div className="property-name">{property}</div>
              <div className="property-value">{value}</div>
            </div>
          ))
        ) : (
          <div>No style information available</div>
        )}

        {node.boxModel && (
          <>
            <h3 className="inspector-section-title">Box Model</h3>
            <div className="box-model-display">
              <div className="box-model-margin">
                <div className="box-model-label">Margin</div>
                <div className="box-model-value">
                  T: {node.boxModel.margin.top}px
                </div>
                <div className="box-model-value">
                  R: {node.boxModel.margin.right}px
                </div>
                <div className="box-model-value">
                  B: {node.boxModel.margin.bottom}px
                </div>
                <div className="box-model-value">
                  L: {node.boxModel.margin.left}px
                </div>

                <div className="box-model-border">
                  <div className="box-model-label">Border</div>
                  <div className="box-model-value">
                    T: {node.boxModel.border.top}px
                  </div>
                  <div className="box-model-value">
                    R: {node.boxModel.border.right}px
                  </div>
                  <div className="box-model-value">
                    B: {node.boxModel.border.bottom}px
                  </div>
                  <div className="box-model-value">
                    L: {node.boxModel.border.left}px
                  </div>

                  <div className="box-model-padding">
                    <div className="box-model-label">Padding</div>
                    <div className="box-model-value">
                      T: {node.boxModel.padding.top}px
                    </div>
                    <div className="box-model-value">
                      R: {node.boxModel.padding.right}px
                    </div>
                    <div className="box-model-value">
                      B: {node.boxModel.padding.bottom}px
                    </div>
                    <div className="box-model-value">
                      L: {node.boxModel.padding.left}px
                    </div>

                    <div className="box-model-content">
                      <div className="box-model-label">Content</div>
                      <div className="box-model-value">
                        {node.boxModel.width} × {node.boxModel.height}px
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAccessibility = () => {
    if (!node.accessibility) {
      return (
        <div className="inspector-section">
          Accessibility information not available
        </div>
      );
    }

    return (
      <div className="inspector-section">
        <h3 className="inspector-section-title">Accessibility Information</h3>

        {node.accessibility.role && (
          <div className="property-row">
            <div className="property-name">ARIA Role</div>
            <div className="property-value">{node.accessibility.role}</div>
          </div>
        )}

        {node.accessibility.name && (
          <div className="property-row">
            <div className="property-name">ARIA Name</div>
            <div className="property-value">{node.accessibility.name}</div>
          </div>
        )}

        {node.accessibility.description && (
          <div className="property-row">
            <div className="property-name">ARIA Description</div>
            <div className="property-value">
              {node.accessibility.description}
            </div>
          </div>
        )}

        {node.accessibility.issues.length > 0 && (
          <>
            <h3 className="inspector-section-title">Accessibility Issues</h3>
            {node.accessibility.issues.map((issue, index) => (
              <div
                key={index}
                className={`accessibility-issue ${
                  issue.severity === "error" ? "error" : "warning"
                }`}
              >
                <div className="issue-type">{issue.type}</div>
                <div className="issue-message">{issue.message}</div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderPerformance = () => {
    if (!node.performance) {
      return (
        <div className="inspector-section">
          Performance information not available
        </div>
      );
    }

    return (
      <div className="inspector-section">
        <h3 className="inspector-section-title">Performance Information</h3>

        {node.performance.deepNesting && (
          <div className="performance-metric warning">
            <div className="performance-metric-name">Deep Nesting</div>
            <div className="performance-metric-description">
              This element is deeply nested (depth: {node.depth}), which may
              impact performance.
            </div>
          </div>
        )}

        {node.performance.heavyInlineStyles && (
          <div className="performance-metric warning">
            <div className="performance-metric-name">Heavy Inline Styles</div>
            <div className="performance-metric-description">
              This element has complex inline styles which may cause
              repaints/reflows.
            </div>
          </div>
        )}

        {node.performance.largeDataset && (
          <div className="performance-metric warning">
            <div className="performance-metric-name">Large Dataset</div>
            <div className="performance-metric-description">
              This element has large data attributes which may impact memory
              usage.
            </div>
          </div>
        )}

        {node.performance.styleComplexity && (
          <div className="performance-metric warning">
            <div className="performance-metric-name">Complex Styles</div>
            <div className="performance-metric-description">
              This element uses computationally expensive CSS properties.
            </div>
          </div>
        )}

        {!node.performance.deepNesting &&
          !node.performance.heavyInlineStyles &&
          !node.performance.largeDataset &&
          !node.performance.styleComplexity && (
            <div className="performance-metric good">
              <div className="performance-metric-name">No Issues Detected</div>
              <div className="performance-metric-description">
                This element has no obvious performance issues.
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="inspector-panel">
      <div className="tab-container">
        <div
          className={`tab ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => setActiveTab("properties")}
        >
          Properties
        </div>
        <div
          className={`tab ${activeTab === "styles" ? "active" : ""}`}
          onClick={() => setActiveTab("styles")}
        >
          Styles
        </div>
        <div
          className={`tab ${activeTab === "accessibility" ? "active" : ""}`}
          onClick={() => setActiveTab("accessibility")}
        >
          Accessibility
        </div>
        <div
          className={`tab ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          Performance
        </div>
      </div>

      {activeTab === "properties" && renderProperties()}
      {activeTab === "styles" && renderStyles()}
      {activeTab === "accessibility" && renderAccessibility()}
      {activeTab === "performance" && renderPerformance()}
    </div>
  );
};

export default Inspector;
