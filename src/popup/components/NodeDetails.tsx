import React, { useState } from "react";
import { FiCopy, FiBookmark, FiZap } from "react-icons/fi";
import { DOMNode, useStore } from "../store";

interface NodeDetailsProps {
  node: DOMNode;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node }) => {
  const [activeTab, setActiveTab] = useState<"info" | "attributes" | "ai">(
    "info"
  );
  const { bookmarkNode } = useStore();
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleBookmark = () => {
    bookmarkNode(node);
  };

  const requestAIExplanation = () => {
    setIsLoadingAI(true);

    // Simulate AI request with timeout
    setTimeout(() => {
      // This is where you would make an actual API call to OpenAI or similar
      const mockExplanation = `This ${node.tagName.toLowerCase()} element appears to be a ${
        node.attributes.class?.includes("nav")
          ? "navigation component"
          : node.attributes.class?.includes("btn")
          ? "button component"
          : node.attributes.class?.includes("header")
          ? "header component"
          : "content container"
      }. It contains ${node.children.length} child elements.
      
      ${
        node.tagName === "DIV" && !node.attributes.role
          ? "Suggestion: Consider using a more semantic element or adding a role attribute for better accessibility."
          : ""
      }
      
      ${
        node.attributes.id
          ? `It has a unique identifier "${node.attributes.id}" which can be targeted with CSS using #${node.attributes.id}.`
          : ""
      }`;

      setAiExplanation(mockExplanation);
      setIsLoadingAI(false);
    }, 1500);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Selected Element</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleBookmark}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Bookmark this node"
          >
            <FiBookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => copyToClipboard(node.cssSelector || "")}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Copy CSS selector"
          >
            <FiCopy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-2 mb-3">
        <code className="text-xs">
          <span className="text-orange-600 dark:text-orange-400">
            &lt;{node.tagName.toLowerCase()}
          </span>
          {node.attributes.id && (
            <span className="text-purple-600 dark:text-purple-400">
              {" "}
              id="{node.attributes.id}"
            </span>
          )}
          {node.attributes.class && (
            <span className="text-green-600 dark:text-green-400">
              {" "}
              class="{node.attributes.class}"
            </span>
          )}
          <span className="text-orange-600 dark:text-orange-400">&gt;</span>
        </code>
      </div>

      <div className="mb-3">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-3 py-1.5 text-sm font-medium ${
              activeTab === "info"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Info
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium ${
              activeTab === "attributes"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("attributes")}
          >
            Attributes
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium ${
              activeTab === "ai"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("ai")}
          >
            AI Insights
          </button>
        </div>

        <div className="mt-2">
          {activeTab === "info" && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tag:</span>
                <span className="font-mono">{node.tagName.toLowerCase()}</span>
              </div>
              {node.xpath && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    XPath:
                  </span>
                  <span
                    className="font-mono text-xs truncate max-w-[220px]"
                    title={node.xpath}
                  >
                    {node.xpath}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Children:
                </span>
                <span>{node.children.length}</span>
              </div>
              {node.textContent && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">
                    Text Content:
                  </span>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-xs max-h-20 overflow-auto">
                    {node.textContent}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "attributes" && (
            <div>
              {Object.keys(node.attributes).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No attributes
                </p>
              ) : (
                <div className="space-y-1 text-sm">
                  {Object.entries(node.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                      <span className="text-gray-500 dark:text-gray-400">
                        {key}:
                      </span>
                      <span className="font-mono text-xs max-w-[220px] break-all">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div>
              {!aiExplanation && !isLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <button
                    onClick={requestAIExplanation}
                    className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
                  >
                    <FiZap className="mr-1.5" /> Explain This Element
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Get AI-powered insights about this element's purpose and
                    suggestions for improvement.
                  </p>
                </div>
              ) : isLoadingAI ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <div className="text-sm space-y-2">
                  <p className="whitespace-pre-line">{aiExplanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeDetails;
