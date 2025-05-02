import { styled as muiStyled, Theme, ThemeOptions } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import { ophColors } from '@opetushallitus/oph-design-system';

export { ophColors } from '@opetushallitus/oph-design-system';

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  shouldForwardProp(propName) && !propName.startsWith('$');

export const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: (propName: string) =>
      (!options.shouldForwardProp || options.shouldForwardProp(propName)) &&
      withTransientProps(propName),
    ...options,
  });
};

export const DEFAULT_BOX_BORDER = `2px solid ${ophColors.grey100}`;

export const notLarge = (theme: Theme) => theme.breakpoints.down('lg');

export const THEME_OVERRIDES: ThemeOptions = {
  components: {
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          minHeight: '200px',
          borderRadius: '2px',
          boxShadow: '2px 2px 8px 0px rgba(0,0,0,0.17)',
          padding: theme.spacing(3),
        }),
      },
    },
    MuiDialogTitle: {
      defaultProps: {
        variant: 'h2',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(0, 0, 2, 0),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(2, 0, 0, 0),
        }),
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        size: 50,
        thickness: 4.5,
      },
    },
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(2),
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        loadingPosition: 'start',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiTableCell-head': {
            ...theme.typography.label,
          },
          '&.MuiTableCell-body': {
            ...theme.typography.body1,
          },
        }),
      },
    },
  },
};
