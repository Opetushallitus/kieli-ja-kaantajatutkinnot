type ListingTab = 'pending' | 'past';

const listingTestIds: Record<ListingTab, string> = {
  pending: 'pending-reviews-listing',
  past: 'past-reviews-listing',
};

class ClerkQuarantinePage {
  elements = {
    heading: () => cy.findByRole('heading', { name: 'Osallistumiskiellot' }),
    tabs: () => cy.get('.clerk-quarantine__filter-tabs__tab'),
    activeTab: () => cy.get('.clerk-quarantine__filter-tabs__tab.active'),
    tableRows: (tab: ListingTab) =>
      cy.get(`[data-testid="${listingTestIds[tab]}"] table tbody tr`),
    addQuarantineButton: () =>
      cy.findByRole('button', { name: 'Lisää osallistumiskielto' }).first(),
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

  isVisible() {
    this.elements.heading().should('be.visible');
  }

  expectTableRowCount(tab: ListingTab, count: number) {
    this.elements.tableRows(tab).should('have.length', count);
  }

  clickTab(tabText: string) {
    this.elements.tabs().contains(tabText).click();
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
