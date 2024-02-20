/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  gray,
  grayDark,
  red,
  redDark,
  jade,
  jadeDark,
  blue,
  blueDark,
  orange,
  orangeDark,
  violet,
  violetDark,
  teal,
  tealDark,
  yellow,
  yellowDark,
} from "@radix-ui/colors";
import plugin from "tailwindcss/plugin";

type LeafNode<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T as keyof unknown]: LeafNode<T[K]>;
    }
  : T;

/**
 * Transform a nested object into a flat object without change to the leaf nodes.
 * {"a": {"b": 2}, "c": 3} becomes {"b": 2, "c": 3}
 */
export function flattenObjectWithoutPreservingParents<
  T extends Record<string, unknown>
>(obj: T): LeafNode<T> {
  const result = {} as LeafNode<T>;

  function flatten(
    source: Record<string, unknown>,
    target: Record<string, unknown>
  ) {
    for (const key in source) {
      if (typeof source[key] === "object" && source[key] !== null) {
        flatten(source[key] as Record<string, unknown>, target);
      } else {
        target[key] = source[key];
      }
    }
  }

  flatten(obj, result);

  return result;
}

const extendedGray = {
  gray13: "#0c0c0c",
  ...gray,
  "gray-1": "#ffffff", // -1 is used as an override in some dark theme bgs. -1 in light only exists to make the themes equivalent.
  gray0: "#ffffff",
};

const extendedGrayDark = {
  gray13: "#ffffff",
  ...grayDark,
  "gray-1": "#0b0b0b",
  gray0: "#0d0d0d",
};

function aliasColor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scale: any,
  {
    from,
    to,
  }: {
    from: string;
    to: string;
  }
) {
  return transformKeysInObject(scale, (key) => key.replace(from, to));
}

const green = aliasColor(jade, { from: "jade", to: "green" });
const greenDark = aliasColor(jadeDark, { from: "jade", to: "green" });

const purple = aliasColor(violet, { from: "violet", to: "purple" });
const purpleDark = aliasColor(violetDark, { from: "violet", to: "purple" });

type ThemeLight = {
  gray: typeof extendedGray;
  red: typeof red;
  green: typeof green;
  blue: typeof blue;
  orange: typeof orange;
  purple: typeof purple;
  teal: typeof teal;
  yellow: typeof yellow;
};

type ThemeDark = {
  gray: typeof extendedGrayDark;
  red: typeof redDark;
  green: typeof greenDark;
  blue: typeof blueDark;
  orange: typeof orangeDark;
  purple: typeof purpleDark;
  teal: typeof tealDark;
  yellow: typeof yellowDark;
};

export const themeLight: ThemeLight = {
  gray: extendedGray,
  red: red,
  green: green,
  blue: blue,
  orange: orange,
  purple: purple,
  teal: teal,
  yellow: yellow,
} satisfies ThemeDark;

export const themeDark: ThemeDark = {
  gray: extendedGrayDark,
  red: redDark,
  green: greenDark,
  blue: blueDark,
  orange: orangeDark,
  purple: purpleDark,
  teal: tealDark,
  yellow: yellowDark,
} satisfies ThemeLight;

// ===========================================
// TAILWIND PLUGIN TO MAKE COLORS USABLE START
// ===========================================

function transformKeysInObject<T extends Record<string, any>>(
  obj: T,
  func: (key: string) => string
): Record<string, string> {
  return Object.keys(obj).reduce((clonedObj, key) => {
    const newKey = func(key);
    clonedObj[newKey] = obj[key] as string;

    return clonedObj;
  }, {} as Record<string, string>);
}

/**
 * searches for all single digits and replace them with a zero followed by the same digit.
 * eg: abc1def2 -> abc01def02
 *
 * made because we want radix's colors to be gray-01, gray-02, etc. instead of gray-1, gray-2, etc.
 *
 * 🐉🐉🐉 use BEFORE `addDashBeforeNumberSequences` to account for negative numbers, as they DON'T have a leading zero. (? for some reason? I guess neil did it without realizing lol)
 */
const addZeroBeforeSingleDigit = (input: string): string => {
  const regex = /(?<![0-9])[0-9](?![0-9])/g;

  return input.replace(regex, (match) => `0${match}`);
};

const addZeroBeforeSingleDigitIfNotNegative = (input: string): string => {
  if (input.includes("-")) {
    return input;
  }

  return addZeroBeforeSingleDigit(input);
};

/**
 * searches for all sequences of digits and replace them with a dash followed by the same sequence of digits.
 * eg: abc123def456 -> abc-123def-456
 *
 * made because we want radix's colors to be gray-0, gray-1, etc. instead of gray0, gray1, etc.
 */
const addDashesBeforeNumberSequences = (key: string) =>
  key.replace(/(\d+)/g, "-$1");

/**
 * transforms a theme object into a flat object of css variables to be put in a css element.
 * eg: { gray: {gray1: "#ffffff"}} -> { "--gray-01": "#ffffff" }
 */
export const makeThemeIntoCssVariables = (theme: ThemeLight | ThemeDark) => {
  const flatTheme = flattenObjectWithoutPreservingParents(theme);
  const themeWithZeros = transformKeysInObject(
    flatTheme,
    addZeroBeforeSingleDigitIfNotNegative
  );
  const themeWithDashes = transformKeysInObject(
    themeWithZeros,
    addDashesBeforeNumberSequences
  );
  const themeAsCssVars = transformKeysInObject(
    themeWithDashes,
    (value) => `--${value}`
  );

  return themeAsCssVars;
};

export const injectColorsAsCssVariables = plugin(({ addBase }) => {
  addBase({
    ":root": {
      ...makeThemeIntoCssVariables(themeLight),
    },
    ":root[data-theme='dark']": {
      ...makeThemeIntoCssVariables(themeDark),
    },
  });
});

// ===========================================
// TAILWIND PLUGIN TO MAKE COLORS USABLE END
// ===========================================

// ===========================================
// MAKE COLORS FOR USE IN THEME START
// ===========================================

function transformValuesInObject<T extends Record<string, any>>(
  obj: T,
  func: (key: string) => string
): Record<string, string> {
  return Object.keys(obj).reduce((clonedObj, key) => {
    clonedObj[key] = func(obj[key]);

    return clonedObj;
  }, {} as Record<string, string>);
}

const makeValuesInObjectSameAsKeys = <T extends Record<string, any>>(
  obj: T
): Record<string, string> => {
  return Object.keys(obj).reduce((clonedObj, key) => {
    clonedObj[key] = key;

    return clonedObj;
  }, {} as Record<string, string>);
};

export const makeThemeIntoTailwindClasses = (theme: ThemeLight | ThemeDark) => {
  // easier to work with a flat object than a nested one, assumes two scales will not have the same key.
  const flatTheme = flattenObjectWithoutPreservingParents(theme);

  // transform keys from eg: gray1 to gray01
  const themeWithZeros = transformKeysInObject(
    flatTheme,
    addZeroBeforeSingleDigitIfNotNegative
  );

  // transform keys from eg: gray01 to gray-01
  const themeWithDashes = transformKeysInObject(
    themeWithZeros,
    addDashesBeforeNumberSequences
  );

  // here we don't actually care about the values, we want to make a tailwind class bg-gray-01 consume a css variable --gray-01. so make the values the same as the keys.
  const themeWithValuesEqualToKeys =
    makeValuesInObjectSameAsKeys(themeWithDashes);

  // transform values from eg: gray-01 to var(--gray-01)
  const themeWithValuesAsUsageInCssVars = transformValuesInObject(
    themeWithValuesEqualToKeys,
    (value) => `var(--${value})`
  );

  return themeWithValuesAsUsageInCssVars;
};

// Assumes light and dark themes have the same keys. Somewhat enforces by using the satisfies keyword in the type definitions above.
export const baseScales = makeThemeIntoTailwindClasses(themeLight);

// ===========================================
// MAKE COLORS FOR USE IN THEME END
// ===========================================
