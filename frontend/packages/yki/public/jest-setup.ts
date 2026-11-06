import '@testing-library/jest-dom';

// eslint-disable-next-line no-restricted-imports
import { server } from './src/tests/msw/server';

beforeAll(async () => {
  const { initI18nForTests } = jest.requireActual('./src/configs/i18n');
  await initI18nForTests();
  server.listen();
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
