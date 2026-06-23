type ListingTab = 'pending' | 'past' | 'active';

const listingTestIds: Record<ListingTab, string> = {
  pending: 'pending-reviews-listing',
  past: 'past-reviews-listing',
  active: 'active-quarantines-listing',
};

class ClerkQuarantinePage {
  elements = {
    heading: () => cy.findByRole('heading', { name: 'Osallistumiskiellot' }),
    tabs: () => cy.get('.clerk-quarantine__filter-tabs__tab'),
    activeTab: () => cy.get('.clerk-quarantine__filter-tabs__tab.active'),
    tableRows: (tab: ListingTab) =>
      cy.get(`[data-testid="${listingTestIds[tab]}"] table tbody tr`),
    addQuarantineButton: () =>
      cy
        .get(`[data-testid="${listingTestIds.active}"]`)
        .findByRole('button', { name: 'Lisää osallistumiskielto' }),
  };

  modal = {
    elements: {
      container: () => cy.get('[data-testid="add-quarantine-modal"]'),
      firstNameInput: () =>
        cy.get('[data-testid="add-quarantine-first-name"]').find('input'),
      lastNameInput: () =>
        cy.get('[data-testid="add-quarantine-last-name"]').find('input'),
      ssnInput: () =>
        cy.get('[data-testid="add-quarantine-ssn"]').find('input'),
      emailInput: () =>
        cy.get('[data-testid="add-quarantine-email"]').find('input'),
      phoneInput: () =>
        cy.get('[data-testid="add-quarantine-phone"]').find('input'),
      startDateInput: () =>
        cy.get('[data-testid="add-quarantine-start-date"]').find('input'),
      endDateInput: () =>
        cy.get('[data-testid="add-quarantine-end-date"]').find('input'),
      caseNumberInput: () =>
        cy.get('[data-testid="add-quarantine-case-number"]').find('input'),
      languageRadio: (languageCode: string) =>
        cy.get(`input[type="radio"][value="${languageCode}"]`),
      submitButton: () =>
        cy
          .get('[data-testid="add-quarantine-modal"]')
          .findByRole('button', { name: 'Lisää osallistumiskielto' }),
      cancelButton: () =>
        cy
          .get('[data-testid="add-quarantine-modal"]')
          .findByRole('button', { name: 'Peruuta' }),
    },

    expectVisible() {
      this.elements.container().should('be.visible');
    },

    expectNotExist() {
      this.elements.container().should('not.exist');
    },

    fillFirstName(value: string) {
      this.elements.firstNameInput().scrollIntoView().clear().type(value);
    },

    fillLastName(value: string) {
      this.elements.lastNameInput().scrollIntoView().clear().type(value);
    },

    fillSsn(value: string) {
      this.elements.ssnInput().scrollIntoView().clear().type(value);
    },

    fillEmail(value: string) {
      this.elements.emailInput().scrollIntoView().clear().type(value);
    },

    fillPhone(value: string) {
      this.elements.phoneInput().scrollIntoView().clear().type(value);
    },

    selectLanguage(languageCode: string) {
      this.elements.languageRadio(languageCode).scrollIntoView().click();
    },

    fillStartDate(date: string) {
      this.elements
        .startDateInput()
        .scrollIntoView()
        .type('{selectAll}{backspace}')
        .type(date);
    },

    fillEndDate(date: string) {
      this.elements
        .endDateInput()
        .scrollIntoView()
        .type('{selectAll}{backspace}')
        .type(date);
    },

    fillCaseNumber(value: string) {
      this.elements.caseNumberInput().scrollIntoView().clear().type(value);
    },

    submit() {
      this.elements.submitButton().scrollIntoView().click();
    },
  };

  editModal = {
    elements: {
      container: () => cy.get('[data-testid="edit-quarantine-modal"]'),
      firstNameInput: () =>
        cy.get('[data-testid="edit-quarantine-first-name"]').find('input'),
      lastNameInput: () =>
        cy.get('[data-testid="edit-quarantine-last-name"]').find('input'),
      birthdateInput: () =>
        cy.get('[data-testid="edit-quarantine-birthdate"]').find('input'),
      ssnInput: () =>
        cy.get('[data-testid="edit-quarantine-ssn"]').find('input'),
      emailInput: () =>
        cy.get('[data-testid="edit-quarantine-email"]').find('input'),
      phoneInput: () =>
        cy.get('[data-testid="edit-quarantine-phone"]').find('input'),
      caseNumberInput: () =>
        cy.get('[data-testid="edit-quarantine-case-number"]').find('input'),
      languageRadio: (languageCode: string) =>
        cy.get(`input[type="radio"][value="${languageCode}"]`),
      submitButton: () =>
        cy
          .get('[data-testid="edit-quarantine-modal"]')
          .findByRole('button', { name: 'Tallenna muutokset' }),
      cancelButton: () =>
        cy
          .get('[data-testid="edit-quarantine-modal"]')
          .findByRole('button', { name: 'Peruuta' }),
    },

    expectVisible() {
      this.elements.container().should('be.visible');
    },

    expectNotExist() {
      this.elements.container().should('not.exist');
    },

    expectFieldValue(
      field:
        | 'firstName'
        | 'lastName'
        | 'birthdate'
        | 'ssn'
        | 'email'
        | 'phone'
        | 'caseNumber',
      value: string,
    ) {
      const inputs = {
        firstName: this.elements.firstNameInput,
        lastName: this.elements.lastNameInput,
        birthdate: this.elements.birthdateInput,
        ssn: this.elements.ssnInput,
        email: this.elements.emailInput,
        phone: this.elements.phoneInput,
        caseNumber: this.elements.caseNumberInput,
      };
      inputs[field]().should('have.value', value);
    },

    expectLanguageSelected(languageCode: string) {
      this.elements.languageRadio(languageCode).should('be.checked');
    },

    fillFirstName(value: string) {
      this.elements.firstNameInput().scrollIntoView().clear().type(value);
    },

    submit() {
      this.elements.submitButton().scrollIntoView().click();
    },
  };

  deleteModal = {
    elements: {
      container: () => cy.get('[data-testid="delete-quarantine-modal"]'),
      confirmButton: () =>
        cy
          .get('[data-testid="delete-quarantine-modal"]')
          .findByRole('button', { name: 'Poista osallistumiskielto' }),
      cancelButton: () =>
        cy
          .get('[data-testid="delete-quarantine-modal"]')
          .findByRole('button', { name: 'Peruuta' }),
    },

    expectVisible() {
      this.elements.container().should('be.visible');
    },

    expectNotExist() {
      this.elements.container().should('not.exist');
    },

    expectDescriptionContains(fragments: string[]) {
      fragments.forEach((fragment) => {
        this.elements.container().should('contain.text', fragment);
      });
    },

    confirm() {
      this.elements.confirmButton().scrollIntoView().click();
    },

    cancel() {
      this.elements.cancelButton().scrollIntoView().click();
    },
  };

  clickRowAction(tab: ListingTab, index: number, label: string) {
    this.elements
      .tableRows(tab)
      .eq(index)
      .within(() => {
        cy.contains('button', label).click();
      });
  }

  isVisible() {
    this.elements.heading().should('be.visible');
  }

  expectTableRowCount(tab: ListingTab, count: number) {
    this.elements.tableRows(tab).should('have.length', count);
  }

  clickTab(tabText: string) {
    this.elements.tabs().contains(tabText).click();
    this.elements.tabs().contains(tabText).should('have.class', 'active');
  }

  expectActiveTab(tabText: string) {
    this.elements.activeTab().should('have.text', tabText);
  }

  expectCorrectRowData(tab: ListingTab, index: number, data: string[]) {
    this.elements
      .tableRows(tab)
      .eq(index)
      .within(() => {
        data.forEach((value, i) => {
          cy.get('td').eq(i).should('have.text', value);
        });
      });
  }
}

export const onClerkQuarantinePage = new ClerkQuarantinePage();
