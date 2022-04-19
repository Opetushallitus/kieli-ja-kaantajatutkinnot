import { APIEndpoints } from 'enums/api';
import { onPublicTranslatorFilters } from 'tests/cypress/support/page-objects/publicTranslatorFilters';
import { onPublicTranslatorsListing } from 'tests/cypress/support/page-objects/publicTranslatorsListing';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { runWithIntercept } from 'tests/cypress/support/utils/api';

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.PublicTranslator,
    { fixture: 'public_translators_50.json' },
    () => cy.openPublicHomePage()
  );
});

describe('PublicTranslatorFilters', () => {
  it('should allow filtering results by language pair, name and town', () => {
    onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
    onPublicTranslatorsListing.expectTranslatorsCount(27);

    onPublicTranslatorFilters.filterByTown('Helsinki');
    onPublicTranslatorsListing.expectTranslatorsCount(2);

    onPublicTranslatorFilters.filterByName('aaltonen a');
    onPublicTranslatorsListing.expectTranslatorsCount(1);
  });

  it('should clear filters and listed translators when the reset button is clicked', () => {
    onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
    onPublicTranslatorsListing.expectTranslatorsCount(27);

    onPublicTranslatorFilters.emptySearch();
    onPublicTranslatorsListing.expectEmptyListing();
  });
});

describe('PublicTranslatorListing', () => {
  it('it should show a toast notification when language pairs are not defined, and a row is clicked', () => {
    onPublicTranslatorFilters.filterByName('aaltonen anneli');
    onPublicTranslatorsListing.clickTranslatorRow('1940');

    onToast.expectText('Valitse kielipari');
  });
});
