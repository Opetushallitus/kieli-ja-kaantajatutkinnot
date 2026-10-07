import type { TypographyVariantsOptions } from '@mui/material/styles';
import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { ComponentProps } from 'react';

import { ykiColors, ykiColorVariables } from 'ophTheme/colors';

export const publicThemeOverrides: ComponentProps<
  typeof OphThemeProvider
>['overrides'] = {
  // Match the global `:root { font-size: 62.5% }` so MUI's rem-based sizing
  // (icons, checkboxes, spacing) resolves against a 10px root.
  // Cast works around an upstream type bug where the design system makes the
  // `label` typography variant required in TypographyVariantsOptions.
  typography: { htmlFontSize: 10 } as TypographyVariantsOptions,
  palette: {
    // Legacy button call sites use secondary for the public brand color.
    secondary: {
      main: ykiColors['color-secondary'],
      contrastText: ykiColors['color-primary'],
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': ykiColorVariables,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          '--AppBar-background': ykiColors['color-secondary'],
          color: ykiColors['color-primary'],
        },
      },
    },
  },
};
