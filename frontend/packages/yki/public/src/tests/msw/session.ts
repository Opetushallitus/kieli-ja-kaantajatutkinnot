import { SessionResponse } from 'interfaces/session';
import { SuomiFiAuthenticatedSessionResponse } from 'tests/msw/fixtures/identity';

const storageKey = 'msw:yki-session';
export const getMockSession = (): SessionResponse => {
  const saved = sessionStorage.getItem(storageKey);

  return saved ? JSON.parse(saved) : SuomiFiAuthenticatedSessionResponse;
};
export const setMockSession = (session: SessionResponse) =>
  sessionStorage.setItem(storageKey, JSON.stringify(session));
export const resetMockSession = () => sessionStorage.removeItem(storageKey);
