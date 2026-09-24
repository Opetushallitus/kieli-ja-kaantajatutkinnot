import { render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import { APIResponseStatus } from 'shared/enums';
import { useToast, useWindowProperties } from 'shared/hooks';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useCountryOptions } from 'hooks/useCountryOptions';
import { useModifyContactDetailsErrors } from 'hooks/useModifyContactDetailsErrors';
import { ModifyContactDetailsPage } from 'pages/ModifyContactDetailsPage';
import { loadSession } from 'redux/reducers/session';
import { loadPersonDetails } from 'redux/reducers/userDetails';

jest.mock('configs/redux', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('configs/i18n', () => {
  const translate = (key: string) => key;

  return {
    usePublicTranslation: () => ({ t: translate }),
    useCommonTranslation: () => translate,
  };
});

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

jest.mock('shared/hooks', () => ({
  useDialog: () => ({ showDialog: jest.fn() }),
  useToast: jest.fn(),
  useWindowProperties: jest.fn(),
}));

jest.mock('hooks/useCountryOptions', () => ({
  useCountryOptions: jest.fn(),
}));

jest.mock('hooks/useModifyContactDetailsErrors', () => ({
  useModifyContactDetailsErrors: jest.fn(),
}));

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockShowToast = jest.fn();
const mockState = {
  userDetails: {
    personDetails: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '+358501122334',
      streetAddress: 'Testikatu 1',
      postOffice: 'Helsinki',
      zip: '00100',
      countryCode: '246',
      registrations: [],
    },
    registrations: [],
    status: APIResponseStatus.Success,
    cancelUserRegistrationStatus: APIResponseStatus.NotStarted,
    isCancelModalOpen: false,
    modifyContactDetails: {},
    modifyContactDetailsStatus: APIResponseStatus.Success,
  },
  nationalities: {
    status: APIResponseStatus.Success,
    nationalities: [],
  },
};

describe('ModifyContactDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAppDispatch).mockReturnValue(mockDispatch);
    jest
      .mocked(useAppSelector)
      .mockImplementation((selector) => selector(mockState as never));
    jest.mocked(useNavigate).mockReturnValue(mockNavigate);
    jest.mocked(useToast).mockReturnValue({
      activeToast: undefined,
      showToast: mockShowToast,
      removeToast: jest.fn(),
    });
    jest.mocked(useWindowProperties).mockReturnValue({
      isPhone: false,
      isTablet: false,
      isDesktopXS: false,
      isDesktop: true,
      width: 1280,
      height: 900,
    });
    jest.mocked(useCountryOptions).mockReturnValue([]);
    jest.mocked(useModifyContactDetailsErrors).mockReturnValue(() => ({}));
  });

  it('handles successful update only once when the page rerenders', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ModifyContactDetailsPage />
      </MemoryRouter>,
    );

    rerender(
      <MemoryRouter>
        <ModifyContactDetailsPage />
      </MemoryRouter>,
    );

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(AppRoutes.UserDetails);
    expect(mockDispatch).toHaveBeenCalledWith(loadPersonDetails());
    expect(mockDispatch).toHaveBeenCalledWith(loadSession());
    expect(
      mockDispatch.mock.calls.filter(
        ([action]) => action.type === loadPersonDetails.type,
      ),
    ).toHaveLength(1);
    expect(
      mockDispatch.mock.calls.filter(
        ([action]) => action.type === loadSession.type,
      ),
    ).toHaveLength(1);
  });
});
