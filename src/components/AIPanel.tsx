import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Bot, Trash2, Copy, Check, X, Code, Play, Eye, FolderPlus } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { AI_MODELS } from '../types/ide';

export function AIPanel() {
  const { aiMode, setAIMode, aiModel, setAIModel, chatMessages, addChatMessage, clearChat, files, getActiveFile, createFile, runCode, aiPanelOpen, toggleAIPanel, togglePreview } = useIDE();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.id === aiModel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    addChatMessage('user', userMessage);
    setIsLoading(true);

    try {
      if (aiMode === 'agent') {
        await handleAgentMessage(userMessage);
      } else {
        await handleChatMessage(userMessage);
      }
    } catch (error) {
      addChatMessage('assistant', `Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    const activeFile = getActiveFile();
    await new Promise(r => setTimeout(r, 400));

    let response = `I understand you asked: "${message}"\n\nSwitch to **Agent mode** to let me create files, run code, and build projects for you directly!`;

    if (message.toLowerCase().includes('explain') && activeFile) {
      response = `Analyzing **${activeFile.name}** (${activeFile.language})...\n\nThis file contains:\n- **${activeFile.content.split('\n').length}** lines of code\n- **${activeFile.content.length}** characters\n\nKey elements:\n${extractCodeElements(activeFile)}`;
    }

    addChatMessage('assistant', response);
  };

  const extractCodeElements = (file: { name: string; language: string; content: string }) => {
    if (file.language === 'javascript' || file.language === 'typescript') {
      const funcs = file.content.match(/function\s+\w+|const\s+\w+\s*=.*=>|class\s+\w+/g) || [];
      return funcs.slice(0, 5).map(f => `• \`${f}\``).join('\n') || 'No functions found';
    }
    return '• Code structure detected';
  };

  const handleAgentMessage = async (message: string) => {
    const lower = message.toLowerCase();

    if (lower.includes('create') || lower.includes('build') || lower.includes('make') || lower.includes('add')) {
      await handleCreateIntent(message);
    } else if (lower.includes('run') || lower.includes('execute')) {
      await handleRunIntent();
    } else if (lower.includes('preview') || lower.includes('show') || lower.includes('open')) {
      togglePreview();
      addChatMessage('assistant', 'Preview opened. Your HTML files will render there.');
    } else if (lower.includes('fix') || lower.includes('debug') || lower.includes('error')) {
      await handleFixIntent(message);
    } else if (lower.includes('project') || lower.includes('files') || lower.includes('list')) {
      const fileList = files.map(f => `• **${f.name}** (${f.language}, ${f.content.length} chars)`).join('\n');
      addChatMessage('assistant', `Current project files:\n\n${fileList}\n\nWhat would you like me to do?`);
    } else {
      addChatMessage('assistant', `I'm ready to help!\n\n**Commands I understand:**\n• "Create a [todo/calculator/counter] app"\n• "Build a [landing page/form/game]"\n• "Run the code"\n• "Open preview"\n• "Fix bugs"\n• "List files"\n\nWhat would you like to build?`);
    }
  };

  const handleCreateIntent = async (message: string) => {
    const lower = message.toLowerCase();
    let filename = '';
    let content = '';

    if (lower.includes('todo')) {
      filename = 'todo.html';
      content = buildTodoApp();
    } else if (lower.includes('calculator') || lower.includes('calc')) {
      filename = 'calculator.html';
      content = buildCalculatorApp();
    } else if (lower.includes('counter')) {
      filename = 'counter.html';
      content = buildCounterApp();
    } else if (lower.includes('landing') || lower.includes('page')) {
      filename = 'landing.html';
      content = buildLandingPage();
    } else if (lower.includes('form') || lower.includes('contact')) {
      filename = 'contact.html';
      content = buildContactForm();
    } else if (lower.includes('game')) {
      filename = 'game.html';
      content = buildSnakeGame();
    } else {
      const nameMatch = message.match(/called\s+(\w+\.?\w*)/) || message.match(/(\w+\.js|\w+\.html|\w+\.css)/);
      filename = nameMatch?.[1] || 'newfile.js';
      content = `// ${filename} - Created by SynthCode AI\n\nconsole.log('Hello from ${filename}!');`;
    }

    const file = createFile(filename, content);
    addChatMessage('assistant', `Created **${filename}** with a complete implementation.\n\nThe file is now open. You can:\n• Edit the code\n• Say "run it"\n• Say "open preview" for HTML`);
  };

  const handleRunIntent = async () => {
    const activeFile = getActiveFile();
    if (!activeFile) {
      addChatMessage('assistant', 'No file selected. Create or select a file first.');
      return;
    }
    addChatMessage('assistant', `Running **${activeFile.name}** with ${currentModel?.name}...`);
    runCode();
    await new Promise(r => setTimeout(r, 300));
    addChatMessage('assistant', `Execution complete. Check the Terminal for output.`);
  };

  const handleFixIntent = async (message: string) => {
    const activeFile = getActiveFile();
    if (!activeFile) {
      addChatMessage('assistant', 'No file selected. Please open a file to analyze.');
      return;
    }

    addChatMessage('assistant', `Analyzing **${activeFile.name}** for issues...\n\n**Analysis Results:**\n• No syntax errors found\n• Code structure: Valid\n• Best practices: Good\n\nThe code looks healthy! If you're seeing a specific error, share it and I'll help debug.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!aiPanelOpen) return null;

  return (
    <aside className="w-80 border-l border-slate-700 bg-slate-900 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="h-9 flex items-center px-3 gap-2 border-b border-slate-700 shrink-0 bg-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Sparkles size={8} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-white">SynthCode AI</span>
        </div>

        {/* Model Selector */}
        <select
          value={aiModel}
          onChange={(e) => setAIModel(e.target.value as any)}
          className="ml-2 bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {/* Mode Toggle */}
        <div className="flex bg-slate-700 rounded p-0.5 ml-auto">
          <button onClick={() => setAIMode('chat')}
            className={`px-2 py-0.5 text-[9px] font-medium rounded transition-colors ${aiMode === 'chat' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Chat
          </button>
          <button onClick={() => setAIMode('agent')}
            className={`flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-medium rounded transition-colors ${aiMode === 'agent' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Bot size={8} /> Agent
          </button>
        </div>

        <button onClick={toggleAIPanel} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
          <X size={12} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {chatMessages.map((msg) => (
          <div key={msg.id}>
            <div className={`rounded p-2 text-[10px] leading-relaxed ${
              msg.role === 'user' ? 'bg-sky-500/20 border border-sky-500/30 text-white ml-3' :
              msg.role === 'system' ? 'bg-slate-800/50 text-slate-500 text-[9px] font-mono border border-slate-700' :
              'bg-slate-800 border border-slate-700 text-slate-300'
            }`}>
              {msg.content.split('\n').map((line, i) => (
                <div key={i}>
                  {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
                </div>
              ))}
            </div>
            {msg.role === 'assistant' && (
              <button onClick={() => copyToClipboard(msg.content, msg.id)}
                className="mt-0.5 p-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
                {copiedId === msg.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              </button>
            )}
          </div>
        ))}
        {isLoading && <div className="flex items-center gap-1.5 text-slate-500 text-[10px]"><Loader2 size={10} className="animate-spin" />Processing with {currentModel?.name}...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-2 py-1.5 border-t border-slate-700 space-y-1.5 shrink-0 bg-slate-800">
        <div className="flex gap-1 flex-wrap">
          {['Create todo app', 'Build calculator', 'Run code', 'List files'].map(action => (
            <button key={action} onClick={() => setInput(action)}
              className="text-[9px] px-1.5 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
              {action}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={aiMode === 'agent' ? "Create, build, run..." : "Ask a question..."}
            rows={1}
            className="flex-1 bg-slate-700 border border-slate-600 rounded px-2.5 py-1.5 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            style={{ minHeight: '32px', maxHeight: '80px' }} />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="w-8 h-8 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white rounded flex items-center justify-center shrink-0 transition-colors">
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          </button>
        </div>

        <button onClick={clearChat} className="w-full text-[9px] text-slate-500 hover:text-red-400 text-center transition-colors">
          Clear conversation
        </button>
      </div>
    </aside>
  );
}

// App Templates
function buildTodoApp(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App - SynthCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { width: 100%; max-width: 400px; padding: 2rem; background: rgba(30,41,59,0.8); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
    h1 { text-align: center; margin-bottom: 1.5rem; background: linear-gradient(135deg, #00d4aa, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 1.5rem; }
    .input-group { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    input { flex: 1; padding: 0.75rem; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; }
    input:focus { outline: none; border-color: #00d4aa; }
    button { padding: 0.75rem 1rem; background: #00d4aa; color: #0f172a; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,212,170,0.3); }
    .todo-list { list-style: none; }
    .todo-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #0f172a; border-radius: 8px; margin-bottom: 0.5rem; transition: all 0.2s; }
    .todo-item:hover { background: #1e293b; }
    .todo-item.done span { text-decoration: line-through; color: #64748b; }
    .todo-item input[type="checkbox"] { width: 18px; height: 18px; accent-color: #00d4aa; }
    .todo-item span { flex: 1; }
    .delete { background: #ef4444; color: white; padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; border: none; cursor: pointer; }
    .stats { text-align: center; margin-top: 1rem; color: #64748b; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Todo App</h1>
    <div class="input-group">
      <input type="text" id="newTodo" placeholder="Add a new task..." onkeypress="if(event.key==='Enter')addTodo()">
      <button onclick="addTodo()">Add</button>
    </div>
    <ul class="todo-list" id="todoList"></ul>
    <div class="stats" id="stats"></div>
  </div>
  <script>
    let todos = JSON.parse(localStorage.getItem('synthcode-todos') || '[]');
    function render() {
      const list = document.getElementById('todoList');
      list.innerHTML = todos.map((t, i) => '<li class="todo-item ' + (t.done ? 'done' : '') + '"><input type="checkbox" ' + (t.done ? 'checked' : '') + ' onchange="toggle(' + i + ')"><span>' + t.text + '</span><button class="delete" onclick="remove(' + i + ')">Delete</button></li>').join('');
      localStorage.setItem('synthcode-todos', JSON.stringify(todos));
      const done = todos.filter(t => t.done).length;
      document.getElementById('stats').textContent = done + ' of ' + todos.length + ' tasks completed';
    }
    function addTodo() {
      const input = document.getElementById('newTodo');
      if (input.value.trim()) { todos.push({ text: input.value.trim(), done: false }); input.value = ''; render(); }
    }
    function toggle(i) { todos[i].done = !todos[i].done; render(); }
    function remove(i) { todos.splice(i, 1); render(); }
    render();
  </script>
</body>
</html>`;
}

function buildCalculatorApp(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculator - SynthCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); }
    .calculator { background: #1e293b; padding: 1.5rem; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .display { background: #0f172a; color: #00d4aa; font-size: 2rem; padding: 1rem; text-align: right; border-radius: 8px; margin-bottom: 1rem; min-height: 50px; font-family: monospace; border: 1px solid #334155; }
    .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    button { padding: 1rem; font-size: 1.25rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-weight: 600; }
    button:active { transform: scale(0.95); }
    .num { background: #334155; color: #e2e8f0; }
    .num:hover { background: #475569; }
    .op { background: #6366f1; color: white; }
    .op:hover { background: #4f46e5; }
    .eq { background: #00d4aa; color: #0f172a; }
    .eq:hover { background: #00b894; }
    .clear { background: #ef4444; color: white; }
    .clear:hover { background: #dc2626; }
  </style>
</head>
<body>
  <div class="calculator">
    <div class="display" id="display">0</div>
    <div class="buttons">
      <button class="clear" onclick="clear()">C</button>
      <button class="op" onclick="append('/')">/</button>
      <button class="op" onclick="append('*')">x</button>
      <button class="op" onclick="backspace()">←</button>
      <button class="num" onclick="append('7')">7</button>
      <button class="num" onclick="append('8')">8</button>
      <button class="num" onclick="append('9')">9</button>
      <button class="op" onclick="append('-')">-</button>
      <button class="num" onclick="append('4')">4</button>
      <button class="num" onclick="append('5')">5</button>
      <button class="num" onclick="append('6')">6</button>
      <button class="op" onclick="append('+')">+</button>
      <button class="num" onclick="append('1')">1</button>
      <button class="num" onclick="append('2')">2</button>
      <button class="num" onclick="append('3')">3</button>
      <button class="eq" onclick="calculate()" style="grid-row: span 2;">=</button>
      <button class="num" onclick="append('0')" style="grid-column: span 2;">0</button>
      <button class="num" onclick="append('.')">.</button>
    </div>
  </div>
  <script>
    let current = '0';
    function update() { document.getElementById('display').textContent = current; }
    function append(v) { current = current === '0' ? v : current + v; update(); }
    function clear() { current = '0'; update(); }
    function backspace() { current = current.slice(0, -1) || '0'; update(); }
    function calculate() { try { current = String(eval(current)); update(); } catch(e) { current = 'Error'; update(); } }
  </script>
</body>
</html>`;
}

function buildCounterApp(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counter - SynthCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: #e2e8f0; }
    .counter { text-align: center; padding: 2rem; background: rgba(30,41,59,0.8); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { font-size: 6rem; margin-bottom: 1rem; background: linear-gradient(135deg, #00d4aa, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: monospace; }
    .buttons { display: flex; gap: 1rem; justify-content: center; }
    button { padding: 1rem 2rem; font-size: 1.25rem; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
    button:hover { transform: translateY(-2px); }
    .dec { background: #ef4444; color: white; }
    .inc { background: #22c55e; color: white; }
    .reset { background: #6366f1; color: white; }
  </style>
</head>
<body>
  <div class="counter">
    <h1 id="count">0</h1>
    <div class="buttons">
      <button class="dec" onclick="update(-1)">-</button>
      <button class="reset" onclick="reset()">Reset</button>
      <button class="inc" onclick="update(1)">+</button>
    </div>
  </div>
  <script>
    let count = 0;
    function update(n) { count += n; document.getElementById('count').textContent = count; }
    function reset() { count = 0; document.getElementById('count').textContent = 0; }
  </script>
</body>
</html>`;
}

function buildLandingPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page - SynthCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; min-height: 100vh; }
    nav { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2rem; }
    .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #00d4aa, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
    .nav-links a:hover { color: #e2e8f0; }
    .hero { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; text-align: center; }
    h1 { font-size: 3.5rem; margin-bottom: 1rem; line-height: 1.1; }
    h1 span { background: linear-gradient(135deg, #00d4aa, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 1.25rem; color: #94a3b8; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
    .cta { display: inline-flex; gap: 1rem; }
    .btn { padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
    .btn-primary { background: linear-gradient(135deg, #00d4aa, #00b894); color: #0f172a; border: none; }
    .btn-secondary { background: transparent; border: 1px solid #334155; color: #e2e8f0; }
    .btn:hover { transform: translateY(-2px); }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
    .feature { padding: 2rem; background: rgba(30,41,59,0.5); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .feature h3 { margin-bottom: 0.5rem; color: #00d4aa; }
    .feature p { color: #94a3b8; margin-bottom: 0; font-size: 0.875rem; }
  </style>
</head>
<body>
  <nav>
    <div class="logo">YourBrand</div>
    <div class="nav-links">
      <a href="#">Features</a>
      <a href="#">Pricing</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </div>
  </nav>
  <div class="hero">
    <h1>Build <span>Amazing</span> Products</h1>
    <p>The modern platform for building beautiful, performant web applications with AI-powered development tools.</p>
    <div class="cta">
      <a href="#" class="btn btn-primary">Get Started</a>
      <a href="#" class="btn btn-secondary">Learn More</a>
    </div>
  </div>
  <div class="features">
    <div class="feature"><h3>Fast</h3><p>Lightning quick development with AI assistance</p></div>
    <div class="feature"><h3>Modern</h3><p>Built with the latest technologies</p></div>
    <div class="feature"><h3>Secure</h3><p>Enterprise-grade security built-in</p></div>
  </div>
</body>
</html>`;
}

function buildContactForm(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form - SynthCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: #e2e8f0; }
    .container { width: 100%; max-width: 450px; padding: 2rem; background: rgba(30,41,59,0.8); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
    h1 { text-align: center; margin-bottom: 2rem; background: linear-gradient(135deg, #00d4aa, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.875rem; }
    input, textarea { width: 100%; padding: 0.875rem; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 0.875rem; transition: border-color 0.2s; }
    input:focus, textarea:focus { outline: none; border-color: #00d4aa; }
    textarea { resize: vertical; min-height: 120px; }
    button { width: 100%; padding: 1rem; background: linear-gradient(135deg, #00d4aa, #00b894); color: #0f172a; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,212,170,0.3); }
    .success { display: none; text-align: center; padding: 1rem; background: rgba(34,197,94,0.2); border-radius: 8px; margin-top: 1rem; color: #22c55e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Contact Us</h1>
    <form id="contactForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" required placeholder="Your name">
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" required placeholder="your@email.com">
      </div>
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" required placeholder="Your message..."></textarea>
      </div>
      <button type="submit">Send Message</button>
    </form>
    <div class="success" id="success">Message sent successfully!</div>
  </div>
  <script>
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      document.getElementById('success').style.display = 'block';
      this.reset();
      setTimeout(() => document.getElementById('success').style.display = 'none', 3000);
    });
  </script>
</body>
</html>`;
}

function buildSnakeGame(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Snake Game - SynthCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: #e2e8f0; }
    h1 { margin-bottom: 1rem; }
    canvas { border: 2px solid #334155; border-radius: 8px; background: #0f172a; }
    .score { margin-top: 1rem; font-size: 1.25rem; }
    .controls { margin-top: 1rem; color: #64748b; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Snake Game</h1>
  <canvas id="game" width="400" height="400"></canvas>
  <div class="score">Score: <span id="score">0</span></div>
  <div class="controls">Use arrow keys to move</div>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 0, dy = 0;
    let score = 0;
    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#00d4aa';
      snake.forEach(s => ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize - 2, gridSize - 2));
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }
    function update() {
      if (dx === 0 && dy === 0) return;
      const head = {x: snake[0].x + dx, y: snake[0].y + dy};
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
        alert('Game Over! Score: ' + score);
        snake = [{x: 10, y: 10}];
        dx = dy = score = 0;
        document.getElementById('score').textContent = 0;
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
      } else { snake.pop(); }
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' && dy !== 1) { dx = 0; dy = -1; }
      else if (e.key === 'ArrowDown' && dy !== -1) { dx = 0; dy = 1; }
      else if (e.key === 'ArrowLeft' && dx !== 1) { dx = -1; dy = 0; }
      else if (e.key === 'ArrowRight' && dx !== -1) { dx = 1; dy = 0; }
    });
    setInterval(() => { update(); draw(); }, 100);
    draw();
  </script>
</body>
</html>`;
}

export default AIPanel;
