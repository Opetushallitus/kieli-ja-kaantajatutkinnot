import { createOphTheme } from '@opetushallitus/oph-design-system/theme';

const baseTheme = createOphTheme({ variant: 'oph' });

export const clerkTheme = createOphTheme({
  variant: 'oph',
  overrides: {
    components: {
      MuiAppBar: {
        defaultProps: {
          color: 'default',
        },
      },
    },
    typography: {
      ...baseTheme.typography,
      caption: {
        ...baseTheme.typography.caption,
        fontSize: '1.2rem',
      },
    },
  },
});
