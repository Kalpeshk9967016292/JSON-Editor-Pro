
"use client";

import { useRef } from "react";
import { Editor } from '@tinymce/tinymce-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface HtmlEditorProps {
  initialValue: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newValue: string) => void;
}

export function HtmlEditor({ initialValue, isOpen, onClose, onSave }: HtmlEditorProps) {
  const editorRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();

  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.getContent());
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>HTML Visual Editor</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pb-4">
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'}
            onInit={(_evt, editor) => editorRef.current = editor}
            initialValue={initialValue}
            init={{
              height: '100%',
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              skin: resolvedTheme === 'dark' ? 'oxide-dark' : 'oxide',
              content_css: resolvedTheme === 'dark' ? 'dark' : 'default',
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
