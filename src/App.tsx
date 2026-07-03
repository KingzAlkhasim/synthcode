import { IDEProvider } from './store/IDEContext';
import { TopBar } from './components/TopBar';
import { ActivityBar } from './components/ActivityBar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { AIPanel } from './components/AIPanel';
import { Preview } from './components/Preview';
import { CommandPalette } from './components/CommandPalette';
import { Settings } from './components/Settings';

function App() {
  return (
    <IDEProvider>
      <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Activity Bar */}
          <ActivityBar />

          {/* Sidebar */}
          <Sidebar />

          {/* Editor */}
          <Editor />

          {/* AI Panel */}
          <AIPanel />
        </div>

        {/* Modals */}
        <Preview />
        <CommandPalette />
        <Settings />
      </div>
    </IDEProvider>
  );
}

export default App;
