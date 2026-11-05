import { chipClasses } from '@mui/material/Chip';
import { ophColors } from '@opetushallitus/oph-design-system';
import { createOphTheme } from '@opetushallitus/oph-design-system/theme';

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    status: true;
  }
}

const baseTheme = createOphTheme({ variant: 'oph' });

export const clerkTheme = createOphTheme({
  variant: 'oph',
  overrides: {
    components: {
      MuiChip: {
        variants: [
          {
            props: { variant: 'status' },
            style: {
              backgroundColor: ophColors.lightBlue2,
              borderRadius: '4px',
              color: ophColors.cyan1,
              fontSize: '14px',
              fontWeight: 600,
              height: '24px',
              lineHeight: '24px',
              [`& .${chipClasses.label}`]: {
                padding: '0 5px',
              },
            },
          },
        ],
      },
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
