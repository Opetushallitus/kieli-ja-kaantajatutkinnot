// with oph-design-system there are conficting declarations for label
// atm easiest to just declare matching variant types found in
// node_modules/@opetushallitus/oph-design-system/dist/types.d.ts

declare module '@mui/material/styles' {
  interface CustomTypographyVariants {
    label: React.CSSProperties;
  }
  interface CustomTypographyVariantsOptions {
    label?: React.CSSProperties;
  }
  interface TypographyVariants extends CustomTypographyVariants {}
  interface TypographyVariantsOptions extends CustomTypographyVariants {}
}

export default function createTheme(
  options?: Omit<ThemeOptions, 'components'> &
    Pick<
      CssVarsThemeOptions,
      'defaultColorScheme' | 'colorSchemes' | 'components'
    > & {
      cssVariables?:
        | boolean
        | Pick<
            CssVarsThemeOptions,
            | 'colorSchemeSelector'
            | 'rootSelector'
            | 'disableCssColorScheme'
            | 'cssVarPrefix'
            | 'shouldSkipGeneratingVar'
          >;
    },
  ...args: object[]
): Theme;
