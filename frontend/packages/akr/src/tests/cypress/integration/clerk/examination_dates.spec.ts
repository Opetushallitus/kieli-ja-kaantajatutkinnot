import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints, APIError } from 'enums/api';
import { ExaminationDateStatus } from 'enums/examinationDate';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onExaminationDatesPage } from 'tests/cypress/support/page-objects/examinationDatesPage';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { createAPIErrorResponse } from 'tests/cypress/support/utils/api';

let examinationDates;
const examinationDateToAdd = {
  id: 11,
  version: 0,
  date: '2030-10-04',
};

const examinationDateToDelete = {
  id: 5,
  dateLabel: '18.11.2021',
};

beforeEach(() => {
  cy.fixture('examination_dates_10.json').then((dates) => {
    examinationDates = dates;
    cy.intercept('GET', APIEndpoints.ExaminationDate, examinationDates);
  });

  cy.openExaminationDatesPage();
});

describe('ExaminationDatesPage', () => {
  it('should display correct number of examination dates in header', () => {
    onExaminationDatesPage.expectTotalExaminationDatesCount(10);
  });

  it('should filter examination dates by status', () => {
    // Use fixed date in tests as the as the status filters depend on it
    onExaminationDatesPage.expectSelectedExaminationDatesCount(4);

    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Passed);
    onExaminationDatesPage.expectSelectedExaminationDatesCount(6);

    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Upcoming);
    onExaminationDatesPage.expectSelectedExaminationDatesCount(4);
  });

  it('should order upcoming examination dates by ascending date', () => {
    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Upcoming);

    onExaminationDatesPage.expectRowToContain(0, '14.05.2022');
    onExaminationDatesPage.expectRowToContain(1, '25.09.2022');
  });

  it('should order passed examination dates by descending date', () => {
    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Passed);

    onExaminationDatesPage.expectRowToContain(0, '1.01.2022');
    onExaminationDatesPage.expectRowToContain(1, '18.11.2021');
  });

  it('should let user to add a new, unique examination date', () => {
    onExaminationDatesPage.expectTotalExaminationDatesCount(10);
    onExaminationDatesPage.expectAddButtonDisabled();

    cy.intercept('GET', APIEndpoints.ExaminationDate, [
      ...examinationDates,
      examinationDateToAdd,
    ]);
    onExaminationDatesPage.setDateForNewExaminationDate('04.10.2030');

    cy.intercept('POST', APIEndpoints.ExaminationDate, examinationDateToAdd).as(
      'create',
    );
    onExaminationDatesPage.clickAddButton();
    cy.wait('@create');

    onExaminationDatesPage.expectTotalExaminationDatesCount(11);
    onToast.expectText('Tutkintopäivän 04.10.2030 lisäys onnistui');
  });

  it('should not add duplicate examination dates', () => {
    onExaminationDatesPage.setDateForNewExaminationDate('01.01.2022');
    onExaminationDatesPage.expectAddButtonDisabled();
  });

  it('should show a generic API error toast when trying to add a examination date', () => {
    onExaminationDatesPage.setDateForNewExaminationDate('04.10.2030');

    cy.intercept('POST', APIEndpoints.ExaminationDate, {
      statusCode: HTTPStatusCode.InternalServerError,
      body: {},
    }).as('createWithError');
    onExaminationDatesPage.clickAddButton();
    cy.wait('@createWithError');

    onExaminationDatesPage.expectTotalExaminationDatesCount(10);
    onToast.expectText('Toiminto epäonnistui, yritä myöhemmin uudelleen');
  });

  it('should open a confirmation dialog when row delete icon is clicked, and do no changes if user backs out', () => {
    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Passed);
    onExaminationDatesPage.deleteExaminationDate(examinationDateToDelete.dateLabel);

    onDialog.expectText('Haluatko varmasti poistaa tutkintopäivän?');
    onDialog.clickButtonByText('Takaisin');

    onExaminationDatesPage.expectTotalExaminationDatesCount(10);
  });

  it('should open a confirmation dialog when row delete icon is clicked, and delete the selected examination date if user confirms', () => {
    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Passed);
    onExaminationDatesPage.deleteExaminationDate(
      examinationDateToDelete.dateLabel,
    );

    cy.intercept(
      'DELETE',
      `${APIEndpoints.ExaminationDate}/${examinationDateToDelete.id}`,
      {},
    ).as('deleteExamDate');
    const newExaminationDates = examinationDates.filter(
      (m) => m.id !== examinationDateToDelete.id,
    );
    cy.intercept('GET', APIEndpoints.ExaminationDate, [
      ...newExaminationDates,
    ]).as('examDatesReload');

    onDialog.clickButtonByText('Kyllä');
    cy.wait('@deleteExamDate');
    cy.wait('@examDatesReload');

    onExaminationDatesPage.expectRowToContain(0, '01.01.2022');
    onExaminationDatesPage.expectRowToContain(1, '15.08.2021');
    onExaminationDatesPage.expectTotalExaminationDatesCount(9);
    onExaminationDatesPage.expectSelectedExaminationDatesCount(5);

    onToast.expectText(
      `Tutkintopäivä ${examinationDateToDelete.dateLabel} poistettu`,
    );
  });

  it('should show an error toast if examination date is chosen to be deleted, but an API error occurs', () => {
    onExaminationDatesPage.filterByStatus(ExaminationDateStatus.Passed);
    onExaminationDatesPage.deleteExaminationDate(
      examinationDateToDelete.dateLabel,
    );

    cy.intercept(
      'DELETE',
      `${APIEndpoints.ExaminationDate}/${examinationDateToDelete.id}`,
      createAPIErrorResponse(APIError.ExaminationDateDeleteHasAuthorisations),
    ).as('deleteWithError');
    onDialog.clickButtonByText('Kyllä');
    cy.wait('@deleteWithError');

    onExaminationDatesPage.expectTotalExaminationDatesCount(10);
    onToast.expectText(
      'Tutkintopäivän poisto epäonnistui, koska sille on kirjattu auktorisointeja',
    );
  });
});
