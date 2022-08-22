import { APIEndpoints } from 'enums/api';
import {
  compulsoryLangs,
  onPublicTranslatorFilters,
} from 'tests/cypress/support/page-objects/publicTranslatorFilters';
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
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (50)');
    onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
    onPublicTranslatorsListing.expectTranslatorsCount(27);

    onPublicTranslatorFilters.filterByTown('Helsinki');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (2)');
    onPublicTranslatorsListing.expectTranslatorsCount(2);

    onPublicTranslatorFilters.filterByName('aaltonen a');
    onPublicTranslatorsListing.expectTranslatorsCount(1);
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (1)');
  });

  it('should return results only with the exact town name when filtering by town name', () => {
    onPublicTranslatorFilters.filterByTown('Kemi');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (1)');
    onPublicTranslatorsListing.expectTranslatorsCount(1);

    onPublicTranslatorFilters.filterByTown('Kemiö');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (1)');
    onPublicTranslatorsListing.expectTranslatorsCount(1);
  });

  it('should clear filters and listed translators when the reset button is clicked', () => {
    onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (27)');
    onPublicTranslatorsListing.expectTranslatorsCount(27);

    onPublicTranslatorFilters.emptySearch();
    onPublicTranslatorsListing.expectEmptyListing();
  });

  it('it should provide only compulsory languages as toLang options if the fromLang field has a different value', () => {
    onPublicTranslatorFilters.selectFromLangByName('viro');
    onPublicTranslatorFilters.expectToLangSelectValues(compulsoryLangs);
  });

  it('it should provide only compulsory languages as fromLang options if the toLang field has a different value', () => {
    onPublicTranslatorFilters.selectToLangByName('viro');
    onPublicTranslatorFilters.expectFromLangSelectValues(compulsoryLangs);
  });

  it('it should show a toast notification when language pair is not defined, and a row is clicked', () => {
    onPublicTranslatorFilters.filterByName('aaltonen anneli');
    onPublicTranslatorsListing.clickTranslatorRow('1940');

    onToast.expectText('Valitse kielipari ottaaksesi yhteyttä kääntäjään');
  });

  it('it should show a toast notification when language pair is defined, a translator is selected, and user tries to change from lang', () => {
    onPublicTranslatorFilters.filterByLanguagePair('suomi', 'ruotsi');
    onPublicTranslatorsListing.clickTranslatorRow('1940');
    onPublicTranslatorFilters.clickFromLang();

    onToast.expectText('Voit valita vain yhden kieliparin yhteydenottoon');
  });

  it('it should enable / disable search button correctly', () => {
    onPublicTranslatorFilters.expectSearchButtonTo('be.enabled');
    onPublicTranslatorFilters.selectFromLangByName('suomi');
    onPublicTranslatorFilters.expectSearchButtonTo('be.enabled');
    onPublicTranslatorFilters.emptySearch();
    onPublicTranslatorFilters.expectSearchButtonTo('be.enabled');
    onPublicTranslatorFilters.fillOutName('aaltonen a');
    onPublicTranslatorFilters.expectSearchButtonTo('be.enabled');
    onPublicTranslatorFilters.search();
    onPublicTranslatorFilters.expectSearchButtonTo('be.disabled');
    onPublicTranslatorFilters.fillOutTown('Helsinki');
    onPublicTranslatorFilters.expectSearchButtonTo('be.enabled');
    onPublicTranslatorFilters.enterKeyOnTown();
    onPublicTranslatorFilters.expectSearchButtonTo('be.disabled');
  });
});
