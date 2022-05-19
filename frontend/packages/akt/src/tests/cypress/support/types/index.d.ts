import { AppRoutes } from 'enums/app';

declare global {
  namespace Cypress {
    interface Chainable {
      usePhoneViewport(): void;
      openPublicHomePage(): void;
      openClerkHomePage(): void;
      openExaminationDatesPage(): void;
      openMeetingDatesPage(): void;
      goBack(): void;
      goForward(): void;
      isOnPage(page: AppRoutes): Chainable<Element>;
    }
  }
}
