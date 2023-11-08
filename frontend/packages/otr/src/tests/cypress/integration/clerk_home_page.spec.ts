import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';

beforeEach(() => {
  cy.openClerkHomePage();
});

const interpreterCountsByAuthorisationStatuses = {
  [QualificationStatus.Effective]: 8,
  [QualificationStatus.Expiring]: 0,
  [QualificationStatus.Expired]: 5,
  [QualificationStatus.ExpiredDeduplicated]: 5,
};

describe('ClerkHomePage', () => {
  it('should display correct number of translators in header', () => {
    onClerkHomePage.expectTotalInterpretersCount(10);
  });

  it('should allow filtering interpreters by qualification status', () => {
    onClerkHomePage.expectFilteredInterpretersCount(
      interpreterCountsByAuthorisationStatuses[QualificationStatus.Effective],
    );

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Expiring);
    onClerkHomePage.expectFilteredInterpretersCount(
      interpreterCountsByAuthorisationStatuses[QualificationStatus.Expiring],
    );

    onClerkHomePage.filterByQualificationStatus(
      QualificationStatus.ExpiredDeduplicated,
    );
    onClerkHomePage.expectFilteredInterpretersCount(
      interpreterCountsByAuthorisationStatuses[
        QualificationStatus.ExpiredDeduplicated
      ],
    );

    onClerkHomePage.filterByQualificationStatus(QualificationStatus.Effective);
    onClerkHomePage.expectFilteredInterpretersCount(
      interpreterCountsByAuthorisationStatuses[QualificationStatus.Effective],
    );
  });

  it('should filter interpreters by to lang', () => {
    onClerkHomePage.filterByToLang('saksa');
    onClerkHomePage.expectFilteredInterpretersCount(1); // 1 effective
  });

  it('should filter interpreters by name', () => {
    onClerkHomePage.filterByName('tonen Anneli');
    onClerkHomePage.expectFilteredInterpretersCount(1); // 1 effective
  });

  it('should filter interpreters by examination type', () => {
    onClerkHomePage.filterByExaminationType(ExaminationType.EAT);
    onClerkHomePage.expectFilteredInterpretersCount(6);
  });

  it('should filter interpreters by permission to publish', () => {
    onClerkHomePage.filterByPermissionToPublish(false);
    onClerkHomePage.expectFilteredInterpretersCount(0);
  });

  it('should combine multiple filters', () => {
    onClerkHomePage.filterByQualificationStatus(
      QualificationStatus.ExpiredDeduplicated,
    );
    onClerkHomePage.filterByToLang('englanti');
    onClerkHomePage.expectFilteredInterpretersCount(2);

    onClerkHomePage.filterByName('Juha Kallio');
    onClerkHomePage.expectFilteredInterpretersCount(1);

    onClerkHomePage.filterByExaminationType(ExaminationType.KKT);
    onClerkHomePage.expectFilteredInterpretersCount(0);
  });

  it('should reset all filters when empty selections is clicked ', () => {
    onClerkHomePage.filterByQualificationStatus(
      QualificationStatus.ExpiredDeduplicated,
    );
    onClerkHomePage.filterByToLang('englanti');
    onClerkHomePage.filterByName('Juha Kallio');
    onClerkHomePage.filterByExaminationType(ExaminationType.KKT);

    onClerkHomePage.resetFilters();

    onClerkHomePage.expectFilteredInterpretersCount(
      interpreterCountsByAuthorisationStatuses[QualificationStatus.Effective],
    );
    onClerkHomePage.expectEmptyFilters();
  });
});
