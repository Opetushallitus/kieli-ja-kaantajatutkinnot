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
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: grey700Color,
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
  },
  palette: {
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
  },
});
