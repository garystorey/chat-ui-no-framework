// Local module declarations to allow TypeScript builds to run in environments
// without access to external type packages.
declare module 'react' {
  export type ReactNode = any;
  export type Dispatch<T> = (value: T | ((prev: T) => T)) => void;
  export type MutableRefObject<T> = { current: T };

  export function useState<T = any>(initial: T): [T, Dispatch<T>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useRef<T = any>(initial: T | null): MutableRefObject<T | null>;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useReducer<R extends (state: any, action: any) => any>(
    reducer: R,
    initial: Parameters<R>[0]
  ): [ReturnType<R>, (action: Parameters<R>[1]) => void];
  export function useContext<T = any>(context: any): T;
  export function memo<T>(component: T): T;

  export type ChangeEvent<T = any> = { target: T } & Event;
  export type FormEvent<T = any> = { currentTarget: T; preventDefault(): void } & Event;
  export type KeyboardEvent<T = any> = { key: string; shiftKey: boolean; preventDefault(): void; currentTarget: T } & Event;

  export interface Event {
    preventDefault(): void;
    stopPropagation(): void;
  }

  export const StrictMode: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: (...args: any[]) => any;
  export const jsxs: (...args: any[]) => any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: any): void;
  };
}

declare module 'jotai' {
  export type PrimitiveAtom<T> = {
    read: () => T;
    write: (value: T) => void;
  };
  export function atom<T>(initialValue: T): PrimitiveAtom<T>;
  export function useAtom<T>(atom: PrimitiveAtom<T>): [T, (value: T | ((prev: T) => T)) => void];
}

declare module 'dompurify' {
  const DOMPurify: {
    sanitize: (value: string) => string;
  };
  export default DOMPurify;
}

declare module 'highlight.js' {
  const hljs: {
    highlight: (language: string, value: string | { language: string }) => { value: string };
    highlightAuto: (value: string) => { value: string };
    getLanguage: (language: string) => boolean;
  };
  export default hljs;
}

declare module 'marked' {
  export const marked: {
    use: (...extensions: any[]) => void;
    parse: (value: string) => string;
    setOptions: (options: any) => void;
  };
}

declare module 'trusted-types' {
  export type TrustedHTML = string;
}

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly [key: string]: string | boolean | number | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly hot?: {
      readonly accept: (
        deps: string | string[],
        callback?: (...modules: unknown[]) => void
      ) => void;
      readonly dispose: (callback: (...args: unknown[]) => void) => void;
      readonly prune?: (callback: (...args: unknown[]) => void) => void;
      readonly invalidate: (message?: string) => void;
    };
    glob<T = unknown>(pattern: string, options?: { eager?: boolean }): Record<string, T>;
    globEager<T = unknown>(pattern: string): Record<string, T>;
  }
}

declare module '@babel/core' {
  const core: any;
  export default core;
}

declare module '@babel/generator' {
  const generator: any;
  export default generator;
}

declare module '@babel/template' {
  const template: any;
  export default template;
}

declare module '@babel/traverse' {
  const traverse: any;
  export default traverse;
}

declare namespace JSX {
  interface Element {}
  interface ElementClass {
    render?: (...args: any[]) => any;
  }
  interface IntrinsicAttributes {
    key?: string | number | null;
  }
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
