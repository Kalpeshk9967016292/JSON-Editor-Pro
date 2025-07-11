
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, Plus, MoreVertical, Trash2, Copy, Edit, Check, X, Bot, Wand2, Loader2, ArrowRightLeft, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { suggestJsonStructure } from "@/ai/flows/suggest-json-structure";
import { useToast } from "@/hooks/use-toast";
import type { JsonData, JsonPath, JsonValue } from "@/hooks/use-json-editor";
import { HtmlEditor } from "./html-editor";

type JsonTreeViewProps = {
  data: JsonData;
  expanded: Record<string, boolean>;
  onToggle: (path: string) => void;
  onUpdate: (path: JsonPath, value: JsonValue, key?: string) => void;
  onAdd: (path: JsonPath, key: string | null, value: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  onDuplicate: (path: JsonPath) => void;
};

type JsonNodeProps = {
  nodeKey: string;
  nodeValue: JsonValue;
  path: JsonPath;
  level: number;
} & Omit<JsonTreeViewProps, 'data'>;

const DATA_TYPES = ["string", "number", "boolean", "object", "array", "null"];
const getDataType = (value: JsonValue) => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};
const TYPE_COLORS: Record<string, string> = {
  string: "text-green-600 dark:text-green-400",
  number: "text-blue-600 dark:text-blue-400",
  boolean: "text-red-600 dark:text-red-500",
  null: "text-gray-500",
  object: "text-gray-800 dark:text-gray-200",
  array: "text-gray-800 dark:text-gray-200",
};

const isHtml = (str: string) => typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str);

export function JsonTreeView(props: JsonTreeViewProps) {
  return (
    <TooltipProvider>
      <div className="font-code text-sm">
        <JsonNode {...props} nodeKey="root" nodeValue={props.data} path={[]} level={0} />
      </div>
    </TooltipProvider>
  );
}

function JsonNode(props: JsonNodeProps) {
  const { nodeKey, nodeValue, path, level, expanded, onToggle, onUpdate, onAdd, onDelete, onDuplicate } = props;
  const isRoot = level === 0;
  const dataType = getDataType(nodeValue);
  const isObject = dataType === 'object';
  const isArray = dataType === 'array';
  const isScalar = !isObject && !isArray;

  const stringPath = JSON.stringify(path);
  const isExpanded = !!expanded[stringPath];

  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editKeyValue, setEditKeyValue] = useState(nodeKey);
  const [editValue, setEditValue] = useState(isScalar ? String(nodeValue) : "");

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isHtmlEditorOpen, setHtmlEditorOpen] = useState(false);
  
  const valueIsHtml = dataType === 'string' && isHtml(nodeValue as string);

  const handleKeyUpdate = () => {
    if (editKeyValue !== nodeKey) {
      onUpdate(path, nodeValue, editKeyValue);
    }
    setIsEditingKey(false);
  };

  const handleValueUpdate = (type: string, value: string) => {
    let newValue: JsonValue = value;
    if (type === 'number') newValue = Number(value);
    else if (type === 'boolean') newValue = value === 'true';
    else if (type === 'null') newValue = null;
    else if (type === 'object') newValue = {};
    else if (type === 'array') newValue = [];
    
    if (JSON.stringify(newValue) !== JSON.stringify(nodeValue)) {
      onUpdate(path, newValue);
    }
    setIsEditingValue(false);
  }

  const handleHtmlSave = (newHtml: string) => {
    onUpdate(path, newHtml);
  }

  const toggleExpand = () => onToggle(stringPath);
  
  const {toast} = useToast();
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${type} copied to clipboard.` });
  };
  
  const parentType = Array.isArray(props.nodeValue) ? 'array' : 'object';

  return (
    <div className={cn("relative group/node", !isRoot && 'ml-6')}>
      <div className={cn("flex items-center hover:bg-secondary/50 rounded-md", isRoot ? 'py-1' : 'py-0.5')}>
        {/* Expander */}
        <div className="w-5 flex-shrink-0">
          {!isScalar && (Object.keys(nodeValue as object).length > 0) && (
            <button onClick={toggleExpand} className="p-0.5 rounded-sm hover:bg-secondary">
              <ChevronRight className={cn("size-4 transition-transform", isExpanded && "rotate-90")} />
            </button>
          )}
        </div>
        
        {/* Key */}
        {!isRoot && (
           <div onDoubleClick={() => setIsEditingKey(true)}>
            {isEditingKey ? (
              <Input
                value={editKeyValue}
                onChange={(e) => setEditKeyValue(e.target.value)}
                onBlur={handleKeyUpdate}
                onKeyDown={(e) => e.key === 'Enter' && handleKeyUpdate()}
                autoFocus
                className="h-6 px-1 mr-1"
              />
            ) : (
              <span className="text-gray-600 dark:text-gray-400 font-medium mr-1">{nodeKey}:</span>
            )}
           </div>
        )}

        {/* Value */}
        {isScalar && (
          <div onDoubleClick={() => !valueIsHtml && setIsEditingValue(true)} className="flex items-center gap-1">
            {isEditingValue ? (
                <>
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleValueUpdate(dataType, editValue)}
                    onKeyDown={(e) => e.key === 'Enter' && handleValueUpdate(dataType, editValue)}
                    autoFocus
                    className="h-6 px-1"
                />
                <Button size="icon" variant="ghost" className="size-6" onClick={() => handleValueUpdate(dataType, editValue)}><Check className="size-4 text-green-600"/></Button>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => setIsEditingValue(false)}><X className="size-4 text-red-600"/></Button>
                </>
            ) : (
              <>
                <span className={cn("font-mono", TYPE_COLORS[dataType])}>
                    {dataType === 'string' ? `"${nodeValue}"` : String(nodeValue)}
                </span>
                {valueIsHtml && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="size-6 ml-1" onClick={() => setHtmlEditorOpen(true)}>
                        <Code className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit HTML</TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        )}
        
        {!isScalar && (
          <span className="text-muted-foreground text-xs">
            {isArray ? `Array[${(nodeValue as []).length}]` : `Object{${Object.keys(nodeValue as object).length}}`}
          </span>
        )}
        
        {/* Actions */}
        <div className="ml-auto opacity-0 group-hover/node:opacity-100 transition-opacity flex items-center pr-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => setAddDialogOpen(true)}>
                        <Plus className="size-4"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Add child/sibling</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(nodeValue, null, 2), 'Value')}>
                  <Copy className="mr-2 size-4" /> Copy Value
                </DropdownMenuItem>
                {!isRoot && <DropdownMenuItem onClick={() => copyToClipboard(nodeKey, 'Key')}><Copy className="mr-2 size-4" /> Copy Key</DropdownMenuItem>}
                {!isRoot && <DropdownMenuItem onClick={() => onDuplicate(path)}><Copy className="mr-2 size-4" /> Duplicate Node</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditingValue(true)} disabled={isScalar}>
                    <ArrowRightLeft className="mr-2 size-4" /> Change Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => !isRoot && onDelete(path)} className="text-destructive" disabled={isRoot}>
                  <Trash2 className="mr-2 size-4" /> Delete Node
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      {/* Children */}
      {isExpanded && !isScalar && (
        <div className="flex">
            <div className="w-[1px] bg-border ml-2.5 my-1"></div>
            <div className="flex-1">
            {Object.entries(nodeValue as object).map(([key, value]) => (
                <JsonNode
                {...props}
                key={key}
                nodeKey={key}
                nodeValue={value}
                path={[...path, isArray ? parseInt(key) : key]}
                level={level + 1}
                />
            ))}
            </div>
        </div>
      )}

      <AddNodeDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={onAdd}
        parentPath={path}
        parentType={isObject ? "object" : (isArray ? "array" : "scalar")}
        siblings={isRoot ? (nodeValue ?? {}) : Object.values(nodeValue ?? {})}
      />
      
      <ChangeTypeDialog 
        isOpen={isEditingValue && !isScalar}
        onClose={() => setIsEditingValue(false)}
        currentType={dataType}
        onConfirm={(newType) => handleValueUpdate(newType, "")}
      />
      {valueIsHtml && (
        <HtmlEditor
          isOpen={isHtmlEditorOpen}
          onClose={() => setHtmlEditorOpen(false)}
          initialValue={nodeValue as string}
          onSave={handleHtmlSave}
        />
      )}
    </div>
  );
}

function ChangeTypeDialog({isOpen, onClose, currentType, onConfirm}: {isOpen: boolean, onClose: () => void, currentType: string, onConfirm: (type: string) => void}) {
    const [newType, setNewType] = useState(currentType);
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Data Type</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {DATA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { onConfirm(newType); onClose(); }}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AddNodeDialog({isOpen, onClose, onAdd, parentPath, parentType, siblings}: {isOpen: boolean, onClose: () => void, onAdd: (path: JsonPath, key: string | null, value: JsonValue) => void, parentPath: JsonPath, parentType: string, siblings: any[]}) {
    const [key, setKey] = useState("");
    const [type, setType] = useState("string");
    const [value, setValue] = useState<JsonValue>("");
    const [loadingAI, setLoadingAI] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if(isOpen) {
            setKey("");
            setType("string");
            setValue("");
        }
    }, [isOpen]);

    const handleAdd = () => {
        let finalValue: JsonValue = value;
        if(type === 'number') finalValue = 0;
        if(type === 'boolean') finalValue = false;
        if(type === 'object') finalValue = {};
        if(type === 'array') finalValue = [];
        if(type === 'null') finalValue = null;
        
        onAdd(parentPath, parentType === 'array' ? null : key, finalValue);
        onClose();
    };

    const handleAISuggest = async () => {
        setLoadingAI(true);
        try {
            const siblingsJson = JSON.stringify(siblings);
            const result = await suggestJsonStructure({
                siblingsJson,
                newElementType: type as "object" | "array" | "string" | "number" | "boolean" | "null",
            });
            const suggested = JSON.parse(result.suggestedStructure);
            onAdd(parentPath, parentType === 'array' ? null : key, suggested);
            toast({
              title: "AI Suggestion Applied",
              description: "The suggested JSON structure has been added.",
            });
            onClose();

        } catch (error) {
            console.error("AI suggestion failed:", error);
            toast({
                variant: "destructive",
                title: "AI Suggestion Failed",
                description: "Could not generate a suggestion. Please try again.",
            });
        } finally {
            setLoadingAI(false);
        }
    }

    const pathIsArray = parentType === 'array';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Node</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!pathIsArray && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="key" className="text-right">Key</Label>
                            <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} className="col-span-3" />
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {DATA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleAISuggest} disabled={loadingAI || (type !== 'object' && type !== 'array')} >
                        {loadingAI ? <Loader2 className="mr-2 size-4 animate-spin"/> : <Bot className="mr-2 size-4" />}
                        Suggest with AI
                    </Button>
                    <Button onClick={handleAdd}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

