import { render, screen } from '@testing-library/react';
import { changeLanguage, use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router';

import { PublicEnrollmentDesktopGrid } from 'components/publicEnrollment/PublicEnrollmentDesktopGrid';
import { PublicEnrollmentPhoneGrid } from 'components/publicEnrollment/PublicEnrollmentPhoneGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import commonSV from 'public/i18n/sv-SE/common.json';
import publicSV from 'public/i18n/sv-SE/public.json';
import { initialState } from 'redux/reducers/publicEnrollment';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

const originalResizeObserver = global.ResizeObserver;

beforeAll(async () => {
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  await use(initReactI18next).init({
    lng: 'fi-FI',
    resources: {
      'fi-FI': { public: publicFI, common: commonFI },
      'sv-SE': { public: publicSV, common: commonSV },
    },
  });
});

afterAll(() => {
  global.ResizeObserver = originalResizeObserver;
});

describe.each([
  { language: 'fi-FI', translations: publicFI },
  { language: 'sv-SE', translations: publicSV },
])('payment information in $language', ({ language, translations }) => {
  const { paymentRecipient, paymentServiceProvider } =
    translations.vkt.component;

  beforeEach(async () => {
    await changeLanguage(language);
    jest.mocked(useAppDispatch).mockReturnValue(jest.fn());
  });

  describe.each([
    { layout: 'desktop', width: 1280, Grid: PublicEnrollmentDesktopGrid },
    { layout: 'phone', width: 390, Grid: PublicEnrollmentPhoneGrid },
  ])('$layout preview', ({ layout, width, Grid }) => {
    const renderPreview = (isFree = false, isEnrollmentToQueue = false) => {
      Object.defineProperty(window, 'innerWidth', {
        value: width,
        configurable: true,
      });
      jest.mocked(useAppSelector).mockReturnValue({
        ...initialState,
        enrollment: { ...initialState.enrollment, oralSkill: true, isFree },
      });

      return render(
        <BrowserRouter>
          <Grid
            activeStep={PublicEnrollmentFormStep.Preview}
            isStepValid={false}
            isShiftedFromQueue={false}
            isExamEventDetailsAvailable={true}
            isPaymentSumAvailable={!isEnrollmentToQueue}
            isPreviewStepActive={true}
            isPreviewPassed={false}
            isEnrollmentToQueue={isEnrollmentToQueue}
            showValidation={false}
            setIsStepValid={jest.fn()}
            setShowValidation={jest.fn()}
            examEvent={SerializationUtils.deserializePublicExamEvent(
              publicExamEvents11[0],
            )}
          />
        </BrowserRouter>,
      );
    };

    it('shows the recipient and Paytrail details after the terms for a paid enrollment', () => {
      renderPreview();
      const recipient = screen.getByText(paymentRecipient.recipient);
      const provider = screen.getByRole('heading', {
        name: paymentServiceProvider.title,
      });

      expect(
        screen.getByRole('checkbox').compareDocumentPosition(recipient) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        recipient.compareDocumentPosition(provider) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        screen.getByText(paymentServiceProvider.description),
      ).toBeVisible();
      expect(screen.getByText(paymentServiceProvider.businessId)).toBeVisible();
      expect(
        screen.getByRole('link', { name: paymentServiceProvider.url }),
      ).toHaveAttribute('href', paymentServiceProvider.url);

      const fee = screen.getByTestId('public-enrollment__payment-sum');
      if (layout === 'desktop') {
        expect(
          provider.compareDocumentPosition(fee) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      } else {
        expect(fee.closest('.mobile-app-bar')).not.toBeNull();
      }
    });

    it.each([
      { state: 'free enrollment', isFree: true, isQueued: false },
      { state: 'queue enrollment', isFree: false, isQueued: true },
    ])('omits payment information for a $state', ({ isFree, isQueued }) => {
      renderPreview(isFree, isQueued);
      expect(
        screen.queryByText(paymentRecipient.recipient),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: paymentServiceProvider.title }),
      ).not.toBeInTheDocument();
    });
  });
});
