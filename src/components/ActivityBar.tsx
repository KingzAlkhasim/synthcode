import { Files, Search, GitBranch, Bug, Puzzle, Sparkles, Settings } from 'lucide-react';
import { useIDE } from '../store/IDEContext';

export function ActivityBar() {
  const { toggleSidebar, toggleAIPanel, toggleSettings, aiPanelOpen } = useIDE();

  return (
    <div className="w-12 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-2 shrink-0">
      <button onClick={toggleSidebar} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded" title="Explorer (Ctrl+B)">
        <Files size={20} />
      </button>
      <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors rounded" title="Search">
        <Search size={20} />
      </button>
      <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors rounded" title="Source Control">
        <GitBranch size={20} />
      </button>
      <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors rounded" title="Debug">
        <Bug size={20} />
      </button>

      <div className="flex-1" />

      <button onClick={toggleAIPanel} className={`w-12 h-12 flex items-center justify-center rounded transition-colors ${aiPanelOpen ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`} title="AI Assistant">
        <Sparkles size={20} />
      </button>
      <button onClick={toggleSettings} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors rounded" title="Settings (Ctrl+,)">
        <Settings size={20} />
      </button>
    </div>
  );
}
