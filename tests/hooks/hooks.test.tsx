import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import useLatestRef from '../../src/hooks/useLatestRef';
import useToggleBodyClass from '../../src/hooks/useToggleBodyClass';
import usePrefersReducedMotion from '../../src/hooks/usePrefersReducedMotion';
import useScrollToBottom from '../../src/hooks/useScrollToBottom';
import useAutoResizeTextarea from '../../src/hooks/useAutoResizeTextarea';
import useUnmount from '../../src/hooks/useUnmount';

const setMockMatchMedia = (matches: boolean) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList: MediaQueryList = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_event, listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_event, listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener: (_listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => {
      listeners.add(_listener as (event: MediaQueryListEvent) => void);
    },
    removeListener: (_listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => {
      listeners.delete(_listener as (event: MediaQueryListEvent) => void);
    },
    dispatchEvent: () => true,
    onchange: null,
  };

  vi.spyOn(window, 'matchMedia').mockImplementation(() => mediaQueryList);

  return (nextMatches: boolean) => {
    mediaQueryList.matches = nextMatches;
    listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
  };
};

afterEach(() => {
  document.body.className = '';
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('useLatestRef', () => {
  it('keeps ref current value in sync with the latest value', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'initial' },
    });

    expect(result.current.current).toBe('initial');

    rerender({ value: 'updated' });

    expect(result.current.current).toBe('updated');
  });
});

describe('useToggleBodyClass', () => {
  it('adds and removes body classes as the flag changes', () => {
    const { rerender, unmount } = renderHook(({ active }) => useToggleBodyClass('toggle-class', active), {
      initialProps: { active: true },
    });

    expect(document.body.classList.contains('toggle-class')).toBe(true);

    rerender({ active: false });

    expect(document.body.classList.contains('toggle-class')).toBe(false);

    rerender({ active: true });
    unmount();

    expect(document.body.classList.contains('toggle-class')).toBe(false);
  });
});

describe('usePrefersReducedMotion', () => {
  it('reflects the current media query value and responds to changes', async () => {
    const triggerChange = setMockMatchMedia(true);

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);

    act(() => triggerChange(false));

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('useScrollToBottom', () => {
  it('scrolls to the bottom of the referenced element when dependencies change', async () => {
    const element = document.createElement('div');
    element.scrollHeight = 500;
    const scrollTo = vi.fn();
    element.scrollTo = scrollTo;
    const ref = { current: element } as React.RefObject<HTMLDivElement>;

    const { rerender } = renderHook(({ deps, behavior }) => useScrollToBottom(ref, deps, { behavior }), {
      initialProps: { deps: [1], behavior: 'smooth' as ScrollBehavior },
    });

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' });
    });

    rerender({ deps: [1, 2], behavior: 'auto' });

    await waitFor(() => {
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 500, behavior: 'auto' });
    });
  });
});

describe('useAutoResizeTextarea', () => {
  it('sets the textarea height to its scroll height when the value changes', async () => {
    const textarea = document.createElement('textarea');
    textarea.style.height = '10px';
    Object.defineProperty(textarea, 'scrollHeight', { value: 120, configurable: true });
    const ref = { current: textarea } as React.RefObject<HTMLTextAreaElement>;

    const { rerender } = renderHook(({ value }) => useAutoResizeTextarea(ref, value), {
      initialProps: { value: 'first' },
    });

    await waitFor(() => {
      expect(textarea.style.height).toBe('120px');
    });

    Object.defineProperty(textarea, 'scrollHeight', { value: 80, configurable: true });
    rerender({ value: 'second' });

    await waitFor(() => {
      expect(textarea.style.height).toBe('80px');
    });
  });
});

describe('useUnmount', () => {
  it('invokes the latest callback when the component unmounts', () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { rerender, unmount } = renderHook(({ cb }) => useUnmount(cb), {
      initialProps: { cb: firstCallback },
    });

    rerender({ cb: secondCallback });
    unmount();

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
