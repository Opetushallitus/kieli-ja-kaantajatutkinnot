import { AppRoutes } from 'enums/app';

declare global {
  namespace Cypress {
    interface Chainable {
      openPublicHomePage(): void;
      openClerkHomePage(): void;
      openClerkPersonSearchPage(): void;
      openMeetingDatesPage(): void;
      usePhoneViewport(): void;
      goBack(): void;
      goForward(): void;
      isOnPage(page: AppRoutes): Chainable<Element>;
    }
  }
}
