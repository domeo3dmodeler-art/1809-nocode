'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
  imageUrl?: string;
}

interface CategoryTreeSelectorProps {
  value: string;
  onChange: (categoryId: string, categoryInfo?: any) => void;
  categories: Category[];
}

const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  value,
  onChange,
  categories
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTree = (categories: Category[], parentId: string | null = null): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildTree(categories, cat.id)
      }));
  };

  const tree = buildTree(categories);

  const renderNode = (node: Category, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = value === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 rounded
            ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onChange(node.id, node)}
        >
          <div
            className="flex items-center mr-2"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleExpanded(node.id);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
          
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 mr-2 text-gray-500" />
          )}
          
          <span className="text-sm font-medium truncate">{node.name}</span>
          
          {node.productCount !== undefined && (
            <span className="ml-auto text-xs text-gray-500">
              ({node.productCount})
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
      {tree.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          Категории не найдены
        </div>
      ) : (
        tree.map(node => renderNode(node))
      )}
    </div>
  );
};

export default CategoryTreeSelector;
