import JsonEditorPro from '@/components/json-editor-pro';
import { JsonInfoArticle } from '@/components/json-info-article';

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="relative h-svh overflow-hidden">
        <JsonEditorPro />
      </div>
      <div className="p-4 lg:p-6 bg-background">
        <JsonInfoArticle />
      </div>
    </div>
  );
}
