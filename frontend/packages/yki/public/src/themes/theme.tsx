import { theme } from 'shared/configs';
import { Variant } from 'shared/enums';

const colorSecondaryLight = '#159ecb'; // not in figma specs
const colorSecondary = '#378703';
const colorSecondaryDark = '#5bca13';
const colorPrimary = '#ffffff';
const colorGrey200 = '#f5f5f5';
const colorGrey700 = '#666666';
const fontWeightBold = 700;
const colorTextPrimary = '#1d1d1d';

export const newYkiPublicTheme = {
  ...theme,
  components: {
    ...theme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          borderWidth: '2px',
          borderColor: colorSecondary,
          transition: 'color 0.25s, background-color 0.25s, border-color 0.25s',
          variants: [
            {
              props: { variant: Variant.Contained },
              color: colorPrimary,
              style: {
                '&:hover': {
                  color: colorPrimary,
                  backgroundColor: colorSecondaryDark,
                },
              },
            },
            {
              props: { variant: Variant.Outlined },
              color: colorPrimary,
              style: {
                '&:hover': {
                  color: colorSecondaryDark,
                  borderColor: colorSecondaryDark,
                  backgroundColor: colorPrimary,
                },
              },
            },
            {
              props: { variant: Variant.Text },
              style: {
                '&:hover': {
                  color: colorSecondaryDark,
                  backgroundColor: colorPrimary,
                },
              },
            },
          ],
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colorGrey700,
          '&.Mui-checked': {
            color: colorSecondary,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colorGrey700,
          '&.Mui-checked': {
            color: colorSecondary,
          },
          '&.Mui-disabled': {
            color: colorGrey700,
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          backgroundColor: colorSecondary,
          color: colorPrimary,
          '.MuiChip-deleteIcon': {
            color: colorGrey200,
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-completed': {
            color: colorSecondary,
          },
          '&.Mui-active': {
            color: colorSecondary,
          },
        },
        text: {
          fill: colorPrimary,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colorTextPrimary,
          fontWeight: fontWeightBold,
          textDecoration: 'underline',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Open Sans', sans-serif",
        },
      },
    },
  },
  palette: {
    ...theme.palette,
    secondary: {
      main: colorSecondary,
      light: colorSecondaryLight,
      dark: colorSecondaryDark,
      contrastText: colorPrimary,
    },
  },
  typography: {
    ...theme.typography,
    h1: {
      ...theme.typography.h1,
      color: colorTextPrimary,
    },
    h2: {
      ...theme.typography.h2,
      color: colorTextPrimary,
    },
    h3: {
      ...theme.typography.h3,
      color: colorTextPrimary,
    },
    body1: {
      ...theme.typography.body1,
      color: colorTextPrimary,
    },
    caption: {
      ...theme.typography.caption,
      color: colorGrey700,
    },
    label: {
      ...theme.typography.label,
      color: colorTextPrimary,
    },
  },
};
