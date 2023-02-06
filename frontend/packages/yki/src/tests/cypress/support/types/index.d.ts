// Workaround for ts(2669): adding an import or export marks a file as a module,
// which is needed to augment the global scope as done below.
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      openPublicRegistrationPage(): void;
    }
  }
}