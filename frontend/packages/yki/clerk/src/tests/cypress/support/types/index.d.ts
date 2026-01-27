// Workaround for ts(2669): adding an import or export marks a file as a module,
// which is needed to augment the global scope as done below.
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      isOnPage(page: string): Chainable<Element>;
      openClerkRegistrationPage(): void;
      openClerkFreeRegistrationPage(cookie?: Record<string, string>): void;
      openClerkFreeRegistrationDetailsPage(
        id: number,
        cookie?: Record<string, string>,
      ): void;
      openCustomerSearchPage(): void;
      openClerkCustomerDetailsPage(oid: string): void;
      openClerkCustomersSearchPage(): void;
    }
  }
}
