import React from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { DOMNode, useStore } from "../store";

interface DOMTreeProps {
  tree: DOMNode | null;
}

interface TreeNodeProps {
  node: DOMNode;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth }) => {
  const { selectedNode, selectNode, toggleNodeCollapse } = useStore();
  const isSelected = selectedNode?.id === node.id;
  const hasChildren = node.children.length > 0;
  const isCollapsed = node.collapsed ?? false;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(node.id);
  };

  const getNodeClasses = () => {
    return `flex items-start py-1 px-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
      isSelected ? "tree-node-selected" : ""
    }`;
  };

  const getTagAttributes = () => {
    if (!node.attributes || Object.keys(node.attributes).length === 0) {
      return "";
    }

    return Object.entries(node.attributes).map(([key, value]) => {
      if (key === "id") {
        return (
          <span
            key={key}
            className="text-purple-600 dark:text-purple-400"
          >{` id="${value}"`}</span>
        );
      }
      if (key === "class") {
        return (
          <span
            key={key}
            className="text-green-600 dark:text-green-400"
          >{` class="${value}"`}</span>
        );
      }
      return (
        <span
          key={key}
          className="text-blue-600 dark:text-blue-400"
        >{` ${key}="${value}"`}</span>
      );
    });
  };

  return (
    <div style={{ paddingLeft: `${depth * 12}px` }}>
      <div className={getNodeClasses()} onClick={handleNodeClick}>
        {hasChildren && (
          <button
            onClick={handleToggleCollapse}
            className="mr-1 flex-shrink-0 mt-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isCollapsed ? (
              <FiChevronRight className="w-3 h-3" />
            ) : (
              <FiChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4 mr-1" />}
        <div className="flex flex-col">
          <div>
            <span className="text-orange-600 dark:text-orange-400">
              &lt;{node.tagName.toLowerCase()}
            </span>
            {getTagAttributes()}
            <span className="text-orange-600 dark:text-orange-400">&gt;</span>
            {node.textContent && node.children.length === 0 && (
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {node.textContent.length > 20
                  ? `${node.textContent.substring(0, 20)}...`
                  : node.textContent}
              </span>
            )}
            {node.children.length === 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                &lt;/{node.tagName.toLowerCase()}&gt;
              </span>
            )}
          </div>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
          <div
            style={{ paddingLeft: `${depth * 12 + 16}px` }}
            className="text-orange-600 dark:text-orange-400 py-1"
          >
            &lt;/{node.tagName.toLowerCase()}&gt;
          </div>
        </div>
      )}
    </div>
  );
};

const DOMTree: React.FC<DOMTreeProps> = ({ tree }) => {
  if (!tree) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No DOM tree available. Try refreshing the extension.
      </div>
    );
  }

  return (
    <div className="font-mono text-sm">
      <TreeNode node={tree} depth={0} />
    </div>
  );
};

export default DOMTree;
