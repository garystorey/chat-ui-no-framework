import '@testing-library/jest-dom/vitest';

if (typeof globalThis.btoa !== 'function') {
  globalThis.btoa = (value: string) => Buffer.from(value, 'binary').toString('base64');
}
