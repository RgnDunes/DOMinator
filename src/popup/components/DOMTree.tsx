import React from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { DOMNode, useStore } from "../store";

interface DOMTreeProps {
  tree: DOMNode | null;
}

interface TreeNodeProps {
  node: DOMNode;
  depth: number;
  isLastChild?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  isLastChild = false,
}) => {
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

  const getNodeLabel = () => {
    let label = node.tagName.toLowerCase();
    if (node.attributes.id) {
      label += `#${node.attributes.id}`;
    } else if (node.attributes.class) {
      const mainClass = node.attributes.class.split(" ")[0];
      if (mainClass) {
        label += `.${mainClass}`;
      }
    }
    return label;
  };

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className="absolute border-l-2 border-gray-300 dark:border-gray-700"
          style={{
            left: `${depth * 20 - 10}px`,
            top: "-10px",
            height: isLastChild ? "20px" : "100%",
            width: "2px",
          }}
        />
      )}

      {depth > 0 && (
        <div
          className="absolute border-t-2 border-gray-300 dark:border-gray-700"
          style={{
            left: `${depth * 20 - 10}px`,
            top: "10px",
            width: "10px",
            height: "2px",
          }}
        />
      )}

      <div
        className={`
          relative ml-${depth * 5} mb-1 pl-2 py-1 pr-2 rounded-md cursor-pointer
          ${
            isSelected
              ? "bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-500"
              : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          }
          border hover:shadow-md transition-shadow duration-200
        `}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={handleNodeClick}
      >
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={handleToggleCollapse}
              className="mr-1 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isCollapsed ? (
                <FiChevronRight className="w-3 h-3" />
              ) : (
                <FiChevronDown className="w-3 h-3" />
              )}
            </button>
          )}

          <div className="flex items-center overflow-hidden">
            <span className="font-mono text-sm text-orange-600 dark:text-orange-400 font-medium">
              {getNodeLabel()}
            </span>

            {node.textContent && node.children.length === 0 && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {node.textContent.length > 15
                  ? `${node.textContent.substring(0, 15)}...`
                  : node.textContent}
              </span>
            )}
          </div>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="ml-5">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLastChild={index === node.children.length - 1}
            />
          ))}
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
    <div className="p-2">
      <TreeNode node={tree} depth={0} />
    </div>
  );
};

export default DOMTree;
