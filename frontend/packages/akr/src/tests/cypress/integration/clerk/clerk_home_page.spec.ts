import { APIEndpoints } from 'enums/api';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import { runWithIntercept } from 'tests/cypress/support/utils/api';

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.ClerkTranslator,
    { fixture: 'clerk_translators_10.json' },
    () => cy.openClerkHomePage()
  );
});

const translatorCountsByAuthorisationStatuses = {
  [AuthorisationStatus.Effective]: 6,
  [AuthorisationStatus.Expiring]: 5,
  [AuthorisationStatus.Expired]: 8,
  [AuthorisationStatus.ExpiredDeduplicated]: 8,
  [AuthorisationStatus.FormerVir]: 2,
};

describe('ClerkHomePage', () => {
  it('should display correct number of translators in header', () => {
    onClerkHomePage.expectTotalTranslatorsCount(10);
  });

  it('should filter translators by authorisation status', () => {
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Effective]
    );

    onClerkHomePage.filterByAuthorisationStatus(AuthorisationStatus.Expiring);
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Expiring]
    );

    onClerkHomePage.filterByAuthorisationStatus(
      AuthorisationStatus.ExpiredDeduplicated
    );
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[
        AuthorisationStatus.ExpiredDeduplicated
      ]
    );

    onClerkHomePage.filterByAuthorisationStatus(AuthorisationStatus.FormerVir);
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.FormerVir]
    );

    onClerkHomePage.filterByAuthorisationStatus(AuthorisationStatus.Effective);
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Effective]
    );
  });

  it('should show selected translators count per authorisation status', () => {
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Effective]
    );
    onClerkHomePage.selectTranslatorById('1140');
    onClerkHomePage.selectTranslatorById('3496');

    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Effective],
      2
    );
  });

  it('should reset selected translators when authorisation status changes', () => {
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Effective]
    );
    onClerkHomePage.selectTranslatorById('1140');
    onClerkHomePage.selectTranslatorById('3496');
    onClerkHomePage.filterByAuthorisationStatus(AuthorisationStatus.Expiring);

    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Expiring],
      0
    );
  });

  it('should filter translators by from lang', () => {
    onClerkHomePage.filterByFromLang('ruotsi');
    onClerkHomePage.expectSelectedTranslatorsCount(1); // 1 effective
  });

  it('should filter translators by to lang', () => {
    onClerkHomePage.filterByToLang('japani');
    onClerkHomePage.expectSelectedTranslatorsCount(2); // 2 effective
  });

  it('should filter translators by name', () => {
    onClerkHomePage.filterByName('tonen Anna');
    onClerkHomePage.expectSelectedTranslatorsCount(3); // 3 effective
  });

  it('should filter translators by authorisation basis', () => {
    onClerkHomePage.filterByAuthorisationBasis('VIR');
    onClerkHomePage.expectSelectedTranslatorsCount(1); // 1 effective

    // Authorisation with basis VIR should never expire => expect 0 matching translators
    onClerkHomePage.filterByAuthorisationStatus(AuthorisationStatus.Expiring);
    onClerkHomePage.expectSelectedTranslatorsCount(0);
  });

  it('should filter translators by permission to publish', () => {
    onClerkHomePage.filterByPermissionToPublishBasis(false);
    onClerkHomePage.expectSelectedTranslatorsCount(0);
  });

  it('should combine multiple filters', () => {
    onClerkHomePage.filterByAuthorisationStatus(
      AuthorisationStatus.ExpiredDeduplicated
    );
    onClerkHomePage.filterByFromLang('suomi');
    onClerkHomePage.expectSelectedTranslatorsCount(4);

    onClerkHomePage.filterByAuthorisationBasis('KKT');
    onClerkHomePage.expectSelectedTranslatorsCount(1); // Anna Aaltonen, id: 1140

    onClerkHomePage.filterByToLang('ruotsi');
    onClerkHomePage.expectSelectedTranslatorsCount(1);

    onClerkHomePage.filterByName('Kari');
    onClerkHomePage.expectSelectedTranslatorsCount(0);
  });

  it('should reset all filters when empty selections is clicked ', () => {
    onClerkHomePage.filterByAuthorisationStatus(
      AuthorisationStatus.ExpiredDeduplicated
    );
    onClerkHomePage.filterByFromLang('suomi');
    onClerkHomePage.filterByToLang('ruotsi');
    onClerkHomePage.filterByName('Anna');
    onClerkHomePage.filterByAuthorisationBasis('KKT');
    onClerkHomePage.filterByPermissionToPublishBasis(true);
    onClerkHomePage.selectTranslatorById('1140');

    onClerkHomePage.expectSelectedTranslatorsCount(1, 1);

    onClerkHomePage.resetFilters();
    onClerkHomePage.expectSelectedTranslatorsCount(
      translatorCountsByAuthorisationStatuses[AuthorisationStatus.Effective]
    );
    onClerkHomePage.expectEmptyFilters();
  });
});
