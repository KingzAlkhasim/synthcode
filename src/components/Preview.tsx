import { X, RefreshCw, ExternalLink, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { useState } from 'react';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function Preview() {
  const { previewOpen, togglePreview, files } = useIDE();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  if (!previewOpen) return null;

  const buildPreviewDoc = () => {
    const htmlFile = files.find(f => f.name === 'index.html' || f.language === 'html');
    if (!htmlFile) return '<html><body style="background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;"><h2>No HTML file found</h2></body></html>';

    let content = htmlFile.content;
    files.filter(f => f.language === 'javascript').forEach(jsFile => {
      content = content.replace(
        new RegExp(`<script[^>]*src=["']${jsFile.name.replace('.', '\\.')}["'][^>]*>\\s*</script>`, 'i'),
        `<script>${jsFile.content}<\/script>`
      );
    });
    files.filter(f => f.language === 'css').forEach(cssFile => {
      content = content.replace(
        new RegExp(`<link[^>]*href=["']${cssFile.name.replace('.', '\\.')}["'][^>]*/?>`, 'i'),
        `<style>${cssFile.content}</style>`
      );
    });
    return content;
  };

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col">
      <div className="h-9 bg-slate-900 border-b border-slate-700 flex items-center px-3 gap-2 shrink-0">
        <button onClick={togglePreview} className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors">
          <X size={12} /> Close
        </button>
        <button onClick={() => { const frame = document.getElementById('preview-frame') as HTMLIFrameElement; if (frame) frame.srcdoc = buildPreviewDoc(); }}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>

        <div className="flex bg-slate-800 rounded p-0.5">
          {[{ mode: 'desktop' as const, icon: Monitor }, { mode: 'tablet' as const, icon: Tablet }, { mode: 'mobile' as const, icon: Smartphone }].map(({ mode, icon: Icon }) => (
            <button key={mode} onClick={() => setDeviceMode(mode)}
              className={`p-1 rounded transition-colors ${deviceMode === mode ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
              <Icon size={12} />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button onClick={() => { const blob = new Blob([buildPreviewDoc()], { type: 'text/html' }); window.open(URL.createObjectURL(blob), '_blank'); }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded transition-colors">
          <ExternalLink size={12} /> Open External
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
        <div className={`h-full ${getDeviceWidth()} rounded-lg overflow-hidden border border-slate-600 shadow-2xl bg-white`}>
          <iframe id="preview-frame" srcDoc={buildPreviewDoc()} className="w-full h-full border-none" sandbox="allow-scripts allow-modals" title="Preview" />
        </div>
      </div>
    </div>
  );
}
