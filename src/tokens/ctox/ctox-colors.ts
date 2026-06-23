type ColorShades = Record<string, Record<string, string>>;

export const ctoxColors: ColorShades = {
  primary: {
    DEFAULT: "#050732",
    700: "#050732B2",
    500: "#05073266",
    200: "#0507324D",
  },
  secondary: {
    DEFAULT: "#2AC15F",
    700: "#2AC15F80",
  },
  dark: {
    DEFAULT: "#424B52",
    700: "#C3CDD7",
    500: "#C0C0C0",
    50: "#F3F5F7",
  },
  light: {
    DEFAULT: "#F3F7FF",
  },
  negative: {
    DEFAULT: "#DF3D11",
    900: "#AC3716",
    500: "#E7775C",
    50: "#FAE4DF",
  },
  alert: {
    DEFAULT: "#F2C94C",
    900: "#8A6803",
    500: "#F5D887",
    50: "#FCF5E2",
  },
  positive: {
    DEFAULT: "#0E7F3C",
    500: "#43E887",
    50: "#DAFAE7",
  },
  steelblue: {
    DEFAULT: "#566C9A",
    900: "#33497A",
    700: "#4A5D89",
    500: "#566C9A",
    300: "#8FA3C7",
    200: "#C4D5FA",
    50: "#E8EDF8",
  },
};
