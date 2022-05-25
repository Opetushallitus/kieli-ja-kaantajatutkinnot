import '@testing-library/jest-dom';

// eslint-disable-next-line no-restricted-imports
import { server } from './src/tests/jest/__mocks__/server';

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
