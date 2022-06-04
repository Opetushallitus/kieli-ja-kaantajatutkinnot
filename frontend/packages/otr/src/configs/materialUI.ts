import { createTheme } from '@mui/material/styles';

// Create Material UI theme configs
const primaryColor = '#FFFFFF';
const primaryLightColor = '#F5F5F5';
const primaryDarkColor = '#CCCCCC';
const secondaryColor = '#0041dc';
const secondaryLightColor = '#159ECB';
const secondaryDarkColor = '#000a48';
const primaryHeadingColor = '#000a48';
const secondaryHeadingColor = '#FFFFFF';
const grey700Color = '#666666';
const grey600Color = '#999999';
const blue200Color = '#F2F5FD';
const red500Color = '#db2828';

const fontWeightBold = 700;
const fontWeightMedium = 500;
const fontWeightRegular = 400;

export const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: secondaryDarkColor,
          },
          color: grey700Color,
          '&.Mui-disabled': {
            backgroundColor: primaryLightColor,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: grey700Color,
          },
          '&.Mui-disabled': {
            color: primaryHeadingColor,
          },
          color: grey700Color,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: grey700Color,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: grey700Color,
          '&.Mui-checked': {
            color: secondaryColor,
          },
          '&.Mui-disabled': {
            color: grey700Color,
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-completed': {
            color: secondaryColor,
          },
          '&.Mui-active': {
            color: secondaryColor,
          },
        },
        text: {
          fill: primaryColor,
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          '&.Mui-disabled': {
            color: grey600Color,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: grey700Color,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: grey700Color,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: blue200Color,
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
            backgroundColor: primaryLightColor,
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
      main: red500Color,
    },
    primary: {
      main: primaryColor,
      light: primaryLightColor,
      dark: primaryDarkColor,
    },
    secondary: {
      main: secondaryColor,
      light: secondaryLightColor,
      dark: secondaryDarkColor,
    },
    text: {
      primary: primaryHeadingColor,
      secondary: secondaryHeadingColor,
    },
  },
  typography: {
    htmlFontSize: 10,
    h1: {
      fontSize: '2.8rem',
      fontWeight: fontWeightMedium,
      lineHeight: '3.3rem',
      marginBottom: '2rem',
      color: primaryHeadingColor,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: fontWeightMedium,
      lineHeight: '2.4rem',
      color: primaryHeadingColor,
    },
    h3: {
      fontSize: '1.6rem',
      fontWeight: fontWeightBold,
      lineHeight: '1.9rem',
      color: primaryHeadingColor,
    },
    body1: {
      fontSize: '1.6rem',
      fontWeight: fontWeightRegular,
      lineHeight: '2.4rem',
      color: primaryHeadingColor,
    },
    caption: {
      fontSize: '1.2rem',
      fontWeight: fontWeightRegular,
      color: grey700Color,
    },
  },
});
