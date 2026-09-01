import { act, renderHook } from '@testing-library/react';

import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs the callback once after the delay elapses', () => {
    const { result } = renderHook(() => useDebounce(300));
    const callback = jest.fn();

    act(() => {
      result.current(callback);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid calls so only the last callback runs', () => {
    const { result } = renderHook(() => useDebounce(300));
    const first = jest.fn();
    const second = jest.fn();

    act(() => {
      result.current(first);
    });
    act(() => {
      jest.advanceTimersByTime(150);
      result.current(second);
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending callback when the component unmounts', () => {
    const { result, unmount } = renderHook(() => useDebounce(300));
    const callback = jest.fn();

    act(() => {
      result.current(callback);
    });
    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(callback).not.toHaveBeenCalled();
  });
});
