
"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileUp, Link as LinkIcon, Loader2, Workflow, X, Search } from "lucide-react";
import { JsonLogo } from "./icons";
import { JsonTreeView } from "./json-tree-view";
import { useJsonEditor } from "@/hooks/use-json-editor";
import { useToast } from "@/hooks/use-toast";
import { AdPlaceholder } from "./ad-placeholder";
import type { JsonPath, JsonValue } from "@/hooks/use-json-editor";

const sampleJson = {
  "id": "0001",
  "type": "donut",
  "name": "Cake",
  "ppu": 0.55,
  "description": "A delicious cake donut.",
  "html_example": "<h1>Welcome</h1><p>This is an <strong>HTML</strong> string.</p>",
  "batters": {
    "batter": [
      { "id": "1001", "type": "Regular" },
      { "id": "1002", "type": "Chocolate" },
      { "id": "1003", "type": "Blueberry" },
      { "id": "1004", "type": "Devil's Food" }
    ]
  },
  "topping": [
    { "id": "5001", "type": "None" },
    { "id": "5002", "type": "Glazed" },
    { "id": "5005", "type": "Sugar" },
    { "id": "5007", "type": "Powdered Sugar" },
    { "id": "5006", "type": "Chocolate with Sprinkles" },
    { "id": "5003", "type": "Chocolate" },
    { "id": "5004", "type": "Maple" }
  ]
};

export default function JsonEditorPro() {
  const {
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
  } = useJsonEditor(sampleJson);

  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFetchUrl = async () => {
    if (!url) {
      setError("Please enter a URL.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status} ${response.statusText}`;
        if (response.status === 404) {
            errorMsg = "The requested URL was not found (404). Please check the URL and try again.";
        } else if (response.status === 403) {
            errorMsg = "Access to the URL is forbidden (403). The server is refusing to fulfill the request.";
        } else if (response.status >= 500) {
            errorMsg = `The server encountered an error (${response.status}). Please try again later.`;
        }
        throw new Error(errorMsg);
      }
      const textData = await response.text();
      try {
        const jsonData = JSON.parse(textData);
        setData(jsonData);
        setSource({ type: "url", value: url });
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw new Error(`Invalid JSON format: ${e.message}.`);
        }
        throw e;
      }

    } catch (e) {
      let errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
       if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Could not fetch the URL. This might be due to a network issue or a CORS policy blocking the request. Check the browser's developer console for more details.";
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== "string") {
            throw new Error("File could not be read as text.");
          }
          const jsonData = JSON.parse(text);
          setData(jsonData);
          setSource({ type: "file", value: file.name });
        } catch (e) {
          let errorMessage = "An unknown error occurred while parsing the file.";
          if (e instanceof SyntaxError) {
              errorMessage = `Invalid JSON format: ${e.message}.`;
          } else if (e instanceof Error) {
              errorMessage = e.message;
          }
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error Parsing File",
            description: errorMessage,
          });
          setData(null);
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to read file.",
        });
        setLoading(false);
      }
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = "";
  };

  const handleDownload = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = source.value ? source.value.split('/').pop() || 'data.json' : "data.json";
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const clearData = () => {
    setData(null);
    setSource({type: 'none', value: ''});
    setError(null);
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !data) {
      return [];
    }
    const results: string[] = [];
    const lowerCaseQuery = searchQuery.toLowerCase();

    function traverse(node: JsonValue, path: JsonPath) {
      if (typeof node === 'object' && node !== null) {
        Object.entries(node).forEach(([key, value]) => {
          const newPath = [...path, Array.isArray(node) ? parseInt(key) : key];
          if (key.toLowerCase().includes(lowerCaseQuery)) {
            results.push(JSON.stringify(newPath));
          }
          if (typeof value === 'string' && value.toLowerCase().includes(lowerCaseQuery)) {
            results.push(JSON.stringify(newPath));
          } else if (typeof value === 'number' && String(value).toLowerCase().includes(lowerCaseQuery)) {
            results.push(JSON.stringify(newPath));
          }
          traverse(value, newPath);
        });
      }
    }

    traverse(data, []);
    return results;
  }, [data, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const pathsToExpand: Record<string, boolean> = { "[]": true };
      searchResults.forEach(stringPath => {
        const path = JSON.parse(stringPath);
        for (let i = 0; i < path.length; i++) {
          pathsToExpand[JSON.stringify(path.slice(0, i + 1))] = true;
        }
      });
      setExpanded(pathsToExpand);
    } else {
      setExpanded({ "[]": true });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <JsonLogo className="size-8 text-primary" />
              <h1 className="text-xl font-headline font-bold">JSON Editor Pro</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4 flex flex-col gap-6">
            <div className="space-y-2">
              <h2 className="font-semibold">Load from URL</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/data.json"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  disabled={loading}
                />
                <Button onClick={handleFetchUrl} disabled={loading} size="icon" variant="ghost">
                  <LinkIcon className="size-4"/>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-semibold">Load from File</h2>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} className="w-full" disabled={loading}>
                <FileUp className="mr-2 size-4" />
                Choose File
              </Button>
            </div>
            <div className="space-y-2">
              <h2 className="font-semibold">Export</h2>
              <Button onClick={handleDownload} className="w-full" variant="secondary" disabled={!data || loading}>
                <Download className="mr-2 size-4" />
                Download JSON
              </Button>
            </div>
            <AdPlaceholder />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 min-h-0">
          <header className="flex items-center justify-between p-2 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-center px-4">
              {source.value && (
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium truncate">{source.value}</span>
                    <Button variant="ghost" size="icon" className="size-6" onClick={clearData}>
                        <X className="size-4" />
                    </Button>
                </div>
              )}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search keys or values..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={!data || loading}
              />
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}
            {!loading && error && (
              <div className="flex items-center justify-center h-full">
                  <Card className="w-full max-w-md bg-destructive/10 border-destructive/20">
                      <CardHeader>
                          <CardTitle className="text-destructive">Error</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-destructive-foreground/80 font-mono text-sm">{error}</p>
                      </CardContent>
                  </Card>
              </div>
            )}
            {!loading && !error && !data && (
               <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                      <Workflow className="mx-auto size-12 text-muted-foreground" />
                      <h2 className="mt-4 text-xl font-semibold font-headline">Welcome to JSON Editor Pro</h2>
                      <p className="mt-2 text-muted-foreground">Load a JSON file or fetch from a URL to get started.</p>
                  </div>
              </div>
            )}
            {!loading && !error && data && (
              <JsonTreeView 
                data={data}
                expanded={expanded}
                onToggle={toggleNode}
                onUpdate={updateNode}
                onAdd={addNode}
                onDelete={deleteNode}
                onDuplicate={duplicateNode}
                searchResults={searchResults}
                searchQuery={searchQuery}
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
