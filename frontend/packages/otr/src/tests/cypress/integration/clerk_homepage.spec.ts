import dayjs from 'dayjs';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { useFixedDate } from 'tests/cypress/support/utils/date';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';

const fixedDateForTests = dayjs('2022-06-10T16:00:00+0200');

beforeEach(() => {
  cy.openClerkHomePage();
  useFixedDate(fixedDateForTests);
  onClerkHomePage.expectFilteredInterpretersCount(clerkInterpreters10.length);
});

describe('ClerkHomePage', () => {
  it('should allow filtering interpreters by qualification status', () => {
    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expiring);
    onClerkHomePage.expectFilteredInterpretersCount(1);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expired);
    onClerkHomePage.expectFilteredInterpretersCount(1);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Effective);
    onClerkHomePage.expectFilteredInterpretersCount(clerkInterpreters10.length);
  });

  it('should allow filtering interpreters on the basis of different qualification criteria', () => {
    onClerkHomePage.filterByPermissionToPublish(false);
    onClerkHomePage.expectFilteredInterpretersCount(1);

    onClerkHomePage.filterByPermissionToPublish(true);
    onClerkHomePage.expectFilteredInterpretersCount(9);

    onClerkHomePage.filterByExaminationType(ExaminationType.Other);
    onClerkHomePage.expectFilteredInterpretersCount(3);

    onClerkHomePage.filterByExaminationType(
      ExaminationType.LegalInterpreterExam
    );
    onClerkHomePage.expectFilteredInterpretersCount(6);

    onClerkHomePage.filterByFromLanguage('suomi');
    onClerkHomePage.expectFilteredInterpretersCount(6);

    onClerkHomePage.filterByToLanguage('tanska');
    onClerkHomePage.expectFilteredInterpretersCount(1);
  });
});
