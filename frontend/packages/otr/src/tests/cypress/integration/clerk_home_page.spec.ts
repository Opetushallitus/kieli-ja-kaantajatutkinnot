import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';

describe('ClerkHomePage', () => {
  beforeEach(() => {
    cy.openClerkHomePage();
    onClerkHomePage.expectFilteredInterpretersCount(clerkInterpreters10.length);
  });

  it('should allow filtering interpreters by qualification status', () => {
    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expiring);
    onClerkHomePage.expectFilteredInterpretersCount(1);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expired);
    onClerkHomePage.expectFilteredInterpretersCount(1);

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Effective);
    onClerkHomePage.expectFilteredInterpretersCount(clerkInterpreters10.length);
  });

  it('should allow filtering interpreters on the basis of different qualification criteria', () => {
    onClerkHomePage.filterByPermissionToPublish(true);
    onClerkHomePage.expectFilteredInterpretersCount(9);

    onClerkHomePage.filterByExaminationType(ExaminationType.EAT);
    onClerkHomePage.expectFilteredInterpretersCount(6);

    onClerkHomePage.filterByToLanguage('tanska');
    onClerkHomePage.expectFilteredInterpretersCount(1);
  });
});
