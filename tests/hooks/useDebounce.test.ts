//* tests/hooks/useDebounce.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDebounce from "@/hooks/useDebounce";

describe("useDebounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the initial value immediately on first render", () => {
		const { result } = renderHook(() => useDebounce("alpha", 300));
		expect(result.current).toBe("alpha");
	});

	it("does not update until the delay elapses", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 300),
			{ initialProps: { value: "alpha" } },
		);

		rerender({ value: "beta" });
		act(() => {
			vi.advanceTimersByTime(299);
		});

		expect(result.current).toBe("alpha");
	});

	it("updates to the latest value after the delay elapses", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 300),
			{ initialProps: { value: "alpha" } },
		);

		rerender({ value: "beta" });
		act(() => {
			vi.advanceTimersByTime(300);
		});

		expect(result.current).toBe("beta");
	});

	it("resets the timer when the input changes mid-debounce", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 300),
			{ initialProps: { value: "alpha" } },
		);

		rerender({ value: "beta" });
		act(() => {
			vi.advanceTimersByTime(200);
		});

		rerender({ value: "gamma" });
		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current).toBe("alpha");

		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(result.current).toBe("gamma");
	});
});
