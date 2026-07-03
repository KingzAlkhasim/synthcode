import { useState, useEffect, useRef } from 'react';
import { Play, Eye, Terminal, FolderOpen, Bot, Trash2, Plus, Save, Settings, FileCode, X } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { AI_MODELS, AIModel } from '../types/ide';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, toggleSidebar, toggleAIPanel, toggleTerminal, togglePreview, toggleSettings, runCode, files, switchFile, aiModel, setAIModel, clearChat, createFile } = useIDE();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  const commands: CommandItem[] = [
    { id: 'new-file', label: 'New File...', icon: <Plus size={14} />, action: () => { createFile('untitled.js'); toggleCommandPalette(); } },
    { id: 'save', label: 'Save File', icon: <Save size={14} />, shortcut: 'Ctrl+S', action: toggleCommandPalette },
    { id: 'run', label: 'Run Code', icon: <Play size={14} />, shortcut: 'Ctrl+Enter', action: () => { runCode(); toggleCommandPalette(); } },
    { id: 'preview', label: 'Open Preview', icon: <Eye size={14} />, action: () => { togglePreview(); toggleCommandPalette(); } },
    { id: 'terminal', label: 'Toggle Terminal', icon: <Terminal size={14} />, shortcut: 'Ctrl+`', action: () => { toggleTerminal(); toggleCommandPalette(); } },
    { id: 'sidebar', label: 'Toggle Sidebar', icon: <FolderOpen size={14} />, shortcut: 'Ctrl+B', action: () => { toggleSidebar(); toggleCommandPalette(); } },
    { id: 'ai', label: 'Toggle AI Panel', icon: <Bot size={14} />, shortcut: 'Ctrl+J', action: () => { toggleAIPanel(); toggleCommandPalette(); } },
    { id: 'settings', label: 'Open Settings', icon: <Settings size={14} />, shortcut: 'Ctrl+,', action: () => { toggleSettings(); toggleCommandPalette(); } },
    { id: 'clear-chat', label: 'Clear AI Chat', icon: <Trash2 size={14} />, action: () => { clearChat(); toggleCommandPalette(); } },
  ];

  const modelCommands: CommandItem[] = AI_MODELS.map(m => ({
    id: `model-${m.id}`,
    label: `Switch to ${m.name}`,
    icon: <Bot size={14} />,
    action: () => { setAIModel(m.id); toggleCommandPalette(); },
  }));

  const fileCommands: CommandItem[] = files.map(f => ({
    id: `file-${f.id}`,
    label: `Open ${f.name}`,
    icon: <FileCode size={14} />,
    action: () => { switchFile(f.id); toggleCommandPalette(); },
  }));

  const filteredCommands = query.startsWith('>')
    ? fileCommands.filter(f => f.label.toLowerCase().includes(query.slice(1).toLowerCase()))
    : query.startsWith('@')
    ? modelCommands.filter(c => c.label.toLowerCase().includes(query.slice(1).toLowerCase()))
    : query
    ? [...commands, ...fileCommands].filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); filteredCommands[selectedIndex]?.action(); }
    else if (e.key === 'Escape') toggleCommandPalette();
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-sm flex items-start justify-center pt-[15vh]" onClick={(e) => e.target === e.currentTarget && toggleCommandPalette()}>
      <div className="w-[600px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center px-3 py-2 border-b border-slate-700 bg-slate-800">
          <span className="text-slate-500 mr-2">&gt;</span>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, @ for models, > for files..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={toggleCommandPalette} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-6 text-xs text-slate-500 text-center">No commands found</div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <div key={cmd.id} onClick={cmd.action}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                  i === selectedIndex ? 'bg-emerald-500/20 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <span className={i === selectedIndex ? 'text-emerald-400' : 'text-slate-500'}>{cmd.icon}</span>
                <span className="flex-1 text-xs">{cmd.label}</span>
                {cmd.shortcut && <kbd className="text-[9px] px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-500">{cmd.shortcut}</kbd>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
