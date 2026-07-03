import { useRef, useCallback, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { highlightCode, getCursorPosition } from '../utils/highlighter';
import { getLanguageDisplay } from '../utils/language';

export function Editor() {
  const { files, editor, getActiveFile, updateFile, switchFile, closeFile, runCode, settings } = useIDE();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [showMinimap, setShowMinimap] = useState(true);

  const activeFile = getActiveFile();

  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !highlightRef.current || !gutterRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    highlightRef.current.scrollTop = scrollTop;
    highlightRef.current.scrollLeft = scrollLeft;
    gutterRef.current.scrollTop = scrollTop;
  }, []);

  const handleInput = useCallback(() => {
    if (!textareaRef.current || !activeFile) return;
    updateFile(activeFile.id, textareaRef.current.value);
  }, [activeFile, updateFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey;
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); return; }
    if (mod && e.key === 'Enter') { e.preventDefault(); runCode(); return; }
    if (mod && e.key === '/') { e.preventDefault(); toggleComment(); return; }
    if (e.key === 'Tab') { e.preventDefault(); e.shiftKey ? dedent() : indent(); return; }
    if (e.key === 'Enter') { e.preventDefault(); autoIndent(); return; }

    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
    if (pairs[e.key] && textarea.selectionStart === textarea.selectionEnd) {
      e.preventDefault();
      const pos = textarea.selectionStart;
      textarea.setRangeText(e.key + pairs[e.key], pos, pos, 'end');
      textarea.selectionStart = textarea.selectionEnd = pos + 1;
      handleInput();
    }
  }, [activeFile, runCode, handleInput]);

  const getLineRange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0 };
    const { selectionStart, selectionEnd, value } = textarea;
    const start = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const end = value.indexOf('\n', selectionEnd);
    return { start, end: end === -1 ? value.length : end };
  }, []);

  const indent = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { start, end } = getLineRange();
    const spaces = ' '.repeat(settings.tabSize);
    const indented = textarea.value.slice(start, end).split('\n').map(l => spaces + l).join('\n');
    textarea.setRangeText(indented, start, end, 'end');
    handleInput();
  }, [getLineRange, handleInput, settings.tabSize]);

  const dedent = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { start, end } = getLineRange();
    const dedented = textarea.value.slice(start, end).split('\n').map(l => l.replace(new RegExp(`^( {1,${settings.tabSize}}|\\t)`), '')).join('\n');
    textarea.setRangeText(dedented, start, end, 'end');
    handleInput();
  }, [getLineRange, handleInput, settings.tabSize]);

  const autoIndent = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const before = textarea.value.slice(0, pos);
    const line = before.slice(before.lastIndexOf('\n') + 1);
    const indent = line.match(/^\s*/)?.[0] || '';
    const extra = /[{[(]\s*$/.test(line) ? ' '.repeat(settings.tabSize) : '';
    textarea.setRangeText('\n' + indent + extra, pos, pos, 'end');
    handleInput();
  }, [handleInput, settings.tabSize]);

  const toggleComment = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !activeFile) return;
    const markers: Record<string, [string, string?]> = {
      javascript: ['//'], typescript: ['//'], html: ['<!--', '-->'], css: ['/*', '*/'], python: ['#'],
    };
    const [start, end] = markers[activeFile.language] || ['//'];
    const { start: lineStart, end: lineEnd } = getLineRange();
    const block = textarea.value.slice(lineStart, lineEnd);
    const lines = block.split('\n');
    const allCommented = lines.every(l => !l.trim() || l.trim().startsWith(start));
    const out = lines.map(l => {
      if (!l.trim()) return l;
      return allCommented
        ? l.replace(new RegExp(`^(\\s*)${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ?`), '$1')
        : end ? `${start} ${l} ${end}` : `${start} ${l}`;
    }).join('\n');
    textarea.setRangeText(out, lineStart, lineEnd, 'end');
    handleInput();
  }, [activeFile, getLineRange, handleInput]);

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">SC</div>
          </div>
          <p className="text-slate-500 text-sm">Select a file to start editing</p>
        </div>
      </div>
    );
  }

  const lines = activeFile.content.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1).join('\n');
  const highlighted = highlightCode(activeFile.content, activeFile.language);
  const cursorPos = textareaRef.current ? getCursorPosition(activeFile.content, textareaRef.current.selectionStart) : { line: 1, column: 1 };

  return (
    <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-950">
      {/* Tabs */}
      <div className="h-8 bg-slate-900 border-b border-slate-700 flex overflow-x-auto shrink-0">
        {editor.openFileIds.map(id => {
          const file = files.find(f => f.id === id);
          if (!file) return null;
          const isActive = id === editor.activeFileId;
          return (
            <div key={id} onClick={() => switchFile(id)}
              className={`group flex items-center gap-2 px-3 h-8 min-w-0 cursor-pointer border-r border-slate-700 transition-colors ${
                isActive
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <span className="text-[11px] truncate max-w-[100px]">{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); closeFile(id); }}
                className="p-0.5 rounded hover:bg-slate-600 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Breadcrumb */}
      <div className="h-6 bg-slate-900/50 border-b border-slate-800 px-3 flex items-center text-[10px] text-slate-600 shrink-0">
        <span className="text-emerald-500">project</span>
        <span className="mx-1 text-slate-600">/</span>
        <span className="text-slate-400">{activeFile.name}</span>
        <div className="flex-1" />
        <span className="text-slate-600">{getLanguageDisplay(activeFile.language)}</span>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div ref={gutterRef} className="w-12 bg-slate-950 text-right pr-2 pt-1 text-slate-600 font-mono text-[11px] leading-[1.6] select-none overflow-hidden shrink-0 border-r border-slate-800">
          {lineNumbers}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative overflow-hidden">
          <pre ref={highlightRef}
            className="absolute inset-0 p-1 font-mono text-[11px] leading-[1.6] text-transparent pointer-events-none overflow-auto whitespace-pre select-none"
            style={{ tabSize: settings.tabSize }}
            dangerouslySetInnerHTML={{ __html: highlighted }} />
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            className="absolute inset-0 p-1 font-mono text-[11px] leading-[1.6] bg-transparent text-transparent caret-white resize-none outline-none overflow-auto whitespace-pre"
            style={{ tabSize: settings.tabSize, WebkitTextFillColor: 'transparent' }} />
        </div>

        {/* Minimap */}
        {settings.minimap && showMinimap && (
          <div className="w-24 bg-slate-900 border-l border-slate-700 overflow-hidden shrink-0 opacity-60">
            <div className="scale-[0.2] origin-top-left w-[500%] text-[8px] leading-[1] text-slate-600 whitespace-pre p-1">
              {activeFile.content}
            </div>
          </div>
        )}
      </div>

      {/* Terminal */}
      <Terminal />

      {/* Status Bar */}
      <div className="h-6 bg-emerald-600 text-white flex items-center gap-3 px-3 text-[10px] shrink-0">
        <div className="flex items-center gap-1"><Check size={10} /><span>Ready</span></div>
        <span className="text-emerald-300">Ln {cursorPos.line}, Col {cursorPos.column}</span>
        <span className="text-emerald-300">{getLanguageDisplay(activeFile.language)}</span>
        <span className="text-emerald-300">{activeFile.content.length} chars</span>
        <div className="flex-1" />
        <span className="text-emerald-200">UTF-8</span>
        <span className="text-emerald-200">Spaces: {settings.tabSize}</span>
      </div>
    </main>
  );
}

function Terminal() {
  const { terminalLines, terminalOpen, clearTerminal, toggleTerminal, runCode } = useIDE();
  const [input, setInput] = useState('');

  if (!terminalOpen) return null;

  return (
    <div className="h-40 border-t border-slate-700 bg-slate-900 flex flex-col shrink-0">
      <div className="h-7 flex items-center px-3 gap-2 border-b border-slate-700 shrink-0 bg-slate-800">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-700 rounded text-[9px] font-medium text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Terminal
        </div>
        <div className="flex-1" />
        <button onClick={clearTerminal} className="text-[9px] text-slate-500 hover:text-white px-2 py-0.5 hover:bg-slate-700 rounded transition-colors">Clear</button>
        <button onClick={toggleTerminal} className="p-1 hover:bg-slate-700 text-slate-500 hover:text-white"><X size={10} /></button>
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono text-[10px]">
        {terminalLines.map(line => (
          <div key={line.id} className={`mb-0.5 ${
            line.type === 'error' ? 'text-red-400' :
            line.type === 'success' ? 'text-emerald-400' :
            line.type === 'info' ? 'text-sky-400' :
            'text-slate-300'
          }`}>{line.content}</div>
        ))}
        <div className="flex items-center text-emerald-400">
          <span className="mr-1">$</span>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { if (input === 'run') runCode(); setInput(''); } }}
            className="flex-1 bg-transparent outline-none text-slate-300" placeholder="Type 'run' to execute..." />
        </div>
      </div>
    </div>
  );
}
