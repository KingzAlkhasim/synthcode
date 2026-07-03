import { Language } from '../types/ide';

export function highlightCode(code: string, language: Language): string {
  let highlighted = escapeHtml(code);

  switch (language) {
    case 'javascript':
    case 'typescript':
      highlighted = highlightJS(highlighted);
      break;
    case 'html':
      highlighted = highlightHTML(highlighted);
      break;
    case 'css':
      highlighted = highlightCSS(highlighted);
      break;
    case 'json':
      highlighted = highlightJSON(highlighted);
      break;
    case 'python':
      highlighted = highlightPython(highlighted);
      break;
  }

  return highlighted;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightJS(code: string): string {
  // Comments first
  code = code.replace(/(\/\/.*$)/gm, '<span class="token comment">$1</span>');
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');

  // Strings
  code = code.replace(/(`[^`]*`|"[^"]*"|'[^']*')/g, '<span class="token string">$1</span>');

  // Keywords
  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|from|async|await|new|this|try|catch|throw|typeof|of|in|switch|case|break|continue|extends|null|undefined|true|false|interface|type|enum|implements|private|public|protected|readonly|static|abstract|as|is|keyof|never|unknown|any|void)\b/g;
  code = code.replace(keywords, '<span class="token keyword">$1</span>');

  // Functions
  code = code.replace(/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, '<span class="token function">$1</span>');

  // Numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

  return code;
}

function highlightHTML(code: string): string {
  // Comments
  code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token comment">$1</span>');

  // Tags
  code = code.replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="token tag">$2</span>');

  // Attributes
  code = code.replace(/([a-zA-Z-]+)(=)("[^"]*"|'[^']*')/g, '<span class="token attr-name">$1</span>$2<span class="token attr-value">$3</span>');

  return code;
}

function highlightCSS(code: string): string {
  // Comments
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');

  // Selectors
  code = code.replace(/([.#]?[a-zA-Z0-9_-]+)(\s*\{)/g, '<span class="token selector">$1</span>$2');

  // Properties
  code = code.replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="token property">$1</span>$2');

  // Values
  code = code.replace(/(:\s*)([^;{}]+)/g, '$1<span class="token value">$2</span>');

  return code;
}

function highlightJSON(code: string): string {
  // Keys
  code = code.replace(/"([^"]+)"(\s*:)/g, '<span class="token property">"$1"</span>$2');

  // String values
  code = code.replace(/(:\s*)"([^"]*)"/g, '$1<span class="token string">"$2"</span>');

  // Numbers
  code = code.replace(/(:\s*)(-?\d+\.?\d*)/g, '$1<span class="token number">$2</span>');

  // Booleans and null
  code = code.replace(/\b(true|false|null)\b/g, '<span class="token keyword">$1</span>');

  return code;
}

function highlightPython(code: string): string {
  // Comments
  code = code.replace(/(#.*$)/gm, '<span class="token comment">$1</span>');

  // Strings
  code = code.replace(/("[^"]*"|'[^']*')/g, '<span class="token string">$1</span>');

  // Keywords
  const keywords = /\b(def|return|if|elif|else|for|while|class|import|from|as|try|except|with|lambda|None|True|False|in|is|not|and|or|print|pass|raise|finally|yield|global|nonlocal|assert|break|continue|del|async|await)\b/g;
  code = code.replace(keywords, '<span class="token keyword">$1</span>');

  // Functions
  code = code.replace(/\b([a-zA-Z_][\w]*)\s*(?=\()/g, '<span class="token function">$1</span>');

  // Numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');

  return code;
}

export function countLines(code: string): number {
  return code.split('\n').length;
}

export function getCursorPosition(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  const lines = before.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}
