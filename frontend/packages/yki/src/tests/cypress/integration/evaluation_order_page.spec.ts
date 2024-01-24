import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import { onEvaluationOrderPage } from 'tests/cypress/support/page-objects/evaluationOrderPage';
import { findDialogByText } from 'tests/cypress/support/utils/dialog';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { SerializationUtils } from 'utils/serialization';

const evaluationPeriod: EvaluationPeriod =
  SerializationUtils.deserializeEvaluationPeriodResponse(
    evaluationPeriods.evaluation_periods[0]
  );

const assertDialogWithError = (error: string) =>
  findDialogByText('Tiedoissa on korjattavaa!').should('contain', error);

const closeDialog = () =>
  findDialogByText('Tiedoissa on korjattavaa!')
    .findByRole('button', { name: /Takaisin/i })
    .click();

const expectErrorOnSubmit = (error: string) => {
  onEvaluationOrderPage.submitOrder();
  assertDialogWithError(error);
  closeDialog();
};

describe('EvaluationOrderPage', () => {
  beforeEach(() => {
    cy.openEvaluationOrderPage(evaluationPeriod.id);
  });

  it('is visible', () => {
    onEvaluationOrderPage.isVisible();
  });

  it('allows submitting a reassessment order', () => {
    expectErrorOnSubmit('Valitse vähintään yksi osakoe');
    onEvaluationOrderPage.toggleExaminationPart('Tekstin ymmärtäminen 100 €');
    onEvaluationOrderPage.toggleExaminationPart('Puhuminen 100 €');
    onEvaluationOrderPage.expectReassessmentFee(200);

    const participantDetails = [
      ['Etunimet', 'Tero Teuvo'],
      ['Sukunimi', 'Testaaja'],
      ['Syntymäaika', '1.10.1990'],
      ['Sähköpostiosoite', 'foo@bar.fi'],
    ];
    participantDetails.forEach(([field, value]) => {
      expectErrorOnSubmit(field);
      onEvaluationOrderPage.fillParticipantDetails(`${field} *`, value);
    });

    expectErrorOnSubmit('Hyväksy henkilötietojen käsittelyn ehdot');
    onEvaluationOrderPage.acceptTermsOfProcessingOfPersonalData();

    onEvaluationOrderPage.submitOrder();
    cy.isOnPage(evaluationOrderPostResponse.redirect);
  });
});
