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
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PermissionToPublish } from 'enums/app';
import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';
import { addClerkTranslatorFilter } from 'redux/reducers/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorAutocompleteFilters = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();

  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;

  const dispatch = useAppDispatch();
  const { filters, langs } = useAppSelector(clerkTranslatorsSelector);

  const [name, setName] = useState(filters.name ?? '');
  const debounce = useDebounce(300);

  // Empty local state when redux state is reset
  useEffect(() => {
    if (!filters.name) setName('');
  }, [filters.name]);

  const handleNameChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setName(event.target.value);
    debounce(() => {
      dispatch(
        addClerkTranslatorFilter({
          name: event.target.value,
        })
      );
    });
  };

  const handleFilterChange =
    (filter: keyof ClerkTranslatorFilter) =>
    ({}, value: AutocompleteValue) => {
      dispatch(addClerkTranslatorFilter({ [filter]: value?.value }));
    };

  const getPermissionToPublishSelectValues = () =>
    Object.values(PermissionToPublish).map((v) => ({
      value: v,
      label: translateCommon(v),
    }));

  const getPermissionToPublishSelectValue = () =>
    filters.permissionToPublish
      ? {
          value: filters.permissionToPublish,
          label: translateCommon(filters.permissionToPublish),
        }
      : null;

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
          onChange={handleNameChange}
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
          values={getPermissionToPublishSelectValues()}
          value={getPermissionToPublishSelectValue()}
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('permissionToPublish')}
        />
      </div>
    </div>
  );
};
