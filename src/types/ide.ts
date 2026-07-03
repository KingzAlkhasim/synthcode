export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: Language;
  createdAt: number;
  updatedAt: number;
}

export type Language = 'javascript' | 'html' | 'css' | 'json' | 'typescript' | 'python' | 'markdown' | 'plaintext';

export interface EditorState {
  activeFileId: string | null;
  openFileIds: string[];
  cursorPosition: { line: number; column: number };
  scrollPosition: { top: number; left: number };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, string>;
  result: string;
  success: boolean;
}

export type AIMode = 'chat' | 'agent';

export type AIModel = 'claude' | 'gemini' | 'gpt' | 'kxneurocore';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  provider: string;
  description: string;
}

export const AI_MODELS: AIModelConfig[] = [
  { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Advanced reasoning and code generation' },
  { id: 'gemini', name: 'Gemini Pro', provider: 'Google', description: 'Multimodal AI with strong coding abilities' },
  { id: 'gpt', name: 'GPT-4o', provider: 'OpenAI', description: 'Powerful language model for development' },
  { id: 'kxneurocore', name: 'Kxneurocore', provider: 'KingxTech', description: 'Custom AI model for advanced code generation' },
];

export interface TerminalLine {
  id: string;
  content: string;
  type: 'output' | 'error' | 'info' | 'success';
}

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  action: () => void;
  category?: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  aiModel: AIModel;
  autoSave: boolean;
  formatOnSave: boolean;
}
