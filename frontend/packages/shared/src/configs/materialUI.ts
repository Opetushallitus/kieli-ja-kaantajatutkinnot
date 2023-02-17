import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

const colorPrimary = '#ffffff';
const colorTextPrimary = '#000a48';
const colorSecondaryDark = '#000a48';
const colorSecondary = '#0041dc';
const colorSecondaryLight = '#159ecb'; // not in figma specs

const colorGrey200 = '#f5f5f5';
const colorGrey400 = '#cccccc';
const colorGrey600 = '#999999';
const colorGrey700 = '#666666';

const colorBlue200 = '#f2f5fd';

const colorRed500 = '#db2828';

const fontWeightBold = 700;
const fontWeightMedium = 500;
const fontWeightRegular = 400;

export const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colorSecondaryDark,
          },
          color: colorGrey700,
          '&.Mui-disabled': {
            backgroundColor: colorGrey200,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: colorGrey700,
          },
          '&.Mui-disabled': {
            color: colorTextPrimary,
          },
          color: colorGrey700,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colorGrey700,
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
    MuiCalendarPicker: {
      styleOverrides: {
        root: {
          '& .MuiTypography-caption': {
            color: colorGrey700,
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
    MuiStepLabel: {
      styleOverrides: {
        label: {
          '&.Mui-disabled': {
            color: colorGrey600,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: colorGrey700,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: colorGrey700,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: colorBlue200,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            cursor: 'not-allowed',
            pointerEvents: 'auto',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        menuItem: {
          '&.Mui-selected': {
            backgroundColor: colorGrey200,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '1.4rem',
        },
      },
    },
  },
  palette: {
    error: {
      main: colorRed500,
    },
    primary: {
      main: colorPrimary,
      light: colorGrey200,
      dark: colorGrey400,
    },
    secondary: {
      main: colorSecondary,
      light: colorSecondaryLight,
      dark: colorSecondaryDark,
    },
    text: {
      primary: colorTextPrimary,
      secondary: colorPrimary,
    },
  },
  typography: {
    htmlFontSize: 10,
    h1: {
      fontSize: '2.8rem',
      fontWeight: fontWeightMedium,
      lineHeight: '3.3rem',
      marginBottom: '2rem',
      color: colorTextPrimary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: fontWeightMedium,
      lineHeight: '2.4rem',
      color: colorTextPrimary,
    },
    h3: {
      fontSize: '1.6rem',
      fontWeight: fontWeightBold,
      lineHeight: '1.9rem',
      color: colorTextPrimary,
    },
    body1: {
      fontSize: '1.6rem',
      fontWeight: fontWeightRegular,
      lineHeight: '2.4rem',
      color: colorTextPrimary,
    },
    caption: {
      fontSize: '1.2rem',
      fontWeight: fontWeightRegular,
      color: colorGrey700,
    },
  },
});
