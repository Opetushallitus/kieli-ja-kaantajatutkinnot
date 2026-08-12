import { createOphTheme } from '@opetushallitus/oph-design-system/theme';

// Single source of truth for YKI public brand colors. Reference these tokens in
// the overrides below; change a value here to update it everywhere at once.
const brandColors = {
  green: '#378703',
  white: '#ffffff',
};

export const publicTheme = createOphTheme({
  variant: 'oph',
  overrides: {
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
