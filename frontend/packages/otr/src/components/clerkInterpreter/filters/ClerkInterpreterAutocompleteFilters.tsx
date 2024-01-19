import { useEffect, useState } from 'react';
import {
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
import { ExaminationType, PermissionToPublish } from 'enums/interpreter';
import { ClerkInterpreterFilters } from 'interfaces/clerkInterpreter';
import { addClerkInterpreterFilter } from 'redux/reducers/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';
import { QualificationUtils } from 'utils/qualifications';

export const ClerkInterpreterAutocompleteFilters = ({
  setPage,
}: {
  setPage: (page: number) => void;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();

  const getLanguageSelectValue = (language?: string) =>
    language ? languageToComboBoxOption(translateLanguage, language) : null;

  const dispatch = useAppDispatch();
  const { filters, distinctToLangs } = useAppSelector(
    clerkInterpretersSelector,
  );

  const [name, setName] = useState(() => filters.name ?? '');
  const debounce = useDebounce(300);

  // Empty local state when redux state is reset
  useEffect(() => {
    if (!filters.name) setName('');
  }, [filters.name]);

  const handleNameChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setPage(0);
    setName(event.target.value);
    debounce(() => {
      dispatch(
        addClerkInterpreterFilter({
          name: event.target.value,
        }),
      );
    });
  };

  const handleFilterChange =
    (filter: keyof Omit<ClerkInterpreterFilters, 'fromLang' | 'toLang'>) =>
    (value?: string) => {
      setPage(0);
      dispatch(addClerkInterpreterFilter({ [filter]: value }));
    };
  const handleLanguageFilterChange =
    (filter: 'fromLang' | 'toLang') => (language?: string) => {
      setPage(0);
      dispatch(addClerkInterpreterFilter({ [filter]: language }));
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
    <div className="clerk-interpreter-autocomplete-filters columns gapped">
      <div className="rows gapped-xs">
        <H3>{t('languagePair.title')}</H3>
        <div className="columns gapped">
          <LanguageSelect
            autoHighlight
            data-testid="clerk-interpreter-filters__from-lang"
            label={t('languagePair.fromPlaceholder')}
            value={getLanguageSelectValue(filters.fromLang)}
            disabled={true}
            variant={TextFieldVariant.Outlined}
            onLanguageChange={handleLanguageFilterChange('fromLang')}
            languages={QualificationUtils.selectableFromLangs}
            excludedLanguage={filters.toLang}
            translateLanguage={translateLanguage}
          />
          <LanguageSelect
            autoHighlight
            data-testid="clerk-interpreter-filters__to-lang"
            label={t('languagePair.toPlaceholder')}
            value={getLanguageSelectValue(filters.toLang)}
            variant={TextFieldVariant.Outlined}
            onLanguageChange={handleLanguageFilterChange('toLang')}
            languages={distinctToLangs}
            excludedLanguage={filters.fromLang}
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
          values={Object.values(ExaminationType).map(valueAsOption)}
          value={
            filters.examinationType
              ? valueAsOption(filters.examinationType)
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
          values={getPermissionToPublishSelectValues()}
          value={getPermissionToPublishSelectValue()}
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('permissionToPublish')}
        />
      </div>
    </div>
  );
};
