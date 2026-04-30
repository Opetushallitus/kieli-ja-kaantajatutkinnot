import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { onPublicEnrollmentContactPage } from 'tests/cypress/support/page-objects/publicEnrollmentContactPage';
import { onPublicGoodAndSatisfactoryLevelPage } from 'tests/cypress/support/page-objects/publicGoodAndSatisfactoryLevelPage';
import {
  expectNoDialog,
  findDialogByText,
} from 'tests/cypress/support/utils/dialog';
import { publicExaminers } from 'tests/msw/fixtures/publicExaminer';

interface ContactDetailsField {
  label: string;
  value: string;
}

const examinerToContact = publicExaminers.filter(({ id }) => id === 2)[0];

const expectedEnrollmentContact: PublicEnrollmentContact = {
  firstName: 'Tero',
  lastName: 'Testaaja',
  message: 'Viestiä pukkaa!',
  privacyStatementConfirmation: false,
  email: 'tero@test.invalid',
  emailConfirmation: 'tero@test.invalid',
  phoneNumber: '0501234567',
};

const contactDetailsFields: Array<ContactDetailsField> = [
  { label: 'Etunimi *', value: expectedEnrollmentContact.firstName },
  { label: 'Sukunimi *', value: expectedEnrollmentContact.lastName },
  { label: 'Puhelinnumero *', value: expectedEnrollmentContact.phoneNumber },
  { label: 'Sähköposti *', value: expectedEnrollmentContact.email },
  { label: 'Vahvista sähköposti *', value: 'typo@test.invalid' },
];

const expectAndCloseErrorDialog = (
  expectedText = 'Tiedoissa on korjattavaa!',
) => {
  findDialogByText(expectedText)
    .findByRole('button', {
      name: 'Takaisin',
    })
    .click();
  expectNoDialog();
};

describe('PublicEnrollmentContactPage', () => {
  it('should require user to fill contact information and specify their desired exam', () => {
    cy.openPublicEnrollmentContactPage(examinerToContact.id);
    // Step 1: Fill contact details
    onPublicEnrollmentContactPage.expectStepHeading('Yhteystietosi');
    onPublicEnrollmentContactPage.clickNext();
    expectAndCloseErrorDialog();

    // Assert error dialog is raised if there are missing or incorrect fields
    contactDetailsFields.forEach(({ label, value }) => {
      cy.findByRole('textbox', { name: label }).type(value);
      onPublicEnrollmentContactPage.clickNext();
      expectAndCloseErrorDialog();
    });

    // Fix confirmation of email and proceed to next step
    cy.findByRole('textbox', { name: 'Vahvista sähköposti *' })
      .clear()
      .type('tero@test.invalid');
    onPublicEnrollmentContactPage.clickNext();

    // Step 2: Fill info regarding desired exam

    onPublicEnrollmentContactPage.expectStepHeading(
      'Valitse tutkinto ja lähetä viesti',
    );
    onPublicEnrollmentContactPage.clickSubmit();
    expectAndCloseErrorDialog();

    // Selecting 'No' for previous enrollment blocks submission
    onPublicEnrollmentContactPage.selectPreviousEnrollment(false);
    onPublicEnrollmentContactPage.clickSubmit();
    expectAndCloseErrorDialog();

    onPublicEnrollmentContactPage.selectPreviousEnrollment(true);
    onPublicEnrollmentContactPage.selectFullExam(false);
    onPublicEnrollmentContactPage.writeMessage('Viestiä pukkaa!');

    onPublicEnrollmentContactPage.clickSubmit();
    expectAndCloseErrorDialog('Kerro, mitkä osakokeet haluat suorittaa');
  });

  describe('after specifying all required exam details including attachment', () => {
    const stateWithAttachment = {
      publicEnrollmentContact: JSON.stringify({
        loadExaminerStatus: 'NOT_STARTED',
        enrollmentSubmitStatus: 'NOT_STARTED',
        paymentLoadingStatus: 'NOT_STARTED',
        cancelStatus: 'NOT_STARTED',
        enrollment: {
          email: expectedEnrollmentContact.email,
          emailConfirmation: expectedEnrollmentContact.email,
          phoneNumber: expectedEnrollmentContact.phoneNumber,
          firstName: expectedEnrollmentContact.firstName,
          lastName: expectedEnrollmentContact.lastName,
          isFullExam: false,
          id: 1,
          hasPreviousEnrollment: true,
          privacyStatementConfirmation: false,
          status: null,
          message: expectedEnrollmentContact.message,
          attachments: [{ id: 'fake-attachment-key', name: 'test.pdf', size: 1000 }],
        },
        contactDetailsNeedConfirmation: false,
        contactedExaminers: [],
      }),
    };

    it('should submit successfully after specifying partial exam', () => {
      cy.openPublicEnrollmentContactPage(
        examinerToContact.id,
        'tutkinto',
        JSON.stringify(stateWithAttachment),
      );
      onPublicEnrollmentContactPage.expectStepHeading(
        'Valitse tutkinto ja lähetä viesti',
      );
      onPublicEnrollmentContactPage.writePartialExamDescription('kirjoittaminen');
      onPublicEnrollmentContactPage.clickSubmit();
      onPublicEnrollmentContactPage.expectStepHeading('Viesti lähetetty');
    });
  });

  describe('after successfully submitting a contact request', () => {
    const stateToPersist = {
      publicEnrollmentContact: JSON.stringify({
        enrollment: expectedEnrollmentContact,
        contactedExaminers: [{ id: examinerToContact.id }],
      }),
    };
    beforeEach(() => {
      cy.openPublicEnrollmentContactPage(
        2,
        'valmis',
        JSON.stringify(stateToPersist),
      );
    });

    it('should allow user to contact another examiner with same details after submitting one request', () => {
      onPublicEnrollmentContactPage.submitAnotherMessage();
      onPublicGoodAndSatisfactoryLevelPage.assertExaminerAlreadyContacted(
        'Anneli Alanen',
      );
      onPublicGoodAndSatisfactoryLevelPage.contactExaminer('Eero Eskola');
      onPublicEnrollmentContactPage.expectStepHeading('Vahvista yhteystietosi');

      onPublicEnrollmentContactPage.continueWithExistingDetails();
      contactDetailsFields.forEach(({ label, value }) => {
        if (label === 'Vahvista sähköposti *') {
          cy.findByRole('textbox', { name: label }).should(
            'have.value',
            expectedEnrollmentContact.email,
          );
        } else {
          cy.findByRole('textbox', { name: label }).should('have.value', value);
        }
      });
    });

    it('should allow user to clear their details', () => {
      onPublicEnrollmentContactPage.clearExistingDetails();

      // Contacting same examiner again should now be possible
      onPublicGoodAndSatisfactoryLevelPage.contactExaminer('Anneli Alanen');
      onPublicEnrollmentContactPage.expectStepHeading('Yhteystietosi');
      // Expect all fields to be empty
      contactDetailsFields.forEach(({ label }) => {
        cy.findByRole('textbox', { name: label }).should('be.empty');
      });
    });
  });
});
