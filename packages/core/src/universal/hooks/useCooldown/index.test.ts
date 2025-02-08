import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCountdown } from '.';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should count down from initial duration', () => {
    const { result } = renderHook(() =>
      useCountdown({
        duration: 3,
      })
    );

    expect(result.current).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);
  });

  it('should call onTick with remaining time', () => {
    const onTick = vi.fn();
    renderHook(() =>
      useCountdown({
        duration: 3,
        onTick,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledWith(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledWith(1);
  });

  it('should call onComplete when countdown reaches zero', () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useCountdown({
        duration: 2,
        onComplete,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should not start countdown when enabled is false', () => {
    const onTick = vi.fn();
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useCountdown({
        duration: 3,
        onTick,
        onComplete,
        enabled: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(3);
    expect(onTick).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should respect custom interval', () => {
    const { result } = renderHook(() =>
      useCountdown({
        duration: 2,
        interval: 500,
      })
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(1);
  });

  it('should reset countdown when enabled changes from false to true', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useCountdown({
          duration: 3,
          enabled,
        }),
      {
        initialProps: { enabled: false },
      }
    );

    expect(result.current).toBe(3);

    rerender({ enabled: true });
    expect(result.current).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);
  });

  it('should cleanup timers on unmount', () => {
    const onTick = vi.fn();
    const { unmount } = renderHook(() =>
      useCountdown({
        duration: 3,
        onTick,
      })
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onTick).not.toHaveBeenCalled();
  });
});
