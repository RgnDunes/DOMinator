import React, { useState, useEffect } from "react";
import { DOMNode, DOMTreeStats, AccessibilityIssueType } from "../types";

interface AccessibilityViewProps {
  domTree: DOMNode | null;
  stats: DOMTreeStats | null;
  onSelectNode: (node: DOMNode) => void;
}

const AccessibilityView: React.FC<AccessibilityViewProps> = ({
  domTree,
  stats,
  onSelectNode,
}) => {
  const [issueNodes, setIssueNodes] = useState<DOMNode[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<
    AccessibilityIssueType | "all"
  >("all");
  const [severityFilter, setSeverityFilter] = useState<
    "all" | "error" | "warning"
  >("all");

  // Find nodes with accessibility issues
  useEffect(() => {
    if (!domTree) return;

    const nodes: DOMNode[] = [];

    const traverseTree = (node: DOMNode) => {
      if (node.accessibility && node.accessibility.issues.length > 0) {
        nodes.push(node);
      }

      node.children.forEach(traverseTree);
    };

    traverseTree(domTree);
    setIssueNodes(nodes);
  }, [domTree]);

  // Filter nodes based on selected issue type and severity
  const filteredNodes = issueNodes.filter((node) => {
    if (!node.accessibility) return false;

    return node.accessibility.issues.some((issue) => {
      const typeMatch =
        selectedIssueType === "all" || issue.type === selectedIssueType;
      const severityMatch =
        severityFilter === "all" || issue.severity === severityFilter;
      return typeMatch && severityMatch;
    });
  });

  // Calculate statistics
  const getStatistics = () => {
    if (!stats) return null;

    const totalNodes = stats.totalNodes;
    const issueCount = stats.accessibilityIssues;
    const percentage = Math.round((issueCount / totalNodes) * 100);

    // Calculate issue types count
    const issueTypeCounts: Record<AccessibilityIssueType | string, number> = {
      [AccessibilityIssueType.MissingAlt]: 0,
      [AccessibilityIssueType.MissingLabel]: 0,
      [AccessibilityIssueType.MissingRole]: 0,
      [AccessibilityIssueType.ContrastIssue]: 0,
      [AccessibilityIssueType.SemanticsIssue]: 0,
      [AccessibilityIssueType.AriaIssue]: 0,
      [AccessibilityIssueType.KeyboardIssue]: 0,
    };

    // Count severity types
    let errorCount = 0;
    let warningCount = 0;

    issueNodes.forEach((node) => {
      if (node.accessibility) {
        node.accessibility.issues.forEach((issue) => {
          issueTypeCounts[issue.type] = (issueTypeCounts[issue.type] || 0) + 1;
          if (issue.severity === "error") errorCount++;
          if (issue.severity === "warning") warningCount++;
        });
      }
    });

    return {
      totalNodes,
      issueCount,
      percentage,
      issueTypeCounts,
      errorCount,
      warningCount,
    };
  };

  const statistics = getStatistics();

  // Get issue type description
  const getIssueTypeDescription = (
    type: AccessibilityIssueType | string
  ): string => {
    switch (type) {
      case AccessibilityIssueType.MissingAlt:
        return "Images should have alt text to describe content for screen readers";
      case AccessibilityIssueType.MissingLabel:
        return "Form controls should have associated labels";
      case AccessibilityIssueType.MissingRole:
        return "Interactive elements should have appropriate ARIA roles";
      case AccessibilityIssueType.ContrastIssue:
        return "Text should have sufficient contrast against its background";
      case AccessibilityIssueType.SemanticsIssue:
        return "Elements should use proper semantic HTML tags";
      case AccessibilityIssueType.AriaIssue:
        return "ARIA attributes should be used correctly";
      case AccessibilityIssueType.KeyboardIssue:
        return "Interactive elements should be keyboard accessible";
      default:
        return "";
    }
  };

  // Format issue type for display
  const formatIssueType = (type: string): string => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="accessibility-view">
      <div className="accessibility-header">
        <h2>Accessibility Analysis</h2>

        {statistics && (
          <div className="accessibility-summary">
            <div className="accessibility-stat">
              <span className="stat-label">Accessibility Issues:</span>
              <span className="stat-value">{statistics.issueCount}</span>
            </div>
            <div className="accessibility-stat">
              <span className="stat-label">Errors:</span>
              <span className="stat-value error">{statistics.errorCount}</span>
            </div>
            <div className="accessibility-stat">
              <span className="stat-label">Warnings:</span>
              <span className="stat-value warning">
                {statistics.warningCount}
              </span>
            </div>
            <div className="accessibility-stat">
              <span className="stat-label">Elements with Issues:</span>
              <span className="stat-value">{issueNodes.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="accessibility-filters">
        <div className="filter-group">
          <label className="filter-label">Issue Type:</label>
          <select
            value={selectedIssueType}
            onChange={(e) => setSelectedIssueType(e.target.value as any)}
            className="issue-filter-select"
          >
            <option value="all">All Issues</option>
            {Object.values(AccessibilityIssueType).map((type) => (
              <option key={type} value={type}>
                {formatIssueType(type)} (
                {statistics?.issueTypeCounts[type] || 0})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Severity:</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="severity-filter-select"
          >
            <option value="all">All Severities</option>
            <option value="error">
              Errors ({statistics?.errorCount || 0})
            </option>
            <option value="warning">
              Warnings ({statistics?.warningCount || 0})
            </option>
          </select>
        </div>
      </div>

      {selectedIssueType !== "all" && (
        <div className="issue-description">
          {getIssueTypeDescription(selectedIssueType)}
        </div>
      )}

      <div className="issue-nodes-list">
        <h3>Elements with Issues ({filteredNodes.length})</h3>

        {filteredNodes.length === 0 ? (
          <div className="empty-state">
            No accessibility issues matching the selected filters
          </div>
        ) : (
          filteredNodes.map((node) => (
            <div
              key={node.id}
              className="issue-node-item"
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
                {node.accessibility?.issues
                  .filter((issue) => {
                    const typeMatch =
                      selectedIssueType === "all" ||
                      issue.type === selectedIssueType;
                    const severityMatch =
                      severityFilter === "all" ||
                      issue.severity === severityFilter;
                    return typeMatch && severityMatch;
                  })
                  .map((issue, index) => (
                    <span key={index} className={`issue-tag ${issue.severity}`}>
                      {formatIssueType(issue.type)}: {issue.message}
                    </span>
                  ))}
              </div>

              <div className="node-path">{node.path}</div>
            </div>
          ))
        )}
      </div>

      <div className="accessibility-tips">
        <h3>Accessibility Best Practices</h3>
        <ul className="tips-list">
          <li>Always provide alt text for images</li>
          <li>Ensure form controls have associated labels</li>
          <li>
            Use semantic HTML elements (e.g., &lt;button&gt; instead of &lt;div
            onclick&gt;)
          </li>
          <li>Ensure sufficient color contrast for text</li>
          <li>Make sure all interactive elements are keyboard accessible</li>
          <li>
            Use heading tags (&lt;h1&gt; to &lt;h6&gt;) in proper hierarchical
            order
          </li>
          <li>Use ARIA attributes when necessary, but prefer semantic HTML</li>
        </ul>
      </div>
    </div>
  );
};

export default AccessibilityView;
