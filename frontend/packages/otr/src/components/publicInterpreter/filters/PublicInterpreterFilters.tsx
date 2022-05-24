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
  ComboBox,
  CustomButton,
  H3,
  LanguageSelect,
  languageToComboBoxOption,
} from 'shared/components';
import { Color, KeyboardKey, TextFieldVariant, Variant } from 'shared/enums';
import { useDebounce, useWindowProperties } from 'shared/hooks';

import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { SearchFilter } from 'enums/app';
import { PublicInterpreterFilterValues } from 'interfaces/publicInterpreter';
import koodistoRegionsFI from 'public/i18n/koodisto/regions/koodisto_regions_fi-FI.json';
import {
  addPublicInterpreterFilter,
  emptyPublicInterpreterFilters,
} from 'redux/reducers/publicInterpreter';
import {
  filterPublicInterpreters,
  publicInterpretersSelector,
} from 'redux/selectors/publicInterpreter';
import { RegionUtils } from 'utils/regions';

const DEFAULT_FROM_LANG = 'FI';

export const PublicInterpreterFilters = ({
  showTable,
  setShowTable,
}: {
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
}) => {
  // I18
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  const memoizedKoodistoRegions = useMemo(
    () => Object.keys(koodistoRegionsFI.otr.koodisto.regions),
    []
  );

  // Defaults
  const defaultFiltersState = {
    fromLang: DEFAULT_FROM_LANG,
    toLang: '',
    name: '',
    region: '',
    errors: [],
  };

  const defaultValuesState: PublicInterpreterFilterValues = {
    fromLang: languageToComboBoxOption(translateLanguage, DEFAULT_FROM_LANG),
    toLang: null,
    name: '',
    region: null,
  };

  // State
  const [filters, setFilters] = useState(defaultFiltersState);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);
  const [values, setValues] = useState(defaultValuesState);
  const [inputValues, setInputValues] = useState(defaultFiltersState);
  const debounce = useDebounce(300);
  const filtersGridRef = useRef<HTMLInputElement>(null);
  const { isPhone } = useWindowProperties();

  // Redux
  const dispatch = useAppDispatch();
  const { interpreters } = useAppSelector(publicInterpretersSelector);

  const langsTo = Array.from(
    new Set(
      interpreters.flatMap(({ languages }) =>
        (languages ?? []).map((language) => language.to)
      )
    )
  );

  const filteredTranslatorCount = useMemo(() => {
    return filterPublicInterpreters(interpreters, filters).length;
  }, [interpreters, filters]);

  // Handlers
  const handleSearchBtnClick = () => {
    dispatch(addPublicInterpreterFilter(filters));
    setShowTable(true);
    setSearchButtonDisabled(true);
  };

  const scrollToSearch = () => {
    filtersGridRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  };

  const handleEmptyBtnClick = () => {
    setFilters(defaultFiltersState);
    setInputValues(defaultFiltersState);
    setValues(defaultValuesState);
    dispatch(emptyPublicInterpreterFilters());
    scrollToSearch();
    setShowTable(false);
    setSearchButtonDisabled(false);
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
    value: values[fieldName] as AutocompleteValue,
    autoHighlight: true,
    variant: TextFieldVariant.Outlined,
    onChange: handleComboboxFilterChange(fieldName),
  });

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == KeyboardKey.Enter && !searchButtonDisabled) {
      handleSearchBtnClick();
    }
  };

  const renderPhoneBottomAppBar = () =>
    isPhone &&
    showTable && (
      <AppBar
        color={Color.Primary}
        className="public-interpreter-filters__app-bar"
      >
        <Toolbar className="space-around public-interpreter-filters__app-bar__tool-bar">
          <CustomButton
            className="public-interpreter-filters__empty-btn"
            data-testid="public-interpreter-filters__empty-btn"
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={handleEmptyBtnClick}
          >
            {t('buttons.newSearch')}
          </CustomButton>
        </Toolbar>
      </AppBar>
    );

  return (
    <div className="public-interpreter-filters" ref={filtersGridRef}>
      <div className="public-interpreter-filters__filter-box">
        <div className="public-interpreter-filters__filter">
          <div className="columns gapped-xxs">
            <H3>{t('languagePair.title')}</H3>
          </div>
          <Box className="public-interpreter-filters__filter__language-pair">
            <LanguageSelect
              data-testid="public-interpreter-filters__from-language-select"
              {...getComboBoxAttributes(SearchFilter.FromLang)}
              label={t('languagePair.fromPlaceholder')}
              placeholder={t('languagePair.fromPlaceholder')}
              id="filters-from-lang"
              excludedLanguage={filters.toLang}
              languages={[DEFAULT_FROM_LANG]}
              disabled={true}
              aria-label={`${t('languagePair.fromAriaLabel')}`}
              onKeyUp={handleKeyUp}
              translateLanguage={translateLanguage}
            />
            <LanguageSelect
              data-testid="public-interpreter-filters__to-language-select"
              {...getComboBoxAttributes(SearchFilter.ToLang)}
              label={t('languagePair.toPlaceholder')}
              placeholder={t('languagePair.toPlaceholder')}
              id="filters-to-lang"
              excludedLanguage={filters.fromLang}
              languages={langsTo}
              aria-label={`${t('languagePair.toAriaLabel')}`}
              onKeyUp={handleKeyUp}
              translateLanguage={translateLanguage}
            />
          </Box>
        </div>
        <div className="public-interpreter-filters__filter">
          <H3>{t('name.title')}</H3>
          <TextField
            data-testid="public-interpreter-filters__name-field"
            id="outlined-search"
            label={t('name.placeholder')}
            type="search"
            value={values.name}
            onKeyUp={handleKeyUp}
            onChange={handleTextFieldFilterChange(SearchFilter.Name)}
          />
        </div>
        <div className="public-interpreter-filters__filter">
          <H3>{t('region.title')}</H3>
          <ComboBox
            data-testid="public-interpreter-filters__region-combobox"
            {...getComboBoxAttributes(SearchFilter.Region)}
            placeholder={t('region.placeholder')}
            label={t('region.placeholder')}
            id="filters-region"
            values={RegionUtils.getRegionAutocompleteValues(
              memoizedKoodistoRegions
            )}
            onKeyUp={handleKeyUp}
          />
        </div>
      </div>
      <div className="public-interpreter-filters__btn-box">
        {!isPhone && (
          <CustomButton
            data-testid="public-interpreter-filters__empty-btn"
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={handleEmptyBtnClick}
          >
            {t('buttons.empty')}
          </CustomButton>
        )}
        <CustomButton
          disabled={searchButtonDisabled}
          data-testid="public-interpreter-filters__search-btn"
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
