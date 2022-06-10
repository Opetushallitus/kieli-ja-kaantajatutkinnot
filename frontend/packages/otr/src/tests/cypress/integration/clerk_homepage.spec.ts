import dayjs from 'dayjs';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { useFixedDate } from 'tests/cypress/support/utils/date';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';

const fixedDateForTests = dayjs('2022-06-10T16:00:00+0200');

beforeEach(() => {
  cy.openClerkHomePage();
  useFixedDate(fixedDateForTests);
});

describe('ClerkHomePage', () => {
  it('should allow filtering interpreters by qualification status', () => {
    onClerkHomePage.expectFilteredInterpretersCount(clerkInterpreters10.length);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expiring);
    onClerkHomePage.expectFilteredInterpretersCount(0);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expired);
    onClerkHomePage.expectFilteredInterpretersCount(0);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Effective);
    onClerkHomePage.expectFilteredInterpretersCount(clerkInterpreters10.length);
  });
});
