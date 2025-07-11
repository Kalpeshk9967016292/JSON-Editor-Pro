
"use client";

import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(
    () => import('react-quill'), 
    { 
        ssr: false,
        loading: () => <Skeleton className="h-[calc(100%-80px)] w-full" />
    }
);


interface HtmlEditorProps {
  initialValue: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newValue: string) => void;
}

export function HtmlEditor({ initialValue, isOpen, onClose, onSave }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialValue);

  useEffect(() => {
    setHtml(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(html);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>HTML Visual Editor</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pb-4">
            <ReactQuill
                theme="snow"
                value={html}
                onChange={setHtml}
                modules={modules}
                formats={formats}
                className="h-full bg-white text-black"
                style={{color: "black"}}
            />
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
