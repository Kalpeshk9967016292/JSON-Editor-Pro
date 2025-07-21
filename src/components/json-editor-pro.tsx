
"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileUp, Link as LinkIcon, Loader2, Workflow, X, Search, CheckCircle } from "lucide-react";
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
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
      setSource({ type: "url", value: url });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to fetch or parse JSON from URL: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch or parse JSON from URL: ${errorMessage}`,
      });
      setData(null);
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
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
          setError(`Failed to parse JSON from file: ${errorMessage}`);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to parse JSON from file: ${errorMessage}`,
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
      <SidebarInset className="flex flex-col">
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
                        <p className="text-destructive-foreground/80">{error}</p>
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

          <div className="mt-16 text-foreground/90 max-w-4xl mx-auto">
            <article className="prose prose-lg dark:prose-invert prose-headings:font-headline prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80">
                <h2 className="text-3xl font-bold font-headline">The Ultimate Online JSON Editor for Developers</h2>
                <p>
                    JSON Editor Pro is a powerful, free, and intuitive online tool designed to help developers and data analysts view, edit, and format JSON data effortlessly.
                    Whether you are debugging an API response, creating configuration files, or simply exploring a JSON dataset, our tool provides a clean, user-friendly tree view to streamline your workflow.
                </p>

                <h3 className="text-2xl font-bold font-headline mt-8">Key Features</h3>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Interactive Tree View:</strong> Navigate your JSON structure with ease. Expand and collapse nodes to focus on the data that matters.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Load from Anywhere:</strong> Upload a JSON file from your local machine or fetch data directly from a remote URL.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Powerful Editing:</strong> Add, edit, duplicate, and delete nodes on the fly. Change data types (e.g., string, number, boolean) with a simple dropdown menu.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Smart Search:</strong> Quickly find keys or values within your JSON data. Search results are automatically highlighted and their parent nodes expanded.</span>
                    </li>
                     <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>Visual HTML Editor:</strong> Edit HTML content embedded within your JSON strings using an intuitive WYSIWYG editor.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="size-6 text-primary mr-3 mt-1 shrink-0" />
                        <span><strong>One-Click Download:</strong> Download your edited and beautifully formatted JSON file with a single click.</span>
                    </li>
                </ul>

                <h3 className="text-2xl font-bold font-headline mt-8">What is JSON?</h3>
                <p>
                    JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is based on a subset of the JavaScript Programming Language and has become the de facto standard for data transmission in web applications.
                </p>
                <p>
                    A JSON object consists of a collection of key/value pairs, where keys are strings and values can be strings, numbers, booleans, arrays, or other JSON objects. This versatility makes it ideal for a wide range of applications.
                </p>
                
                <h3 className="text-2xl font-bold font-headline mt-8">Common Uses for a JSON Editor</h3>
                <ul>
                    <li><strong>API Development and Testing:</strong> Developers can paste API responses to quickly inspect and debug the data structure.</li>
                    <li><strong>Configuration Management:</strong> Many applications use JSON for configuration files. An editor makes it easy to manage these settings without syntax errors.</li>
                    <li><strong>Data Analysis:</strong> Data scientists and analysts can use the tool to explore and understand the structure of JSON datasets.</li>
                    <li><strong>Learning and Education:</strong> Students learning about data structures can use the editor to visualize how JSON objects and arrays are built.</li>
                </ul>
            </article>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    