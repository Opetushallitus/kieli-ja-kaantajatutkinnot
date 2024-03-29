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
  emptyPublicInterpreterFilters,
  setPublicInterpreterFilters,
} from 'redux/reducers/publicInterpreter';
import {
  filterPublicInterpreters,
  publicInterpretersSelector,
} from 'redux/selectors/publicInterpreter';
import { QualificationUtils } from 'utils/qualifications';
import { RegionUtils } from 'utils/regions';

export const PublicInterpreterFilters = ({
  showTable,
  setShowTable,
  setPage,
}: {
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
  setPage: (page: number) => void;
}) => {
  // I18
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  const memoizedKoodistoRegions = useMemo(
    () => Object.keys(koodistoRegionsFI.otr.koodisto.regions),
    [],
  );

  // Defaults
  const defaultFiltersState = {
    fromLang: QualificationUtils.defaultFromLang,
    toLang: '',
    name: '',
    region: '',
  };

  const defaultValuesState: PublicInterpreterFilterValues = {
    fromLang: '',
    toLang: '',
    name: '',
    region: '',
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

  const toLangs = Array.from(
    new Set(
      interpreters.flatMap(({ languages }) =>
        (languages ?? []).map((language) => language.to),
      ),
    ),
  );

  const filteredInterpreterCount = useMemo(() => {
    return filterPublicInterpreters(interpreters, filters).length;
  }, [interpreters, filters]);

  // Handlers
  const handleSearchBtnClick = () => {
    setPage(0);
    dispatch(setPublicInterpreterFilters(filters));
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
    setPage(0);
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

  const handleRegionChange = (region?: string) => {
    setFilters((prevState) => ({
      ...prevState,
      [SearchFilter.Region]: region || '',
    }));
    setValues((prevState) => ({
      ...prevState,
      [SearchFilter.Region]: region || '',
    }));
    setSearchButtonDisabled(false);
  };

  const handleLanguageChange =
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

  const renderPhoneBottomAppBar = () =>
    isPhone &&
    showTable &&
    searchButtonDisabled && (
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
              onLanguageChange={handleLanguageChange(SearchFilter.FromLang)}
              value={
                values.fromLang
                  ? languageToComboBoxOption(translateLanguage, values.fromLang)
                  : null
              }
              label={t('languagePair.fromPlaceholder')}
              placeholder={t('languagePair.fromPlaceholder')}
              id="filters-from-lang"
              disabled={true}
              aria-label={`${t('languagePair.fromAriaLabel')}`}
              onKeyUp={handleKeyUp}
              languages={QualificationUtils.selectableFromLangs}
              excludedLanguage={filters.toLang}
              translateLanguage={translateLanguage}
            />
            <LanguageSelect
              data-testid="public-interpreter-filters__to-language-select"
              {...getComboBoxAttributes(SearchFilter.ToLang)}
              value={
                values.toLang
                  ? languageToComboBoxOption(translateLanguage, values.toLang)
                  : null
              }
              onLanguageChange={handleLanguageChange(SearchFilter.ToLang)}
              label={t('languagePair.toPlaceholder')}
              placeholder={t('languagePair.toPlaceholder')}
              id="filters-to-lang"
              aria-label={`${t('languagePair.toAriaLabel')}`}
              onKeyUp={handleKeyUp}
              languages={toLangs}
              excludedLanguage={filters.fromLang}
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
            value={
              values[SearchFilter.Region]
                ? {
                    label: RegionUtils.translateRegion(
                      values[SearchFilter.Region],
                    ),
                    value: values[SearchFilter.Region],
                  }
                : null
            }
            onChange={handleRegionChange}
            placeholder={t('region.placeholder')}
            label={t('region.placeholder')}
            id="filters-region"
            values={RegionUtils.getRegionAutocompleteValues(
              memoizedKoodistoRegions,
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
          {`${t('buttons.search')} (${filteredInterpreterCount})`}
        </CustomButton>
      </div>
      {renderPhoneBottomAppBar()}
    </div>
  );
};
