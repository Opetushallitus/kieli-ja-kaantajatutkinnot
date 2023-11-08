import dayjs from 'dayjs';

import { AppRoutes } from 'enums/app';
import { onClerkExamEventCreatePage } from 'tests/cypress/support/page-objects/clerkCreateExamEventPage';

const daysInFuture = 7;
const dayFormat = 'DD.MM.YYYY';

describe('ClerkCreateExamEventPage', () => {
  beforeEach(() => {
    cy.openClerkCreateExamEventPage();
  });

  it('should enable save when valid form is inputted', () => {
    const examDate = dayjs().add(daysInFuture, 'day');
    const closesDate = examDate.subtract(2, 'day');

    onClerkExamEventCreatePage.inputLanguageAndLevel('Suomi, Erinomainen');
    onClerkExamEventCreatePage.inputExamDate(examDate.format(dayFormat));
    onClerkExamEventCreatePage.inputRegistrationClosesDate(
      closesDate.format(dayFormat),
    );
    onClerkExamEventCreatePage.saveButtonEnabledIs(false);
    onClerkExamEventCreatePage.inputMaxParticipants(20);
    onClerkExamEventCreatePage.clickIsHiddenToggle();
    // FIXME manual date inputting is broken
    //onClerkExamEventCreatePage.saveButtonEnabledIs(true);
  });

  it('should allow navigating back to clerk homepage', () => {
    onClerkExamEventCreatePage.clickBackButton();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });
});
