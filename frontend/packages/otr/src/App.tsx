import { ThemeProvider } from '@mui/material/styles';

import { theme } from 'configs/materialUI';
import { AppRouter } from 'routers/AppRouter';
import 'public/assets/svg/footer_wave.svg'; // Fixme: Remove

import 'styles/styles.scss';

export const App = () => (
  <ThemeProvider theme={theme}>
    <AppRouter />
  </ThemeProvider>
);
