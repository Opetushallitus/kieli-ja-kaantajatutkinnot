import { useEffect, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomTextField,
  H3,
  LanguageSelect,
  languageToComboBoxOption,
} from 'shared/components';
import { TextFieldVariant } from 'shared/enums';
import { useDebounce } from 'shared/hooks';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExaminationType, PermissionToPublish } from 'enums/interpreter';
import { ClerkInterpreterFilters } from 'interfaces/clerkInterpreter';
import { setClerkInterpreterFilters } from 'redux/reducers/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';

export const ClerkInterpreterAutocompleteFilters = () => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();
  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const { filters, qualificationLanguages } = useAppSelector(
    clerkInterpretersSelector
  );

  // LocalState
  const [name, setName] = useState(() => filters.name ?? '');
  const debounce = useDebounce(300);

  useEffect(() => {
    debounce(() => {
      dispatch(
        setClerkInterpreterFilters({
          name,
        })
      );
    });
  }, [debounce, dispatch, name]);

  const handleNameChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setName(event.target.value);
  };

  const handleFilterChange =
    (filter: keyof ClerkInterpreterFilters) =>
    ({}, value: AutocompleteValue) => {
      dispatch(setClerkInterpreterFilters({ [filter]: value?.value }));
    };

  const examinationTypeToOption = (examinationType: ExaminationType) => {
    switch (examinationType) {
      case ExaminationType.LegalInterpreterExam:
        return {
          label: translateCommon('examinationType.legalInterpreterExam'),
          value: ExaminationType.LegalInterpreterExam,
        };
      case ExaminationType.Other:
        return {
          label: translateCommon('examinationType.degreeStudies'),
          value: ExaminationType.Other,
        };
    }
  };

  const permissionToPublishToOption = (
    permissionToPublish: PermissionToPublish
  ) => {
    switch (permissionToPublish) {
      case PermissionToPublish.No:
        return {
          label: translateCommon('no'),
          value: PermissionToPublish.No,
        };
      case PermissionToPublish.Yes:
        return {
          label: translateCommon('yes'),
          value: PermissionToPublish.Yes,
        };
    }
  };

  return (
    <div className="clerk-interpreter-autocomplete-filters columns gapped">
      <div className="rows gapped-xs">
        <H3>{t('languagePair.title')}</H3>
        <div className="columns gapped">
          <LanguageSelect
            autoHighlight
            data-testid="clerk-interpreter-filters__from-lang"
            label={t('languagePair.fromPlaceholder')}
            excludedLanguage={filters.toLang}
            value={getLanguageSelectValue(filters.fromLang)}
            languages={qualificationLanguages}
            variant={TextFieldVariant.Outlined}
            onChange={handleFilterChange('fromLang')}
            translateLanguage={translateLanguage}
          />
          <LanguageSelect
            autoHighlight
            data-testid="clerk-interpreter-filters__to-lang"
            label={t('languagePair.toPlaceholder')}
            excludedLanguage={filters.fromLang}
            value={getLanguageSelectValue(filters.toLang)}
            languages={qualificationLanguages}
            variant={TextFieldVariant.Outlined}
            onChange={handleFilterChange('toLang')}
            translateLanguage={translateLanguage}
          />
        </div>
      </div>
      <div className="rows gapped-xs">
        <H3>{t('name.title')}</H3>
        <CustomTextField
          data-testid="clerk-interpreter-filters__name"
          label={t('name.placeholder')}
          type="search"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="rows gapped-xs">
        <H3>{t('examinationType.title')}</H3>
        <ComboBox
          autoHighlight
          data-testid="clerk-interpreter-filters__examination-type"
          label={t('examinationType.placeholder')}
          values={Object.values(ExaminationType).map(examinationTypeToOption)}
          value={
            filters.examinationType
              ? examinationTypeToOption(filters.examinationType)
              : null
          }
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('examinationType')}
        />
      </div>
      <div className="rows gapped-xs">
        <H3>{t('permissionToPublish.title')}</H3>
        <ComboBox
          autoHighlight
          data-testid="clerk-interpreter-filters__permission-to-publish-basis"
          label={t('permissionToPublish.placeholder')}
          values={Object.values(PermissionToPublish).map(
            permissionToPublishToOption
          )}
          value={
            filters.permissionToPublish
              ? permissionToPublishToOption(filters.permissionToPublish)
              : null
          }
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('permissionToPublish')}
        />
      </div>
    </div>
  );
};
