import JsonEditorPro from '@/components/json-editor-pro';
import { JsonInfoArticle } from '@/components/json-info-article';

export default function Home() {
  return (
    <div className="flex flex-col min-h-svh">
      <div className="flex-1 flex flex-col">
        <JsonEditorPro />
      </div>
      <div className="p-4 lg:p-6">
        <JsonInfoArticle />
      </div>
    </div>
  );
}
