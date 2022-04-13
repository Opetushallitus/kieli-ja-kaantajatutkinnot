import { useEffect, useState } from 'react';

import { ComboBox, valueAsOption } from 'components/elements/ComboBox';
import { CustomTextField } from 'components/elements/CustomTextField';
import {
  LanguageSelect,
  languageToComboBoxOption,
} from 'components/elements/LanguageSelect';
import { H3 } from 'components/elements/Text';
import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PermissionToPublish, TextFieldVariant } from 'enums/app';
import { useDebounce } from 'hooks/useDebounce';
import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';
import { AutocompleteValue } from 'interfaces/components/combobox';
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
