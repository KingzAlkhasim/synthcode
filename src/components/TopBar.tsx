import { Play, Eye, Settings, Sparkles, Menu, ChevronDown } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { AI_MODELS } from '../types/ide';

export function TopBar() {
  const { toggleSidebar, toggleAIPanel, togglePreview, toggleSettings, runCode, sidebarOpen, aiPanelOpen, aiModel, settingsOpen } = useIDE();

  const currentModel = AI_MODELS.find(m => m.id === aiModel);

  return (
    <header className="h-9 bg-slate-900 border-b border-slate-800 flex items-center px-3 shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <button onClick={toggleSidebar} className="lg:hidden p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
          <Menu size={14} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">SC</span>
          </div>
          <span className="text-sm font-semibold text-white hidden sm:inline">SynthCode</span>
        </div>
      </div>

      {/* Menu */}
      <div className="hidden md:flex items-center ml-4 gap-1">
        {['File', 'Edit', 'View', 'Run', 'Help'].map(menu => (
          <button key={menu} className="px-2 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
            {menu}
          </button>
        ))}
      </div>

      {/* Center - Model Selector */}
      <div className="flex-1 flex items-center justify-center">
        <button className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-300 hover:bg-slate-700 transition-colors">
          <Sparkles size={12} className="text-emerald-400" />
          <span className="font-medium">{currentModel?.name || 'AI'}</span>
          <ChevronDown size={10} className="text-slate-500" />
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={runCode}
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded transition-colors"
          title="Run (Ctrl+Enter)"
        >
          <Play size={12} />
          <span className="hidden sm:inline">Run</span>
        </button>

        <button
          onClick={togglePreview}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          title="Preview (Ctrl+E)"
        >
          <Eye size={12} />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button
          onClick={toggleAIPanel}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-[11px] font-medium ${
            aiPanelOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={12} />
          <span className="hidden sm:inline">AI</span>
        </button>

        <button
          onClick={toggleSettings}
          className={`p-1.5 rounded transition-colors ${
            settingsOpen ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Settings (Ctrl+,)"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}
