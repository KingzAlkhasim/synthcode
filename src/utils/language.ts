import { Language } from '../types/ide';

export function getLanguageFromFileName(name: string): Language {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, Language> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    json: 'json',
    py: 'python',
    md: 'markdown',
  };
  return map[ext] || 'plaintext';
}

export function getFileIcon(language: Language): string {
  const icons: Record<Language, string> = {
    javascript: 'JS',
    typescript: 'TS',
    html: 'H',
    css: 'C',
    json: 'J',
    python: 'PY',
    markdown: 'MD',
    plaintext: 'T',
  };
  return icons[language] || 'F';
}

export function getLanguageDisplay(language: Language): string {
  return language.charAt(0).toUpperCase() + language.slice(1);
}

export const SUPPORTED_LANGUAGES: Language[] = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'python',
  'markdown',
];
