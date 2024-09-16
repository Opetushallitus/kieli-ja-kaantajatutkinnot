import { APIEndpoints } from 'enums/api';
import { onPublicTranslatorFilters } from 'tests/cypress/support/page-objects/publicTranslatorFilters';
import { onPublicTranslatorsListing } from 'tests/cypress/support/page-objects/publicTranslatorsListing';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { runWithIntercept } from 'tests/cypress/support/utils/api';

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.PublicTranslator,
    { fixture: 'public_translators_50.json' },
    () => cy.openPublicHomePage(),
  );
});

describe('PublicTranslatorFilters', () => {
  const isPhone = false;
  it('should allow filtering results by language pair, name and town', () => {
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (50)');
    onPublicTranslatorFilters.filterByLanguagePair(isPhone, 'suomi', 'ruotsi');
    onPublicTranslatorsListing.expectTranslatorsCount(25);

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

  it('should return results only with or without country name when filtering by town name', () => {
    onPublicTranslatorFilters.filterByTown('Luxembourg');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (1)');
    onPublicTranslatorsListing.expectTranslatorsCount(1);

    onPublicTranslatorFilters.filterByTown('Luxembourg (Luxemburg)');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (1)');
    onPublicTranslatorsListing.expectTranslatorsCount(1);
  });

  it('should clear filters and listed translators when the reset button is clicked', () => {
    onPublicTranslatorFilters.filterByLanguagePair(isPhone, 'suomi', 'ruotsi');
    onPublicTranslatorFilters.expectSearchButtonText('Näytä tulokset (25)');
    onPublicTranslatorsListing.expectTranslatorsCount(25);

    onPublicTranslatorFilters.emptySearch();
    onPublicTranslatorsListing.expectEmptyListing();
  });

  it('it should provide all other languages under langs.to as toLang options if fromLang is a primary language', () => {
    onPublicTranslatorFilters.selectFromLangByName(isPhone, 'ruotsi');

    const selectableLangs = [
      'suomi',
      'koltansaame',
      'italia',
      'ranska',
      'saksa',
      'venäjä',
      'viro',
    ];
    onPublicTranslatorFilters.expectToLangSelectValues(selectableLangs);
  });

  it('it should provide only primary languages under langs.to as toLang options if fromLang is a secondary language', () => {
    onPublicTranslatorFilters.selectFromLangByName(isPhone, 'saksa');

    const selectableLangs = ['suomi', 'ruotsi', 'koltansaame'];
    onPublicTranslatorFilters.expectToLangSelectValues(selectableLangs);
  });

  it('it should provide all other languages under langs.from as fromLang options if toLang is a primary language', () => {
    onPublicTranslatorFilters.selectToLangByName(isPhone, 'suomi');

    const selectableLangs = [
      'ruotsi',
      'inarinsaame',
      'pohjoissaame',
      'ranska',
      'saksa',
      'venäjä',
      'viro',
    ];
    onPublicTranslatorFilters.expectFromLangSelectValues(selectableLangs);
  });

  it('it should provide only primary languages under langs.from as fromLang options if toLang is a secondary language', () => {
    onPublicTranslatorFilters.selectToLangByName(isPhone, 'viro');

    const selectableLangs = ['suomi', 'ruotsi', 'inarinsaame', 'pohjoissaame'];
    onPublicTranslatorFilters.expectFromLangSelectValues(selectableLangs);
  });

  it('it should show a toast notification when language pair is not defined, and a row is clicked', () => {
    onPublicTranslatorFilters.filterByName('aaltonen anneli');
    onPublicTranslatorsListing.clickTranslatorRow('1940');

    onToast.expectText('Valitse kielipari ottaaksesi yhteyttä kääntäjään');
  });

  it('it should show a toast notification when language pair is defined, a translator is selected, and user tries to change from lang', () => {
    onPublicTranslatorFilters.filterByLanguagePair(isPhone, 'suomi', 'ruotsi');
    onPublicTranslatorsListing.clickTranslatorRow('1940');
    const force = true;
    onPublicTranslatorFilters.clickFromLang(force);
    onToast.expectText('Voit valita vain yhden kieliparin yhteydenottoon');
  });

  it('it should enable / disable search button correctly', () => {
    onPublicTranslatorFilters.expectSearchButtonTo('be.enabled');
    onPublicTranslatorFilters.selectFromLangByName(isPhone, 'suomi');
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
