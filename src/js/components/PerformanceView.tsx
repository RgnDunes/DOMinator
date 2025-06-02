import React, { useState, useEffect } from "react";
import { DOMNode, DOMTreeStats } from "../types";

interface PerformanceViewProps {
  domTree: DOMNode | null;
  stats: DOMTreeStats | null;
  onSelectNode: (node: DOMNode) => void;
}

const PerformanceView: React.FC<PerformanceViewProps> = ({
  domTree,
  stats,
  onSelectNode,
}) => {
  const [problemNodes, setProblemNodes] = useState<DOMNode[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<
    | "all"
    | "deepNesting"
    | "heavyInlineStyles"
    | "largeDataset"
    | "styleComplexity"
  >("all");

  // Find nodes with performance issues
  useEffect(() => {
    if (!domTree) return;

    const nodes: DOMNode[] = [];

    const traverseTree = (node: DOMNode) => {
      if (node.performance) {
        const hasIssue =
          node.performance.deepNesting ||
          node.performance.heavyInlineStyles ||
          node.performance.largeDataset ||
          node.performance.styleComplexity;

        if (hasIssue) {
          nodes.push(node);
        }
      }

      node.children.forEach(traverseTree);
    };

    traverseTree(domTree);
    setProblemNodes(nodes);
  }, [domTree]);

  // Filter nodes based on selected issue
  const filteredNodes =
    selectedIssue === "all"
      ? problemNodes
      : problemNodes.filter(
          (node) => node.performance && node.performance[selectedIssue]
        );

  // Calculate statistics
  const getStatistics = () => {
    if (!stats) return null;

    const totalNodes = stats.totalNodes;
    const issueCount = stats.performanceIssues;
    const percentage = Math.round((issueCount / totalNodes) * 100);

    return {
      totalNodes,
      issueCount,
      percentage,
    };
  };

  const statistics = getStatistics();

  // Render issue type description
  const renderIssueDescription = (issueType: string) => {
    switch (issueType) {
      case "deepNesting":
        return "Deeply nested elements can cause layout thrashing and slower rendering.";
      case "heavyInlineStyles":
        return "Elements with complex inline styles can cause additional repaints and layout recalculations.";
      case "largeDataset":
        return "Elements with large data attributes can consume excessive memory.";
      case "styleComplexity":
        return "Elements using complex CSS properties (like shadows, transforms, filters) can be computationally expensive.";
      default:
        return "";
    }
  };

  return (
    <div className="performance-view">
      <div className="performance-header">
        <h2>Performance Analysis</h2>

        {statistics && (
          <div className="performance-summary">
            <div className="performance-stat">
              <span className="stat-label">Performance Issues:</span>
              <span className="stat-value">{statistics.issueCount}</span>
            </div>
            <div className="performance-stat">
              <span className="stat-label">Total Nodes:</span>
              <span className="stat-value">{statistics.totalNodes}</span>
            </div>
            <div className="performance-stat">
              <span className="stat-label">Issue Percentage:</span>
              <span className="stat-value">{statistics.percentage}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="performance-filters">
        <span className="filter-label">Filter by issue type:</span>
        <select
          value={selectedIssue}
          onChange={(e) => setSelectedIssue(e.target.value as any)}
          className="issue-filter-select"
        >
          <option value="all">All Issues ({problemNodes.length})</option>
          <option value="deepNesting">
            Deep Nesting (
            {problemNodes.filter((n) => n.performance?.deepNesting).length})
          </option>
          <option value="heavyInlineStyles">
            Heavy Inline Styles (
            {
              problemNodes.filter((n) => n.performance?.heavyInlineStyles)
                .length
            }
            )
          </option>
          <option value="largeDataset">
            Large Dataset (
            {problemNodes.filter((n) => n.performance?.largeDataset).length})
          </option>
          <option value="styleComplexity">
            Style Complexity (
            {problemNodes.filter((n) => n.performance?.styleComplexity).length})
          </option>
        </select>
      </div>

      {selectedIssue !== "all" && (
        <div className="issue-description">
          {renderIssueDescription(selectedIssue)}
        </div>
      )}

      <div className="problem-nodes-list">
        <h3>Problem Elements ({filteredNodes.length})</h3>

        {filteredNodes.length === 0 ? (
          <div className="empty-state">
            No performance issues of this type found
          </div>
        ) : (
          filteredNodes.map((node) => (
            <div
              key={node.id}
              className="problem-node-item"
              onClick={() => onSelectNode(node)}
            >
              <div className="node-tag">
                {node.tagName || node.nodeName}
                {node.attributes?.find((a) => a.name === "id") && (
                  <span className="node-id">
                    #{node.attributes.find((a) => a.name === "id")?.value}
                  </span>
                )}
                {node.attributes?.find((a) => a.name === "class") && (
                  <span className="node-class">
                    .
                    {
                      node.attributes
                        .find((a) => a.name === "class")
                        ?.value.split(" ")[0]
                    }
                  </span>
                )}
              </div>

              <div className="node-issues">
                {node.performance?.deepNesting && (
                  <span className="issue-tag deep-nesting">
                    Deep Nesting (Depth: {node.depth})
                  </span>
                )}
                {node.performance?.heavyInlineStyles && (
                  <span className="issue-tag heavy-styles">
                    Heavy Inline Styles
                  </span>
                )}
                {node.performance?.largeDataset && (
                  <span className="issue-tag large-dataset">Large Dataset</span>
                )}
                {node.performance?.styleComplexity && (
                  <span className="issue-tag style-complexity">
                    Complex Styles
                  </span>
                )}
              </div>

              <div className="node-path">{node.path}</div>
            </div>
          ))
        )}
      </div>

      <div className="performance-tips">
        <h3>Performance Tips</h3>
        <ul className="tips-list">
          <li>Reduce DOM depth by flattening nested elements when possible</li>
          <li>Avoid inline styles; use CSS classes instead</li>
          <li>Minimize DOM size by removing unnecessary elements</li>
          <li>Use CSS transforms instead of properties that trigger layout</li>
          <li>Avoid frequent DOM mutations that cause reflows</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceView;
