"use client";

import { useState, useCallback } from "react";
import { getIn, setIn, unsetIn, insertIn } from "@/lib/json-utils";

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject extends Record<string, JsonValue> {}
export interface JsonArray extends Array<JsonValue> {}
export type JsonData = JsonObject | JsonArray;
export type JsonPath = (string | number)[];

export function useJsonEditor(initialData: JsonData | null) {
  const [data, setData] = useState<JsonData | null>(initialData);
  const [source, setSource] = useState<{type: 'none' | 'url' | 'file' | 'sample', value: string}>({type: 'sample', value: 'sample.json'});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // The root is always expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "[]": true });

  const toggleNode = useCallback((path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const updateNode = useCallback((path: JsonPath, value: JsonValue, newKey?: string) => {
    setData(currentData => {
      if (!currentData) return null;
      if (path.length === 0) {
        return value as JsonData;
      }
      
      const parentPath = path.slice(0, -1);
      const oldKey = path[path.length - 1];
      
      let temp_data = structuredClone(currentData);

      if (newKey !== undefined && newKey !== String(oldKey)) {
        // Key change
        let parent = getIn(temp_data, parentPath);
        if (typeof parent === 'object' && parent !== null && !Array.isArray(parent)) {
          // This is a bit complex: we need to recreate the object to preserve order
          const newParent: JsonObject = {};
          for (const key in parent) {
            if (key === String(oldKey)) {
              newParent[newKey] = parent[key];
            } else {
              newParent[key] = parent[key];
            }
          }
          return setIn(temp_data, parentPath, newParent);
        }
      } else {
        // Value change
        return setIn(temp_data, path, value);
      }
      return temp_data;
    });
  }, []);

  const addNode = useCallback((path: JsonPath, key: string | null, value: JsonValue) => {
    setData(currentData => {
      if (!currentData) return null;
      const newPath = key !== null ? [...path, key] : path;
      const newData = insertIn(structuredClone(currentData), newPath, value, key === null);
      
      // Expand parent node
      const parentPath = JSON.stringify(path);
      if (!expanded[parentPath]) {
        setExpanded(prev => ({ ...prev, [parentPath]: true }));
      }
      return newData;
    });
  }, [expanded]);

  const deleteNode = useCallback((path: JsonPath) => {
    setData(currentData => {
      if (!currentData) return null;
      return unsetIn(structuredClone(currentData), path);
    });
  }, []);

  const duplicateNode = useCallback((path: JsonPath) => {
    setData(currentData => {
      if (!currentData) return null;
      const valueToDuplicate = structuredClone(getIn(currentData, path));
      const parentPath = path.slice(0, -1);
      const parent = getIn(currentData, parentPath);
      const isArray = Array.isArray(parent);
      
      return insertIn(structuredClone(currentData), path, valueToDuplicate, isArray, true);
    });
  }, []);

  return {
    data,
    setData,
    source,
    setSource,
    loading,
    setLoading,
    error,
    setError,
    expanded,
    setExpanded,
    toggleNode,
    updateNode,
    addNode,
    deleteNode,
    duplicateNode,
  };
}
