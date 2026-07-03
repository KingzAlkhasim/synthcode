import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { FileItem, EditorState, ChatMessage, AIMode, TerminalLine, ToolCall, Settings, AIModel, AI_MODELS } from '../types/ide';
import { getLanguageFromFileName } from '../utils/language';

interface IDEStore {
  files: FileItem[];
  editor: EditorState;
  chatMessages: ChatMessage[];
  aiMode: AIMode;
  aiModel: AIModel;
  settings: Settings;
  settingsOpen: boolean;
  terminalLines: TerminalLine[];
  terminalOpen: boolean;
  previewOpen: boolean;
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  commandPaletteOpen: boolean;
  createFile: (name: string, content?: string) => FileItem;
  updateFile: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  switchFile: (id: string) => void;
  closeFile: (id: string) => void;
  getActiveFile: () => FileItem | null;
  addChatMessage: (role: ChatMessage['role'], content: string, toolCalls?: ToolCall[]) => void;
  clearChat: () => void;
  setAIMode: (mode: AIMode) => void;
  setAIModel: (model: AIModel) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  toggleSettings: () => void;
  addTerminalLine: (content: string, type: TerminalLine['type']) => void;
  clearTerminal: () => void;
  toggleTerminal: () => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  toggleCommandPalette: () => void;
  runCode: () => void;
}

const defaultFiles: FileItem[] = [
  {
    id: '1',
    name: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SynthCode Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to SynthCode</h1>
    <p>Build something amazing with AI-powered coding</p>
    <button id="actionBtn">Get Started</button>
  </div>
  <script src="main.js"></script>
</body>
</html>`,
    language: 'html',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    name: 'main.js',
    content: `// SynthCode Application
// AI-powered development environment

class App {
  constructor(name) {
    this.name = name;
    this.version = '1.0.0';
  }

  init() {
    console.log(\`\${this.name} v\${this.version} initialized\`);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const btn = document.getElementById('actionBtn');
    btn?.addEventListener('click', () => {
      alert('Welcome to SynthCode - AI-Powered IDE!');
    });
  }
}

const app = new App('SynthCode');
app.init();

// Example function
function calculateSum(arr) {
  return arr.reduce((sum, num) => sum + num, 0);
}

console.log('Sum:', calculateSum([1, 2, 3, 4, 5]));`,
    language: 'javascript',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    name: 'style.css',
    content: `/* SynthCode Styles */
:root {
  --primary: #00d4aa;
  --secondary: #6366f1;
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #e2e8f0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  padding: 3rem;
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  font-size: 1.1rem;
  opacity: 0.7;
  margin-bottom: 2rem;
}

#actionBtn {
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  background: var(--primary);
  color: var(--bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

#actionBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
}`,
    language: 'css',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  aiModel: 'claude',
  autoSave: true,
  formatOnSave: false,
};

const IDEContext = createContext<IDEStore | null>(null);

export function IDEProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [editor, setEditor] = useState<EditorState>(() => ({
    activeFileId: '1',
    openFileIds: ['1', '2', '3'],
    cursorPosition: { line: 1, column: 1 },
    scrollPosition: { top: 0, left: 0 },
  }));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Welcome to SynthCode AI Agent. I can create files, build apps, run code, and help you develop entire projects. Try: "Build a todo app" or "Create a REST API"',
      timestamp: Date.now(),
    }
  ]);
  const [aiMode, setAIMode] = useState<AIMode>('agent');
  const [aiModel, setAIModel] = useState<AIModel>('claude');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const fileIdCounter = useRef(4);

  const createFile = useCallback((name: string, content: string = ''): FileItem => {
    const newFile: FileItem = {
      id: String(fileIdCounter.current++),
      name,
      content,
      language: getLanguageFromFileName(name),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFiles(prev => [...prev, newFile]);
    setEditor(prev => ({
      ...prev,
      activeFileId: newFile.id,
      openFileIds: prev.openFileIds.includes(newFile.id) ? prev.openFileIds : [...prev.openFileIds, newFile.id],
    }));
    return newFile;
  }, []);

  const updateFile = useCallback((id: string, content: string) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, content, updatedAt: Date.now() } : f
    ));
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.length <= 1 ? prev : prev.filter(f => f.id !== id));
    setEditor(prev => {
      const newOpenIds = prev.openFileIds.filter(fid => fid !== id);
      const remainingFiles = files.filter(f => f.id !== id);
      let newActiveId = prev.activeFileId === id
        ? newOpenIds[newOpenIds.length - 1] || remainingFiles[0]?.id || null
        : prev.activeFileId;
      return {
        ...prev,
        activeFileId: newActiveId,
        openFileIds: newOpenIds.length ? newOpenIds : (remainingFiles[0]?.id ? [remainingFiles[0].id] : []),
      };
    });
  }, [files]);

  const switchFile = useCallback((id: string) => {
    setEditor(prev => ({
      ...prev,
      activeFileId: id,
      openFileIds: prev.openFileIds.includes(id) ? prev.openFileIds : [...prev.openFileIds, id],
    }));
  }, []);

  const closeFile = useCallback((id: string) => {
    setEditor(prev => {
      const newOpenIds = prev.openFileIds.filter(fid => fid !== id);
      let newActiveId = prev.activeFileId === id
        ? newOpenIds[newOpenIds.length - 1] || files[0]?.id || null
        : prev.activeFileId;
      return { ...prev, activeFileId: newActiveId, openFileIds: newOpenIds.length ? newOpenIds : prev.openFileIds };
    });
  }, [files]);

  const getActiveFile = useCallback((): FileItem | null => {
    return files.find(f => f.id === editor.activeFileId) || null;
  }, [files, editor.activeFileId]);

  const addChatMessage = useCallback((role: ChatMessage['role'], content: string, toolCalls?: ToolCall[]) => {
    setChatMessages(prev => [...prev, { id: crypto.randomUUID(), role, content, timestamp: Date.now(), toolCalls }]);
  }, []);

  const clearChat = useCallback(() => {
    setChatMessages([{ id: 'welcome', role: 'system', content: 'Chat cleared. Ready to build!', timestamp: Date.now() }]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleSettings = useCallback(() => setSettingsOpen(prev => !prev), []);
  const toggleTerminal = useCallback(() => setTerminalOpen(prev => !prev), []);
  const togglePreview = useCallback(() => setPreviewOpen(prev => !prev), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleAIPanel = useCallback(() => setAiPanelOpen(prev => !prev), []);
  const toggleCommandPalette = useCallback(() => setCommandPaletteOpen(prev => !prev), []);

  const addTerminalLine = useCallback((content: string, type: TerminalLine['type']) => {
    setTerminalLines(prev => [...prev, { id: crypto.randomUUID(), content, type }]);
  }, []);

  const clearTerminal = useCallback(() => setTerminalLines([]), []);

  const runCode = useCallback(() => {
    const activeFile = getActiveFile();
    if (!activeFile) return;

    if (!terminalOpen) setTerminalOpen(true);
    clearTerminal();
    addTerminalLine(`> Running ${activeFile.name}...`, 'info');

    if (activeFile.language === 'javascript') {
      const logs: string[] = [];
      const errors: string[] = [];
      const sandboxConsole = {
        log: (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args: unknown[]) => errors.push(args.join(' ')),
        warn: (...args: unknown[]) => logs.push('⚠ ' + args.join(' ')),
      };

      try {
        const fn = new Function('console', activeFile.content);
        fn(sandboxConsole);
        logs.forEach(log => addTerminalLine(log, 'output'));
        errors.forEach(err => addTerminalLine(err, 'error'));
        addTerminalLine('✓ Execution complete', 'success');
      } catch (err) {
        addTerminalLine(`✕ ${(err as Error).message}`, 'error');
      }
    } else if (activeFile.language === 'html') {
      setPreviewOpen(true);
      addTerminalLine('✓ Preview opened', 'success');
    } else {
      addTerminalLine(`${activeFile.language} requires a backend runtime`, 'info');
    }
  }, [getActiveFile, terminalOpen, clearTerminal, addTerminalLine]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); toggleCommandPalette(); }
      else if (mod && e.key === 'Enter') { e.preventDefault(); runCode(); }
      else if (mod && e.key === '`') { e.preventDefault(); toggleTerminal(); }
      else if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); toggleSidebar(); }
      else if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); toggleAIPanel(); }
      else if (mod && e.key === ',') { e.preventDefault(); toggleSettings(); }
      else if (e.key === 'Escape') { setCommandPaletteOpen(false); setSettingsOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCommandPalette, runCode, toggleTerminal, toggleSidebar, toggleAIPanel, toggleSettings]);

  return (
    <IDEContext.Provider value={{
      files, editor, chatMessages, aiMode, aiModel, settings, settingsOpen,
      terminalLines, terminalOpen, previewOpen, sidebarOpen, aiPanelOpen, commandPaletteOpen,
      createFile, updateFile, deleteFile, switchFile, closeFile, getActiveFile,
      addChatMessage, clearChat, setAIMode, setAIModel, updateSettings, toggleSettings,
      addTerminalLine, clearTerminal, toggleTerminal, togglePreview, toggleSidebar, toggleAIPanel, toggleCommandPalette,
      runCode,
    }}>
      {children}
    </IDEContext.Provider>
  );
}

export function useIDE() {
  const ctx = useContext(IDEContext);
  if (!ctx) throw new Error('useIDE must be used within IDEProvider');
  return ctx;
}
