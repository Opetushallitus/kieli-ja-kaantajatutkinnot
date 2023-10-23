import SearchIcon from '@mui/icons-material/Search';
import { AppBar, Box, TextField, Toolbar } from '@mui/material';
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  SyntheticEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AutocompleteValue,
  Caption,
  ComboBox,
  CustomButton,
  H3,
  LanguageSelect,
} from 'shared/components';
import {
  Color,
  KeyboardKey,
  Severity,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDebounce, useToast, useWindowProperties } from 'shared/hooks';

import { ContactRequestButton } from 'components/publicTranslator/listing/ContactRequestButton';
import {
  isCurrentLangSv,
  useAppTranslation,
  useKoodistoCountriesTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { SearchFilter } from 'enums/app';
import {
  PublicTown,
  PublicTranslatorFilterValues,
} from 'interfaces/publicTranslator';
import {
  addPublicTranslatorFilterError,
  deselectAllPublicTranslators,
  emptyPublicTranslatorFilters,
  removePublicTranslatorFilterError,
  setPage,
  setPublicTranslatorFilters,
} from 'redux/reducers/publicTranslator';
import {
  filterPublicTranslators,
  publicTranslatorsSelector,
} from 'redux/selectors/publicTranslator';
import { AuthorisationUtils } from 'utils/authorisation';

export const PublicTranslatorFilters = ({
  showTable,
  setShowTable,
}: {
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
}) => {
  // I18
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.publicTranslatorFilters',
  });
  const translateCountry = useKoodistoCountriesTranslation();
  const translateLanguage = useKoodistoLanguagesTranslation();

  const { showToast } = useToast();

  // State
  const defaultFiltersState = {
    fromLang: '',
    toLang: '',
    name: '',
    town: '',
    errors: [],
  };
  const [filters, setFilters] = useState(defaultFiltersState);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);
  const defaultValuesState: PublicTranslatorFilterValues = {
    fromLang: '',
    toLang: '',
    name: '',
    town: null,
  };
  const debounce = useDebounce(300);

  const [values, setValues] = useState(defaultValuesState);
  const [inputValues, setInputValues] = useState(defaultFiltersState);
  const filtersGridRef = useRef<HTMLInputElement>(null);
  const { isPhone } = useWindowProperties();

  // Redux
  const dispatch = useAppDispatch();
  const {
    langs,
    towns,
    filters: reduxFilters,
    selectedTranslators,
    translators,
  } = useAppSelector(publicTranslatorsSelector);

  const filteredTranslatorCount = useMemo(() => {
    return filterPublicTranslators(translators, filters).length;
  }, [translators, filters]);

  const hasError = (fieldName: SearchFilter) => {
    return reduxFilters.errors.includes(fieldName);
  };

  // Handlers
  const handleSearchBtnClick = () => {
    if (
      (filters.fromLang && !filters.toLang) ||
      (!filters.fromLang && filters.toLang)
    ) {
      // If one of the fields are not defined show an error
      const langFields = [SearchFilter.FromLang, SearchFilter.ToLang];
      langFields.forEach((field) => {
        if (!filters[field] && !hasError(field))
          dispatch(addPublicTranslatorFilterError(field));
      });

      showToast({
        severity: Severity.Error,
        description: t('toasts.selectLanguagePair'),
      });
    } else {
      dispatch(setPublicTranslatorFilters(filters));
      setShowTable(true);
      setSearchButtonDisabled(true);
    }
    dispatch(setPage(0));
  };

  const scrollToSearch = () => {
    filtersGridRef.current?.scrollIntoView({
      block: 'end',
      inline: 'nearest',
    });
  };

  const handleEmptyBtnClick = () => {
    setFilters(defaultFiltersState);
    setInputValues(defaultFiltersState);
    setValues(defaultValuesState);
    dispatch(emptyPublicTranslatorFilters());
    dispatch(deselectAllPublicTranslators());
    scrollToSearch();
    setShowTable(false);
    setSearchButtonDisabled(false);
    dispatch(setPage(0));
  };

  const handleComboboxInputChange =
    (inputName: SearchFilter) =>
    (_event: SyntheticEvent, newInputValue: string) => {
      setInputValues({ ...inputValues, [inputName]: newInputValue });
      setSearchButtonDisabled(false);
    };

  const handleComboboxFilterChange =
    (filterName: SearchFilter) =>
    (
      {},
      value: AutocompleteValue,
      reason:
        | 'selectOption'
        | 'createOption'
        | 'removeOption'
        | 'blur'
        | 'clear'
    ) => {
      if (reason === 'clear') {
        setFilters((prevState) => ({ ...prevState, [filterName]: '' }));
        setValues((prevState) => ({ ...prevState, [filterName]: null }));
      } else {
        setFilters((prevState) => ({
          ...prevState,
          [filterName]: value?.value || '',
        }));
        setValues((prevState) => ({ ...prevState, [filterName]: value }));
      }
      dispatch(removePublicTranslatorFilterError(filterName));
      setSearchButtonDisabled(false);
    };

  const onLanguageChange =
    (languageField: SearchFilter.FromLang | SearchFilter.ToLang) =>
    (language?: string) => {
      setFilters((prevState) => ({
        ...prevState,
        [languageField]: language || '',
      }));
      setValues((prevState) => ({
        ...prevState,
        [languageField]: language || '',
      }));
      dispatch(removePublicTranslatorFilterError(languageField));
      setSearchButtonDisabled(false);
    };

  const handleTextFieldFilterChange =
    (filterName: SearchFilter) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = event.target as HTMLInputElement;
      setValues((prevState) => ({ ...prevState, [filterName]: target.value }));
      debounce(() => {
        setFilters((prevState) => ({
          ...prevState,
          [filterName]: target.value,
        }));
        setSearchButtonDisabled(false);
      });
    };

  const getComboBoxAttributes = (fieldName: SearchFilter) => ({
    onInputChange: handleComboboxInputChange(fieldName),
    inputValue: inputValues[fieldName],
    autoHighlight: true,
    variant: TextFieldVariant.Outlined,
  });

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == KeyboardKey.Enter && !searchButtonDisabled) {
      handleSearchBtnClick();
    }
  };

  const isLangFilterDisabled = selectedTranslators.length > 0;

  const showTranslatorsAlreadySelectedToast = () => {
    if (isLangFilterDisabled) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.translatorsSelected'),
      });
    }
  };

  const townAsComboboxOption = (publicTown: PublicTown) => {
    const country = publicTown.country
      ? translateCountry(publicTown.country)
      : '';
    const value = `${publicTown.name}::${publicTown.country ?? ''}`;
    const townName = isCurrentLangSv() ? publicTown.nameSv : publicTown.name;
    const label = country ? `${townName} (${country})` : townName;

    return { value, label };
  };

  const renderPhoneBottomAppBar = () =>
    isPhone &&
    showTable && (
      <AppBar
        color={Color.Primary}
        className="public-translator-filters__app-bar"
      >
        <Toolbar className="public-translator-filters__app-bar__tool-bar space-between">
          <CustomButton
            data-testid="public-translator-filters__empty-btn"
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={handleEmptyBtnClick}
          >
            {t('buttons.newSearch')}
          </CustomButton>
          <ContactRequestButton />
        </Toolbar>
      </AppBar>
    );

  return (
    <div className="public-translator-filters" ref={filtersGridRef}>
      <div className="public-translator-filters__filter-box">
        <div className="public-translator-filters__filter">
          <div className="columns gapped-xxs">
            <H3>{t('languagePair.title')}</H3>
            <Caption className="public-translator-filters__filter_">
              {t('captions.langPair')}
            </Caption>
          </div>
          <Box
            data-testid="public-translator-filters__filter__language-pair"
            className="public-translator-filters__filter__language-pair"
            onClick={showTranslatorsAlreadySelectedToast}
          >
            <LanguageSelect
              data-testid="public-translator-filters__from-language-select"
              {...getComboBoxAttributes(SearchFilter.FromLang)}
              value={
                values.fromLang
                  ? {
                      label: translateLanguage(values.fromLang),
                      value: values.fromLang,
                    }
                  : null
              }
              showError={hasError(SearchFilter.FromLang)}
              label={t('languagePair.fromPlaceholder')}
              placeholder={t('languagePair.fromPlaceholder')}
              id="filters-from-lang"
              aria-label={`${t('languagePair.fromAriaLabel')}`}
              disabled={isLangFilterDisabled}
              onKeyUp={handleKeyUp}
              languages={AuthorisationUtils.selectableLanguagesForLanguageFilter(
                langs.from,
                filters.toLang
              )}
              primaryLanguages={AuthorisationUtils.primaryLangs}
              excludedLanguage={filters.toLang}
              translateLanguage={translateLanguage}
              onLanguageChange={onLanguageChange(SearchFilter.FromLang)}
            />
            <LanguageSelect
              data-testid="public-translator-filters__to-language-select"
              {...getComboBoxAttributes(SearchFilter.ToLang)}
              value={
                values.toLang
                  ? {
                      label: translateLanguage(values.toLang),
                      value: values.toLang,
                    }
                  : null
              }
              showError={hasError(SearchFilter.ToLang)}
              label={t('languagePair.toPlaceholder')}
              placeholder={t('languagePair.toPlaceholder')}
              id="filters-to-lang"
              aria-label={`${t('languagePair.toAriaLabel')}`}
              disabled={isLangFilterDisabled}
              onKeyUp={handleKeyUp}
              languages={AuthorisationUtils.selectableLanguagesForLanguageFilter(
                langs.to,
                filters.fromLang
              )}
              primaryLanguages={AuthorisationUtils.primaryLangs}
              excludedLanguage={filters.fromLang}
              translateLanguage={translateLanguage}
              onLanguageChange={onLanguageChange(SearchFilter.ToLang)}
            />
          </Box>
        </div>
        <div className="public-translator-filters__filter">
          <H3>{t('name.title')}</H3>
          <TextField
            data-testid="public-translator-filters__name-field"
            id="outlined-search"
            label={t('name.placeholder')}
            type="search"
            value={values.name}
            onKeyUp={handleKeyUp}
            onChange={handleTextFieldFilterChange(SearchFilter.Name)}
          />
        </div>
        <div className="public-translator-filters__filter">
          <H3> {t('town.title')}</H3>
          <ComboBox
            data-testid="public-translator-filters__town-combobox"
            {...getComboBoxAttributes(SearchFilter.Town)}
            value={values.town ?? null}
            placeholder={t('town.placeholder')}
            label={t('town.placeholder')}
            id="filters-town"
            values={towns.map(townAsComboboxOption)}
            onKeyUp={handleKeyUp}
            onChange={handleComboboxFilterChange(SearchFilter.Town)}
          />
        </div>
      </div>
      <div className="public-translator-filters__btn-box">
        {!isPhone && (
          <CustomButton
            data-testid="public-translator-filters__empty-btn"
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={handleEmptyBtnClick}
          >
            {t('buttons.empty')}
          </CustomButton>
        )}
        <CustomButton
          disabled={searchButtonDisabled}
          data-testid="public-translator-filters__search-btn"
          color={Color.Secondary}
          variant={Variant.Contained}
          onClick={handleSearchBtnClick}
          startIcon={<SearchIcon />}
        >
          {`${t('buttons.search')} (${filteredTranslatorCount})`}
        </CustomButton>
      </div>
      {renderPhoneBottomAppBar()}
    </div>
  );
};
