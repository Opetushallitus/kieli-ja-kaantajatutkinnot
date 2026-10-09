import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { AppRoutes } from 'enums/app';
import { onClerkCustomerDetailsPage } from 'tests/cypress/support/page-objects/clerkCustomerDetailsPage';
import { onClerkRegisterListing } from 'tests/cypress/support/page-objects/clerkRegisterListing';
import { onToast } from 'tests/cypress/support/page-objects/toast';

const ORGANIZER_OID = '1.2.246.562.10.28646781493';
const EXAM_SESSION_ID = '999';
const CUSTOMER_OID = '1.2.246.562.24.82364099322';

const customerServiceUser = {
  oid: ORGANIZER_OID,
  isAdmin: false,
  isOrganizer: true,
  isCustomerService: true,
};

const customerServiceOnlyUser = {
  ...customerServiceUser,
  isOrganizer: false,
};

const openExamSessionPage = () => {
  cy.visit(AppRoutes.ClerkExamSession.replace(':id', EXAM_SESSION_ID));
  cy.findByText('Lataa excel').should('be.visible');
};

describe('Customer service user who is also an organizer', () => {
  before(() => {
    DateUtils.setDayjsLocale(AppLanguage.Finnish);
  });

  beforeEach(() => {
    cy.mockAuthUser(customerServiceUser);
  });

  it('sees register, customer search and own exam sessions in navigation', () => {
    cy.openClerkRegistrationPage();

    cy.get('nav a').should('have.length', 3);
    cy.get('nav')
      .contains('a', 'Järjestäjärekisteri')
      .should('have.attr', 'href', AppRoutes.ClerkOrganizerRegister);
    cy.get('nav')
      .contains('a', 'Asiakashaku')
      .should('have.attr', 'href', AppRoutes.CustomerSearch);
    cy.get('nav')
      .contains('a', 'Tutkintopäivät')
      .should(
        'have.attr',
        'href',
        AppRoutes.OrganizerHome.replace(':oid', ORGANIZER_OID),
      );
  });

  it('is redirected from admin pages to organizer register', () => {
    cy.visit(AppRoutes.ClerkQuarantine);
    cy.location('pathname').should('eq', AppRoutes.ClerkOrganizerRegister);

    cy.visit(AppRoutes.ClerkAddOrganizer);
    cy.location('pathname').should('eq', AppRoutes.ClerkOrganizerRegister);
  });

  it('can view organizer register but not add or modify organizers', () => {
    cy.openClerkRegistrationPage();
    onClerkRegisterListing.expectOrganizerRowsCount(4);
    onClerkRegisterListing.elements.addOrganizerButton().should('not.exist');

    onClerkRegisterListing.clickExpandRow(0);
    onClerkRegisterListing.expectAdminViewButtonVisible();
    onClerkRegisterListing.elements.modifyButton().should('not.exist');
  });

  it('can view organizer exam sessions but not add exam sessions', () => {
    cy.visit(
      AppRoutes.ClerkOrganizerRegisterDetails.replace(':oid', ORGANIZER_OID),
    );

    cy.findByText('Tulevat tutkintotilaisuudet').should('be.visible');
    cy.findByText('Lisää tutkintotilaisuus').should('not.exist');
  });

  it('can view exam session participants but not edit, relocate or cancel', () => {
    openExamSessionPage();

    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    cy.findByText('Muokkaa tutkintotilaisuuden tietoja').should('not.exist');
    cy.findByText('Siirrä tilaisuuteen').should('not.exist');
    cy.findByText('Peru osallistuminen').should('not.exist');
  });

  it('can still add exam sessions for own organization', () => {
    cy.visit(AppRoutes.OrganizerHome.replace(':oid', ORGANIZER_OID));

    cy.findByText('Lisää tutkintotilaisuus').should('be.visible');
  });

  it('sees all organizers in search filter after visiting own organizer page', () => {
    cy.visit(AppRoutes.OrganizerHome.replace(':oid', ORGANIZER_OID));
    cy.get('nav').contains('a', 'Asiakashaku').click();

    cy.location('pathname').should('eq', AppRoutes.CustomerSearch);
    cy.findByLabelText('Järjestäjä').click();
    cy.findAllByRole('option').should('have.length', 3);
  });

  it('cannot relocate or cancel registrations of a customer', () => {
    cy.openClerkCustomerDetailsPage(CUSTOMER_OID);
    onClerkCustomerDetailsPage.isVisible(CUSTOMER_OID);

    onClerkCustomerDetailsPage.elements
      .registeredTableBody()
      .should('have.length', 4);
    onClerkCustomerDetailsPage.elements
      .registeredTableHeader()
      .should('have.length', 5);
    cy.findByText('Siirrä tilaisuuteen').should('not.exist');
    cy.findByText('Peru osallistuminen').should('not.exist');
  });

  it('can edit customer contact information', () => {
    cy.openClerkCustomerDetailsPage(CUSTOMER_OID);
    onClerkCustomerDetailsPage.isVisible(CUSTOMER_OID);

    onClerkCustomerDetailsPage.clickEditContactButton();

    const newValues = {
      email: 'asiakaspalvelu@example.com',
      phoneNumber: '+358 501234567',
      streetAddress: 'Muuttokatu 1',
      zip: '40100',
      postOffice: 'Jyväskylä',
    };

    const modal = () => cy.get('.custom-modal');

    modal().find('input').eq(0).clear().type(newValues.email);
    modal().find('input').eq(1).clear().type(newValues.email);
    modal().find('input').eq(2).clear().type(newValues.phoneNumber);
    modal().find('input').eq(3).clear().type(newValues.streetAddress);
    modal().find('input').eq(4).clear().type(newValues.zip);
    modal().find('input').eq(5).clear().type(newValues.postOffice);

    cy.findByText('Tallenna tiedot').click();

    onToast.expectText('Muutosten tallentaminen onnistui');

    onClerkCustomerDetailsPage.expectContactDetailsVisible(newValues);
  });
});

describe('Customer service user without organizer role', () => {
  beforeEach(() => {
    cy.mockAuthUser(customerServiceOnlyUser);
  });

  it('is redirected to organizer register and sees only clerk links', () => {
    cy.visit(AppRoutes.OrganizerHome.replace(':oid', ORGANIZER_OID));

    cy.location('pathname').should('eq', AppRoutes.ClerkOrganizerRegister);
    cy.get('nav a').should('have.length', 2);
    cy.get('nav').contains('a', 'Järjestäjärekisteri').should('exist');
    cy.get('nav').contains('a', 'Asiakashaku').should('exist');
  });
});

describe('Admin (control for hidden actions)', () => {
  it('sees exam session edit, relocate and cancel actions', () => {
    openExamSessionPage();

    cy.findByText('Muokkaa tutkintotilaisuuden tietoja').should('be.visible');
    cy.findAllByText('Siirrä tilaisuuteen').should(
      'have.length.greaterThan',
      0,
    );
    cy.findAllByText('Peru osallistuminen').should(
      'have.length.greaterThan',
      0,
    );
  });

  it('sees add exam session in organizer register details', () => {
    cy.visit(
      AppRoutes.ClerkOrganizerRegisterDetails.replace(':oid', ORGANIZER_OID),
    );

    cy.findByText('Lisää tutkintotilaisuus').should('be.visible');
  });
});
