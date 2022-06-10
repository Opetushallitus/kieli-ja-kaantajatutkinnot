import { ThemeProvider } from '@mui/material/styles';
import { render, RenderOptions } from '@testing-library/react';
import { Dayjs } from 'dayjs';
import { FC, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { theme } from 'configs/materialUI';
import store from 'redux/store';

type Props = {
  children?: React.ReactNode;
};

const AllTheProviders: FC<Props> = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

const fakeSystemTime = (date: Dayjs) => {
  jest.useFakeTimers().setSystemTime(date.toDate());
};

export { customRender as render, fakeSystemTime };
