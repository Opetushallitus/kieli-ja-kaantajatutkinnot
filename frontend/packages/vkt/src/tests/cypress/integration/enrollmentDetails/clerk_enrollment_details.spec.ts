import { EnrollmentStatus } from 'enums/app';
import { onClerkEnrollmentOverviewPage } from 'tests/cypress/support/page-objects/clerkEnrollmentOverviewPage';
import { onClerkExamEventOverviewPage } from 'tests/cypress/support/page-objects/clerkExamEventOverviewPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { clerkExamEvent } from 'tests/msw/fixtures/clerkExamEvent';

describe('ClerkEnrollmentOverview:ClerkEnrollmentDetails', () => {
  const nameFields = ['firstName', 'lastName'];
  const contactDetailsFields = ['email', 'phoneNumber'];
  const contactDetailsValues = ['test@test.invalid', '358401234567'];
  const addressFields = ['street', 'postalCode', 'town', 'country'];
  const partialsExamsAndSkillsFields = [
    'oralSkill',
    'textualSkill',
    'understandingSkill',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
    'writingPartialExam',
    'readingComprehensionPartialExam',
  ];
  const checkboxFields = [
    ...partialsExamsAndSkillsFields,
    //'digitalCertificateConsent',
  ];

  beforeEach(() => {
    cy.openClerkExamEventPage(clerkExamEvent.id);
  });

  it('should show disabled enrollment details', () => {
    onClerkExamEventOverviewPage.clickEnrollmentRow(2);

    const displayedTextFields = [
      ...nameFields,
      ...contactDetailsFields,
      'previousEnrollment',
    ];

    displayedTextFields.forEach((f) =>
      onClerkEnrollmentOverviewPage.expectTextFieldDisabled(f)
    );

    addressFields.forEach((f) =>
      onClerkEnrollmentOverviewPage.expectTextFieldNotToExist(f)
    );

    onClerkEnrollmentOverviewPage.expectTextFieldValue('firstName', 'Hanna');
    onClerkEnrollmentOverviewPage.expectTextFieldValue('lastName', 'Eskola');
    onClerkEnrollmentOverviewPage.expectTextFieldValue(
      'email',
      'person2@example.invalid'
    );
    onClerkEnrollmentOverviewPage.expectTextFieldValue(
      'phoneNumber',
      '+358401000002'
    );
    onClerkEnrollmentOverviewPage.expectTextFieldValue(
      'previousEnrollment',
      ''
    );

    const checkedCheckBoxFields = [
      'oralSkill',
      'textualSkill',
      'understandingSkill',
      'writingPartialExam',
      'speakingPartialExam',
      'speechComprehensionPartialExam',
      'readingComprehensionPartialExam',
      //'digitalCertificateConsent', TODO: when available
    ];

    checkboxFields.forEach((f) => {
      onClerkEnrollmentOverviewPage.expectCheckboxFieldDisabled(f);

      checkedCheckBoxFields.includes(f)
        ? onClerkEnrollmentOverviewPage.expectCheckboxFieldChecked(f)
        : onClerkEnrollmentOverviewPage.expectCheckboxFieldNotChecked(f);
    });
  });

  it('should allow modifying enrollment details', () => {
    onClerkExamEventOverviewPage.clickEnrollmentRow(1);
    onClerkEnrollmentOverviewPage.clickEditButton();

    nameFields.forEach((f) =>
      onClerkEnrollmentOverviewPage.expectTextFieldDisabled(f)
    );
    contactDetailsFields.forEach((f, idx) =>
      onClerkEnrollmentOverviewPage.editTextField(f, contactDetailsValues[idx])
    );
    onClerkEnrollmentOverviewPage.editTextField(
      'previousEnrollment',
      'tammikuussa 2023'
    );

    // Remove skill and partial exam selections
    onClerkEnrollmentOverviewPage.clickCheckBox('textualSkill');
    onClerkEnrollmentOverviewPage.clickCheckBox('understandingSkill');
    onClerkEnrollmentOverviewPage.expectDisabledSaveButton();

    // Select some skills and partial exams
    onClerkEnrollmentOverviewPage.clickCheckBox('oralSkill');
    onClerkEnrollmentOverviewPage.clickCheckBox('understandingSkill');
    onClerkEnrollmentOverviewPage.clickCheckBox('speakingPartialExam');
    onClerkEnrollmentOverviewPage.clickCheckBox(
      'readingComprehensionPartialExam'
    );

    //onClerkEnrollmentOverviewPage.clickCheckBox('digitalCertificateConsent');
    onClerkEnrollmentOverviewPage.expectDisabledSaveButton();
    addressFields.forEach((f) =>
      onClerkEnrollmentOverviewPage.editTextField(f, `test-${f}`)
    );
    onClerkEnrollmentOverviewPage.expectEnabledSaveButton();
  });

  it('should allow canceling enrollment', () => {
    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 1'
    );
    onClerkExamEventOverviewPage.clickEnrollmentRow(1);
    onClerkEnrollmentOverviewPage.clickCancelEnrollmentButton();
    onDialog.expectText('Haluatko varmasti peruuttaa ilmoittautumisen?');
    onDialog.clickButtonByText('Kyllä');
    onToast.expectText('Ilmoittautuminen peruutettiin');
    onClerkEnrollmentOverviewPage.expectDisabledCancelEnrollmentButton();
    cy.go('back');

    onClerkExamEventOverviewPage.expectEnrollmentListHeaderToHaveText(
      EnrollmentStatus.CANCELED,
      'Peruutetut: 2'
    );
  });

  it('should show disabled cancel enrollment button on already cancelled enrollment', () => {
    onClerkExamEventOverviewPage.clickEnrollmentRow(9);
    onClerkEnrollmentOverviewPage.expectDisabledCancelEnrollmentButton();
  });
  it('should refund payment', () => {
    onClerkExamEventOverviewPage.clickEnrollmentRow(1);
    onClerkEnrollmentOverviewPage.clickSetRefundedPaymentButton();
    onClerkEnrollmentOverviewPage.expectRefundedAtDate(
      'Merkitty palautetuksi: 04.08.2023 12:56'
    );
  });
});
