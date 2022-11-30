import { AppRoutes } from 'enums/app';
import { onClerkCreateEventPage } from 'tests/cypress/support/page-objects/clerkCreateExamEventPage';
import dayjs from 'dayjs';

const daysInFuture = 7;
const dayFormat = 'DD.MM.YYYY';

describe('ClerkCreateExamEventPage', () => {
  beforeEach(() => {
    cy.openClerkCreateExamEventPage();
  });

  it('should enable save when valid form is inputted', () => {
    const examDate = dayjs().add(daysInFuture, 'day');
    const closesDate = examDate.subtract(2, 'day');

    onClerkCreateEventPage.inputLanguageAndLevel('Suomi, Erinomainen');
    onClerkCreateEventPage.inputExamDate(examDate.format(dayFormat));
    onClerkCreateEventPage.inputRegistrationClosesDate(closesDate.format(dayFormat));
    onClerkCreateEventPage.saveButtonEnabledIs(false);
    onClerkCreateEventPage.inputMaxParticipants(20);
    onClerkCreateEventPage.clickIsHiddenToggle();
    onClerkCreateEventPage.saveButtonEnabledIs(true);
  });

  it('should allow navigating back to clerk homepage', () => {
    onClerkCreateEventPage.clickBackButton();
    cy.isOnPage(AppRoutes.ClerkHomePage);
  });
});
