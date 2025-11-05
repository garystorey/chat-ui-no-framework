export const truncate = (value: string, maxLength: number) => {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

export const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

export const getPlainTextFromHtml = (value: string) => {
  if (!value) {
    return '';
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = value;
    const text = container.textContent ?? container.innerText ?? '';
    return normalizeWhitespace(text);
  }

  return normalizeWhitespace(value.replace(/<[^>]*>/g, ' '));
};
