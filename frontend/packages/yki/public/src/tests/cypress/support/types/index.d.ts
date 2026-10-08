import { RequestHandler } from 'msw';

declare global {
  namespace Cypress {
    interface Chainable {
      useMswHandlers(...handlers: Array<RequestHandler>): Chainable<void>;
      isOnPage(page: string): Chainable<Element>;
      openPublicRegistrationPage(): void;
      openEvaluationOrderPage(id: number): void;
      openExamSessionRegistrationForm(id: number, registrationId: number): void;
      openPublicUserDetailsPage(): void;
      openExamSessionRegistrationFormWithSearch(
        examSessionId: number,
        registrationId: number,
        search?: string,
      ): void;
    }
  }
}
