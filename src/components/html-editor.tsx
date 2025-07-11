
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HtmlEditorProps {
  initialValue: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newValue: string) => void;
}

export function HtmlEditor({ initialValue, isOpen, onClose, onSave }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialValue);
  const [iframeContent, setIframeContent] = useState("");

  useEffect(() => {
    setHtml(initialValue);
  }, [initialValue]);

  useEffect(() => {
    // To prevent hydration errors, we only update the iframe content on the client side
    // after the component has mounted.
    const timeoutId = setTimeout(() => {
        setIframeContent(html);
    }, 300); // Debounce iframe updates
    return () => clearTimeout(timeoutId);
  }, [html]);

  const handleSave = () => {
    onSave(html);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>HTML Visual Editor</DialogTitle>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden h-[calc(100%-80px)]">
          <div className="flex flex-col gap-2 h-full">
            <label htmlFor="html-input" className="font-medium text-sm">HTML Code</label>
            <Textarea
              id="html-input"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="flex-1 font-code resize-none"
              placeholder="Enter your HTML here..."
            />
          </div>
          <div className="flex flex-col gap-2 h-full">
            <label className="font-medium text-sm">Preview</label>
            <div className="flex-1 border rounded-md bg-white">
                <iframe
                    srcDoc={iframeContent}
                    title="HTML Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0"
                />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

