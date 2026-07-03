import { X, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useIDE } from '../store/IDEContext';
import { AI_MODELS, AIModel } from '../types/ide';

export function Settings() {
  const { settingsOpen, toggleSettings, settings, updateSettings, aiModel, setAIModel } = useIDE();

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[600px] max-w-[90vw] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 flex items-center px-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-sm font-semibold text-white">Settings</h2>
          <button onClick={toggleSettings} className="ml-auto p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* AI Model Selection */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Model</h3>
            <div className="grid grid-cols-2 gap-2">
              {AI_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setAIModel(model.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    aiModel === model.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{model.name}</span>
                    {aiModel === model.id && <Check size={14} className="text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500">{model.provider}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{model.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Editor Settings */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Editor</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="text-sm text-white">Font Size</div>
                  <div className="text-[10px] text-slate-500">Adjust editor font size</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings({ fontSize: Math.max(10, settings.fontSize - 1) })}
                    className="w-8 h-8 rounded bg-slate-700 text-white hover:bg-slate-600"
                  >-</button>
                  <span className="w-8 text-center text-sm text-white">{settings.fontSize}</span>
                  <button
                    onClick={() => updateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })}
                    className="w-8 h-8 rounded bg-slate-700 text-white hover:bg-slate-600"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="text-sm text-white">Tab Size</div>
                  <div className="text-[10px] text-slate-500">Number of spaces per tab</div>
                </div>
                <select
                  value={settings.tabSize}
                  onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="text-sm text-white">Word Wrap</div>
                  <div className="text-[10px] text-slate-500">Wrap lines at viewport width</div>
                </div>
                <button
                  onClick={() => updateSettings({ wordWrap: !settings.wordWrap })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.wordWrap ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.wordWrap ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="text-sm text-white">Minimap</div>
                  <div className="text-[10px] text-slate-500">Show code minimap</div>
                </div>
                <button
                  onClick={() => updateSettings({ minimap: !settings.minimap })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.minimap ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.minimap ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Auto Save */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="text-sm text-white">Auto Save</div>
                  <div className="text-[10px] text-slate-500">Automatically save files</div>
                </div>
                <button
                  onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.autoSave ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.autoSave ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="text-sm text-white">Format on Save</div>
                  <div className="text-[10px] text-slate-500">Format code when saving</div>
                </div>
                <button
                  onClick={() => updateSettings({ formatOnSave: !settings.formatOnSave })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.formatOnSave ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.formatOnSave ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About</h3>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  SC
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">SynthCode IDE</div>
                  <div className="text-[10px] text-slate-500">Version 1.0.0 • AI-Powered Development</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
