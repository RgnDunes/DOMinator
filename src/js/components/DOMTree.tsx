import React, { useState, useEffect, useMemo } from "react";
import { DOMNode } from "../types";

interface DOMTreeProps {
  tree: DOMNode;
  selectedNode: DOMNode | null;
  onSelectNode: (node: DOMNode) => void;
  onHoverNode: (node: DOMNode | null) => void;
  expandedDepth: number;
  showAttributes: boolean;
  showValues: boolean;
  searchResults: DOMNode[];
}

const DOMTree: React.FC<DOMTreeProps> = ({
  tree,
  selectedNode,
  onSelectNode,
  onHoverNode,
  expandedDepth,
  showAttributes,
  showValues,
  searchResults,
}) => {
  // Track expanded state of nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {}
  );

  // Initialize expanded nodes based on expandedDepth
  useEffect(() => {
    const expanded: Record<string, boolean> = {};

    const traverseAndExpand = (node: DOMNode, depth: number) => {
      if (depth <= expandedDepth) {
        expanded[node.id] = true;
        node.children.forEach((child) => traverseAndExpand(child, depth + 1));
      }
    };

    traverseAndExpand(tree, 0);
    setExpandedNodes(expanded);
  }, [tree, expandedDepth]);

  // Check if a node is in search results
  const isInSearchResults = useMemo(() => {
    const resultIds = new Set(searchResults.map((node) => node.id));
    return (node: DOMNode) => resultIds.has(node.id);
  }, [searchResults]);

  // Toggle node expansion
  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Render a single node
  const renderNode = (node: DOMNode) => {
    const isExpanded = expandedNodes[node.id] || false;
    const isSelected = selectedNode?.id === node.id;
    const isSearchResult = isInSearchResults(node);

    // Don't render certain node types based on their nodeType
    if (node.nodeType === 8) {
      // Comment node
      return null;
    }

    // Skip empty text nodes
    if (
      node.nodeType === 3 &&
      (!node.textContent || !node.textContent.trim())
    ) {
      return null;
    }

    return (
      <div
        key={node.id}
        className={`tree-node ${isSelected ? "selected" : ""} ${
          isSearchResult ? "search-result" : ""
        }`}
        onClick={() => onSelectNode(node)}
        onMouseEnter={() => onHoverNode(node)}
        onMouseLeave={() => onHoverNode(null)}
      >
        <div className="tree-node-content">
          {node.children.length > 0 && (
            <div
              className="node-expander"
              onClick={(e) => toggleExpand(node.id, e)}
            >
              {isExpanded ? "▼" : "►"}
            </div>
          )}

          {node.nodeType === 1 && (
            <>
              <span className="node-name">&lt;{node.tagName}</span>

              {showAttributes &&
                node.attributes &&
                node.attributes.length > 0 && (
                  <span className="node-attributes">
                    {node.attributes.map((attr, index) => (
                      <span key={index}>
                        {" "}
                        <span className="attribute-name">{attr.name}</span>
                        <span>=</span>
                        <span className="node-attribute-value">
                          "{attr.value}"
                        </span>
                      </span>
                    ))}
                  </span>
                )}

              <span className="node-name">&gt;</span>
            </>
          )}

          {node.nodeType === 3 && showValues && node.textContent && (
            <span className="node-text">
              {node.textContent.length > 50
                ? `${node.textContent.substring(0, 50)}...`
                : node.textContent}
            </span>
          )}

          {node.nodeType === 8 && showValues && (
            <span className="node-comment">
              &lt;!--{" "}
              {node.nodeValue && node.nodeValue.length > 50
                ? `${node.nodeValue.substring(0, 50)}...`
                : node.nodeValue}{" "}
              --&gt;
            </span>
          )}

          {/* Show performance and accessibility indicators */}
          {node.performance &&
            (node.performance.deepNesting ||
              node.performance.heavyInlineStyles ||
              node.performance.largeDataset) && (
              <span
                className="node-performance-warning"
                title="Performance issue detected"
              >
                ⚠️
              </span>
            )}

          {node.accessibility && node.accessibility.issues.length > 0 && (
            <span
              className="node-accessibility-warning"
              title="Accessibility issue detected"
            >
              ♿
            </span>
          )}
        </div>

        {isExpanded && node.children.length > 0 && (
          <div className="node-children">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}

        {node.nodeType === 1 && isExpanded && (
          <div className="tree-node-closing">
            <span className="node-name">&lt;/{node.tagName}&gt;</span>
          </div>
        )}
      </div>
    );
  };

  return <div className="dom-tree">{renderNode(tree)}</div>;
};

export default DOMTree;
