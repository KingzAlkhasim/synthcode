import { useState } from 'react';
import { Plus, Trash2, Terminal, Command, ChevronDown, ChevronRight, Code, FileText, Palette, FileCode, File } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { FileItem, Language } from '../types/ide';

export function Sidebar() {
  const { files, editor, switchFile, deleteFile, createFile, toggleTerminal, toggleCommandPalette, sidebarOpen, settings } = useIDE();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [expanded, setExpanded] = useState(true);

  if (!sidebarOpen) return null;

  const handleCreate = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  return (
    <aside className="w-52 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-3 border-b border-slate-700 bg-slate-800/50">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">Explorer</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-emerald-400 transition-colors"
          title="New File"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* New File Input */}
      {isCreating && (
        <div className="p-2 border-b border-slate-700 bg-slate-800">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setIsCreating(false); setNewFileName(''); }
            }}
            placeholder="filename.js"
            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            autoFocus
          />
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Project Folder */}
        <div className="px-2">
          <div
            className="flex items-center gap-1 px-1 py-1 text-slate-400 hover:text-white cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span className="text-[10px] font-semibold uppercase tracking-wide">Project</span>
          </div>

          {expanded && (
            <div className="ml-3 border-l border-slate-700">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isActive={file.id === editor.activeFileId}
                  onSelect={() => switchFile(file.id)}
                  onDelete={() => files.length > 1 && deleteFile(file.id)}
                  canDelete={files.length > 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-700">
        <div className="px-3 py-2">
          <span className="text-[9px] font-semibold tracking-widest uppercase text-slate-600">Quick Actions</span>
        </div>
        <button
          onClick={toggleCommandPalette}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Command size={12} />
          Command Palette
          <kbd className="ml-auto text-[9px] px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-500">⌘P</kbd>
        </button>
        <button
          onClick={toggleTerminal}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Terminal size={12} />
          Terminal
          <kbd className="ml-auto text-[9px] px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-500">⌘`</kbd>
        </button>
      </div>
    </aside>
  );
}

function FileRow({ file, isActive, onSelect, onDelete, canDelete }: {
  file: FileItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const iconMap: Record<Language, React.ReactNode> = {
    javascript: <Code size={12} className="text-amber-400" />,
    typescript: <Code size={12} className="text-blue-400" />,
    html: <FileCode size={12} className="text-orange-400" />,
    css: <Palette size={12} className="text-pink-400" />,
    json: <FileText size={12} className="text-yellow-400" />,
    python: <Code size={12} className="text-green-400" />,
    markdown: <FileText size={12} className="text-slate-400" />,
    plaintext: <File size={12} className="text-slate-400" />,
  };

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors relative ${
        isActive
          ? 'bg-emerald-500/10 text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-emerald-500'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {iconMap[file.language]}
      <span className="flex-1 text-[11px] truncate">{file.name}</span>
      {canDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition-all text-slate-500 hover:text-red-400"
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  );
}
