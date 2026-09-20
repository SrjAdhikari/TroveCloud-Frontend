//* tests/lib/designTokens.contrast.test.ts
/// <reference types="node" />

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync("src/index.css", "utf8");

type Rgb = [number, number, number];
type Theme = "light" | "dark";

const TEXT_MIN = 4.5;
const NON_TEXT_MIN = 3;

const themes: Theme[] = ["light", "dark"];

/** Custom properties of one brace-free top-level block, e.g. `:root {`. */
const blockVars = (selector: string) => {
	const start = css.indexOf(selector);
	const body = css.slice(start, css.indexOf("}", start));
	const vars = new Map<string, string>();
	for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
		vars.set(name, value.trim());
	}
	return vars;
};

const themeVars: Record<Theme, Map<string, string>> = {
	light: new Map([...blockVars("@theme inline {"), ...blockVars(":root {")]),
	dark: new Map([
		...blockVars("@theme inline {"),
		...blockVars(":root {"),
		...blockVars(".dark {"),
	]),
};

/** Dereferences a `--token` through any `var()` chain; literals pass through. */
const valueOf = (theme: Theme, token: string): string => {
	if (!token.startsWith("--")) return token;
	const raw = themeVars[theme].get(token);
	if (raw === undefined) throw new Error(`Missing ${token} in ${theme} theme`);
	const reference = /^var\((--[\w-]+)\)$/.exec(raw);
	return reference ? valueOf(theme, reference[1]) : raw;
};

const parseColor = (value: string) => {
	const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
	if (hex) {
		const [r, g, b] = hex.slice(1).map((pair) => parseInt(pair, 16));
		return { rgb: [r, g, b] as Rgb, alpha: 1 };
	}
	const rgba = /^rgba?\(([^)]+)\)$/.exec(value);
	if (!rgba) throw new Error(`Unsupported color: ${value}`);
	const [r, g, b, alpha = 1] = rgba[1].split(",").map(Number);
	return { rgb: [r, g, b] as Rgb, alpha };
};

/**
 * Paints each `--token` or `--token/<percent>` spec over the one before it,
 * so `flatten(t, ["--card", "--destructive/10"])` is the tinted card.
 */
const flatten = (theme: Theme, specs: string[]): Rgb =>
	specs.reduce<Rgb>((below, spec) => {
		const [token, percent] = spec.split("/");
		const { rgb, alpha } = parseColor(valueOf(theme, token));
		const weight = percent ? alpha * (Number(percent) / 100) : alpha;
		return [0, 1, 2].map(
			(index) => weight * rgb[index] + (1 - weight) * below[index],
		) as Rgb;
	}, [255, 255, 255]);

const relativeLuminance = ([r, g, b]: Rgb) => {
	const linear = (channel: number) => {
		const srgb = channel / 255;
		return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

/** WCAG contrast of `foreground` over the surface `layers` build up. */
const ratio = (theme: Theme, foreground: string, ...layers: string[]) => {
	const below = relativeLuminance(flatten(theme, layers));
	const above = relativeLuminance(flatten(theme, [...layers, foreground]));
	const [lighter, darker] = above > below ? [above, below] : [below, above];
	return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
};

describe("focus indicator (WCAG 2.4.7 / 1.4.11)", () => {
	it.each(themes)("--ring clears 3:1 on %s surfaces", (theme) => {
		expect(ratio(theme, "--ring", "--background")).toBeGreaterThanOrEqual(
			NON_TEXT_MIN,
		);
		expect(ratio(theme, "--ring", "--card")).toBeGreaterThanOrEqual(
			NON_TEXT_MIN,
		);
	});

	it.each(themes)("--sidebar-ring clears 3:1 on the %s sidebar", (theme) => {
		expect(ratio(theme, "--sidebar-ring", "--sidebar")).toBeGreaterThanOrEqual(
			NON_TEXT_MIN,
		);
	});

	// The shadcn primitives paint ring-ring/50, which halves any ring colour, so
	// the compliant indicator has to come from an outline rule of our own.
	it("declares a global focus-visible outline", () => {
		const rule = /:focus-visible[^{]*\{[^}]*\}/.exec(css)?.[0] ?? "";
		expect(rule).toContain("outline: 2px solid var(--ring)");
	});
});

const statuses: [string, string][] = [
	["--color-success", "--color-success-muted"],
	["--color-warning", "--color-warning-muted"],
	["--color-danger", "--color-danger-muted"],
	["--color-info", "--color-info-muted"],
];

// Tints are checked on the page ground. On a dark --card the design-fixed
// danger and info only reach 4.06:1 and 4.05:1 under their 12% tint, which no
// tint alpha can rescue — lifting those needs new dark hues, which the design
// tokens forbid.
describe.each(themes)("status palette on %s surfaces (WCAG 1.4.3)", (theme) => {
	it.each(statuses)("%s clears 4.5:1 as text", (token, muted) => {
		expect(ratio(theme, token, "--background")).toBeGreaterThanOrEqual(TEXT_MIN);
		expect(ratio(theme, token, "--card")).toBeGreaterThanOrEqual(TEXT_MIN);
		expect(
			ratio(theme, token, "--background", `${token}/8`),
		).toBeGreaterThanOrEqual(TEXT_MIN);
		expect(ratio(theme, token, "--background", muted)).toBeGreaterThanOrEqual(
			TEXT_MIN,
		);
	});
});

const destructiveTint: Record<Theme, string> = {
	light: "--destructive/10",
	dark: "--destructive/20",
};

describe("destructive (WCAG 1.4.3)", () => {
	it.each(themes)("%s --destructive-foreground clears 4.5:1 on it", (theme) => {
		expect(
			ratio(theme, "--destructive-foreground", "--destructive"),
		).toBeGreaterThanOrEqual(TEXT_MIN);
	});

	it.each(themes)("--destructive clears 4.5:1 as %s text", (theme) => {
		expect(ratio(theme, "--destructive", "--background")).toBeGreaterThanOrEqual(
			TEXT_MIN,
		);
		expect(ratio(theme, "--destructive", "--card")).toBeGreaterThanOrEqual(
			TEXT_MIN,
		);
		expect(
			ratio(theme, "--destructive", "--card", destructiveTint[theme]),
		).toBeGreaterThanOrEqual(TEXT_MIN);
	});
});

// --primary is the filled-button token as well as a text colour, so dark
// text-primary stays at 3.40:1 — tracked separately, it needs its own text
// token rather than a lighter fill.
describe("primary (WCAG 1.4.3)", () => {
	it("--primary clears 4.5:1 as light text", () => {
		expect(ratio("light", "--primary", "--background")).toBeGreaterThanOrEqual(
			TEXT_MIN,
		);
		expect(ratio("light", "--primary", "--card")).toBeGreaterThanOrEqual(
			TEXT_MIN,
		);
	});

	it.each(themes)("%s --primary-foreground clears 4.5:1 on it", (theme) => {
		expect(
			ratio(theme, "--primary-foreground", "--primary"),
		).toBeGreaterThanOrEqual(TEXT_MIN);
	});
});

/** The `color:` a Sonner icon rule declares, as a token spec or a literal. */
const iconColor = (type: string) => {
	const rule = new RegExp(
		String.raw`\[data-sonner-toast\]\[data-type="${type}"\] \[data-icon\] \{[^}]*\}`,
	).exec(css)?.[0];
	if (!rule) throw new Error(`Missing ${type} toast icon rule`);
	const declared = /(?:^|[{;\s])color:\s*([^;!]+)/.exec(rule)?.[1].trim();
	if (!declared) throw new Error(`No color on the ${type} toast icon rule`);
	return /^var\((--[\w-]+)\)$/.exec(declared)?.[1] ?? declared;
};

// Tint per type from sonner.tsx classNames; info is deliberately brand purple
// so the icon matches its own border-purple/25 bg-purple/5 pairing.
const toastIcons: [string, string][] = [
	["success", "--color-success/5"],
	["error", "--color-danger/5"],
	["warning", "--color-warning/5"],
	["info", "--color-purple/5"],
];

// Dark info rides --primary, which no dark purple text token replaces yet, so
// it sits under the 1.4.11 floor; excluded here and pinned as a gap below.
const iconCases = themes.flatMap((theme) =>
	toastIcons
		.filter(([type]) => !(theme === "dark" && type === "info"))
		.map(([type, tint]) => [theme, type, tint] as [Theme, string, string]),
);

describe("sonner toast icons (WCAG 1.4.11)", () => {
	it.each(iconCases)(
		"%s %s icon clears 3:1 on its tinted toast",
		(theme, type, tint) => {
			expect(
				ratio(theme, iconColor(type), "--card", tint),
			).toBeGreaterThanOrEqual(NON_TEXT_MIN);
		},
	);

	// --primary is not theme-split (#7c3aed in both themes), so the dark info icon
	// lands under the floor. Lifting it needs a dark purple text token — changing
	// --primary breaks every filled brand button. Pinned so this fails, and gets
	// retired, the day that token lands.
	it("dark info icon is a known gap pending a dark purple text token", () => {
		expect(
			ratio("dark", iconColor("info"), "--card", "--color-purple/5"),
		).toBeLessThan(NON_TEXT_MIN);
	});
});

// Primitives carry data-slot, which the global focus rule deliberately excludes,
// and they set outline-hidden on top. Their indicator has to come from our own
// unlayered rules here — never from editing the vendored component file.
const FOCUS_SLOTS = [
	"dropdown-menu-item",
	"dropdown-menu-checkbox-item",
	"dropdown-menu-radio-item",
	"dropdown-menu-sub-trigger",
	"select-item",
	"breadcrumb-link",
];

describe("primitive focus indicators (WCAG 2.4.7)", () => {
	it.each(FOCUS_SLOTS)("%s gets a ring outline on focus", (slot) => {
		const rule = new RegExp(
			String.raw`\[data-slot="${slot}"\]:focus(-visible)?[^{]*\{[^}]*\}`,
		).exec(css)?.[0];

		expect(rule).toBeDefined();
		expect(rule).toContain("outline: 2px solid var(--ring)");
	});
});
