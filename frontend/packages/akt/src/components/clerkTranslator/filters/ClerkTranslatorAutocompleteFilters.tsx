import { useEffect, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomTextField,
  H3,
  LanguageSelect,
  languageToComboBoxOption,
  valueAsOption,
} from 'shared/components';
import { TextFieldVariant } from 'shared/enums';
import { useDebounce } from 'shared/hooks';

import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PermissionToPublish } from 'enums/app';
import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';
import { setClerkTranslatorFilters } from 'redux/actions/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorAutocompleteFilters = () => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();
  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;

  // Redux
  const dispatch = useAppDispatch();
  const { filters, langs } = useAppSelector(clerkTranslatorsSelector);

  // LocalState
  const [name, setName] = useState(() => filters.name ?? '');
  const debounce = useDebounce(300);

  useEffect(() => {
    debounce(() => {
      dispatch(
        setClerkTranslatorFilters({
          name,
        })
      );
    });
  }, [debounce, dispatch, name]);

  useEffect(() => {
    if (filters.name === undefined) {
      setName('');
    }
  }, [filters.name]);

  const handleFilterChange =
    (filter: keyof ClerkTranslatorFilter) =>
    ({}, value: AutocompleteValue) => {
      dispatch(setClerkTranslatorFilters({ [filter]: value?.value }));
    };

  return (
    <div className="clerk-translator-autocomplete-filters columns gapped">
      <div className="rows gapped-xs">
        <H3>{t('languagePair.title')}</H3>
        <div className="columns gapped">
          <LanguageSelect
            autoHighlight
            data-testid="clerk-translator-filters__from-lang"
            label={t('languagePair.fromPlaceholder')}
            excludedLanguage={filters.toLang}
            value={getLanguageSelectValue(filters.fromLang)}
            languages={langs.from}
            variant={TextFieldVariant.Outlined}
            onChange={handleFilterChange('fromLang')}
            translateLanguage={translateLanguage}
          />
          <LanguageSelect
            autoHighlight
            data-testid="clerk-translator-filters__to-lang"
            label={t('languagePair.toPlaceholder')}
            excludedLanguage={filters.fromLang}
            value={getLanguageSelectValue(filters.toLang)}
            languages={langs.to}
            variant={TextFieldVariant.Outlined}
            onChange={handleFilterChange('toLang')}
            translateLanguage={translateLanguage}
          />
        </div>
      </div>
      <div className="rows gapped-xs">
        <H3>{t('name.title')}</H3>
        <CustomTextField
          data-testid="clerk-translator-filters__name"
          label={t('name.placeholder')}
          type="search"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="rows gapped-xs">
        <H3>{t('authorisationBasis.title')}</H3>
        <ComboBox
          autoHighlight
          data-testid="clerk-translator-filters__authorisation-basis"
          label={t('authorisationBasis.placeholder')}
          values={['AUT', 'KKT', 'VIR'].map(valueAsOption)}
          value={
            filters.authorisationBasis
              ? valueAsOption(filters.authorisationBasis)
              : null
          }
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('authorisationBasis')}
        />
      </div>
      <div className="rows gapped-xs">
        <H3>{t('permissionToPublish.title')}</H3>
        <ComboBox
          autoHighlight
          data-testid="clerk-translator-filters__permission-to-publish-basis"
          label={t('permissionToPublish.placeholder')}
          values={Object.values(PermissionToPublish).map(valueAsOption)}
          value={
            filters.permissionToPublish
              ? valueAsOption(filters.permissionToPublish)
              : null
          }
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('permissionToPublish')}
        />
      </div>
    </div>
  );
};
