import { AppRoutes } from 'enums/app';
import { onClerkNewInterpreterPage } from 'tests/cypress/support/page-objects/clerkNewInterpreterPage';
import { onClerkPersonSearchPage } from 'tests/cypress/support/page-objects/clerkPersonSearchPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { clerkInterpreter } from 'tests/msw/fixtures/clerkInterpreter';
import { person1, person2 } from 'tests/msw/fixtures/person';

const NEW_PERSON_SSN = '170688-935N';

describe('ClerkNewInterpreterPage', () => {
  beforeEach(() => {
    cy.openClerkPersonSearchPage();
  });

  describe('on creation of interpreter for a new person', () => {
    beforeEach(() => {
      onClerkPersonSearchPage.typeSocialSecurityNumber(NEW_PERSON_SSN);
      onClerkPersonSearchPage.clickSearchButton();
      onClerkPersonSearchPage.clickProceedButton();
    });

    it('title should indicate a new person is created in ONR', () => {
      onClerkNewInterpreterPage.expectTitle(
        'Tiedot lisätään oppijanumerorekisteriin',
      );
    });

    it('only identity number field should be prefilled and disabled', () => {
      onClerkNewInterpreterPage.expectInterpreterFieldValue(
        'identityNumber',
        'input',
        NEW_PERSON_SSN,
      );
      onClerkNewInterpreterPage.expectDisabledInterpreterField(
        'identityNumber',
        'input',
      );

      [
        'lastName',
        'firstName',
        'nickName',
        'street',
        'postalCode',
        'town',
        'country',
        'email',
        'phoneNumber',
        'otherContactInfo',
      ].forEach((field) => {
        onClerkNewInterpreterPage.expectInterpreterFieldValue(
          field,
          'input',
          '',
        );
        onClerkNewInterpreterPage.expectEnabledInterpreterField(field, 'input');
      });
    });

    it('saving should be disabled if fields are not properly set', () => {
      const expectEmptyingToDisableSaveInterpreterButton = (
        fieldName,
        reset,
      ) => {
        onClerkNewInterpreterPage.editInterpreterField(fieldName, 'input', ' ');
        onClerkNewInterpreterPage.expectDisabledSaveInterpreterButton();
        onClerkNewInterpreterPage.editInterpreterField(
          fieldName,
          'input',
          reset,
        );
      };

      onClerkNewInterpreterPage.setNameFieldValues(
        'Tester',
        'Test Name',
        'Test',
      );
      onClerkNewInterpreterPage.editInterpreterField(
        'email',
        'input',
        'test@tester',
      );
      onClerkNewInterpreterPage.clickAddQualificationButton();
      onClerkNewInterpreterPage.fillOutQualificationFields();
      onClerkNewInterpreterPage.clickSaveQualificationButton();

      onClerkNewInterpreterPage.expectEnabledSaveInterpreterButton();

      expectEmptyingToDisableSaveInterpreterButton('lastName', 'Tester');
      expectEmptyingToDisableSaveInterpreterButton('firstName', 'Test');
      expectEmptyingToDisableSaveInterpreterButton('nickName', 'Test');
      expectEmptyingToDisableSaveInterpreterButton('email', 'test@tester');

      onClerkNewInterpreterPage.expectEnabledSaveInterpreterButton();
    });

    it('saving should work with fields properly set', () => {
      onClerkNewInterpreterPage.setNameFieldValues(
        'Tester',
        'Test Name',
        'Test',
      );
      onClerkNewInterpreterPage.editInterpreterField(
        'email',
        'input',
        'test@tester',
      );
      onClerkNewInterpreterPage.clickAddQualificationButton();
      onClerkNewInterpreterPage.fillOutQualificationFields();
      onClerkNewInterpreterPage.clickSaveQualificationButton();

      onClerkNewInterpreterPage.clickSaveInterpreterButton();

      onToast.expectText('Tulkin tiedot tallennettiin');
      const expectedInterpreterPage =
        AppRoutes.ClerkInterpreterOverviewPage.replace(
          /:interpreterId$/,
          `${clerkInterpreter.id}`,
        );
      cy.isOnPage(expectedInterpreterPage);
    });
  });

  describe('on creation of interpreter for an existing individualised person', () => {
    beforeEach(() => {
      onClerkPersonSearchPage.typeSocialSecurityNumber(person1.identityNumber);
      onClerkPersonSearchPage.clickSearchButton();
    });

    it('title should indicate interpreter is created for an existing person', () => {
      onClerkNewInterpreterPage.expectTitle(
        'Tiedot lisätään olemassa olevalle oppijalle',
      );
    });

    it('personal information fields should be prefilled and disabled', () => {
      onClerkNewInterpreterPage.expectNameFieldValues(
        person1.lastName,
        person1.firstName,
        person1.nickName,
      );
      onClerkNewInterpreterPage.expectInterpreterFieldValue(
        'identityNumber',
        'input',
        person1.identityNumber,
      );

      ['lastName', 'firstName', 'nickName', 'identityNumber'].forEach(
        (field) => {
          onClerkNewInterpreterPage.expectDisabledInterpreterField(
            field,
            'input',
          );
        },
      );
    });
  });

  describe('on creation of interpreter for an existing person with individualised address', () => {
    beforeEach(() => {
      onClerkPersonSearchPage.typeSocialSecurityNumber(person2.identityNumber);
      onClerkPersonSearchPage.clickSearchButton();
    });

    it('address fields should be prefilled and disabled', () => {
      onClerkNewInterpreterPage.expectAddressFieldValues(
        person2.street,
        person2.postalCode,
        person2.town,
        person2.country,
      );

      ['street', 'postalCode', 'town', 'country'].forEach((field) => {
        onClerkNewInterpreterPage.expectDisabledInterpreterField(
          field,
          'input',
        );
      });
    });
  });
});
