import { createOphTheme } from '@opetushallitus/oph-design-system/theme';

// Single source of truth for YKI public brand colors. Reference these tokens in
// the overrides below; change a value here to update it everywhere at once.
const brandColors = {
  green: '#378703',
  white: '#ffffff',
};

export const publicTheme = createOphTheme({
  variant: 'opintopolku',
  overrides: {
    // Match the global `:root { font-size: 62.5% }` so MUI's rem-based sizing
    // (icons, checkboxes, spacing) resolves against a 10px root.
    palette: {
      // The oph base theme has no secondary color, so `color="secondary"`
      // controls (buttons etc.) must get the YKI brand green here.
      secondary: {
        main: brandColors.green,
        contrastText: brandColors.white,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            '--AppBar-background': brandColors.green,
            color: brandColors.white,
            // Force nested text (Typography, links, buttons) to inherit the
            // AppBar's white color instead of their own theme text colors.
            '& *': {
              color: 'inherit',
            },
          },
        },
      },
    },
  },
});
