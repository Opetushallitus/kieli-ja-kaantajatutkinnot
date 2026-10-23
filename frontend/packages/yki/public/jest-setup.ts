import '@testing-library/jest-dom';
import { AppLanguage } from 'shared/enums';

import { changeLang, initI18nForTests } from 'configs/i18n';
import { server } from 'tests/msw/server';

beforeAll(async () => {
  await initI18nForTests();
  server.listen();
});

beforeEach(async () => {
  await changeLang(AppLanguage.Finnish);
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
