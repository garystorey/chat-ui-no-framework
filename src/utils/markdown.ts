import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { marked } from 'marked';

marked.setOptions({
  highlight(code: string, language?: string) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
  langPrefix: 'hljs language-',
});

export function renderMarkdown(text: string): string {
  return DOMPurify.sanitize(marked.parse(text));
}

export function buildEchoMessage(text: string): string {
  const userHtml = renderMarkdown(text);
  const combined = `
    <p class="message-heading">You said:</p>
    <blockquote class="message-quote">${userHtml}</blockquote>
  `;
  return DOMPurify.sanitize(combined.trim());
}
