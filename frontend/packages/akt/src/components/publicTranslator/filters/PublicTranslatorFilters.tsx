import SearchIcon from '@mui/icons-material/Search';
import { AppBar, Box, TextField, Toolbar } from '@mui/material';
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ComboBox,
  sortOptionsByLabels,
  valueAsOption,
} from 'components/elements/ComboBox';
import { CustomButton } from 'components/elements/CustomButton';
import { LanguageSelect } from 'components/elements/LanguageSelect';
import { Caption, H3 } from 'components/elements/Text';
import { ContactRequestButton } from 'components/publicTranslator/listing/ContactRequestButton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  Color,
  KeyboardKey,
  SearchFilter,
  Severity,
  TextFieldVariant,
  Variant,
} from 'enums/app';
import { useDebounce } from 'hooks/useDebounce';
import { useWindowProperties } from 'hooks/useWindowProperties';
import { AutocompleteValue } from 'interfaces/components/combobox';
import { PublicTranslatorFilterValues } from 'interfaces/publicTranslator';
import { showNotifierToast } from 'redux/actions/notifier';
import {
  addPublicTranslatorFilter,
  addPublicTranslatorFilterError,
  emptyPublicTranslatorFilters,
  emptySelectedTranslators,
  removePublicTranslatorFilterError,
} from 'redux/actions/publicTranslator';
import {
  filterPublicTranslators,
  publicTranslatorsSelector,
} from 'redux/selectors/publicTranslator';
import { NotifierUtils } from 'utils/notifier';

export const PublicTranslatorFilters = ({
  showTable,
  setShowTable,
}: {
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
}) => {
  // I18
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.publicTranslatorFilters',
  });

  // State
  const defaultFiltersState = {
    fromLang: '',
    toLang: '',
    name: '',
    town: '',
    errors: [],
  };
  const [filters, setFilters] = useState(defaultFiltersState);
  const defaultValuesState: PublicTranslatorFilterValues = {
    fromLang: null,
    toLang: null,
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

      const toast = NotifierUtils.createNotifierToast(
        Severity.Error,
        t('toasts.selectLanguagePair')
      );
      dispatch(showNotifierToast(toast));
    } else {
      dispatch(addPublicTranslatorFilter(filters));
      setShowTable(true);
    }
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
    dispatch(emptyPublicTranslatorFilters);
    dispatch(emptySelectedTranslators);
    scrollToSearch();
    setShowTable(false);
  };

  const handleComboboxInputChange =
    (inputName: SearchFilter) =>
    ({}, newInputValue: string) => {
      setInputValues({ ...inputValues, [inputName]: newInputValue });
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
    };

  const handleTextFieldFilterChange =
    (filterName: SearchFilter) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = event.target as HTMLInputElement;
      setValues((prevState) => ({ ...prevState, [filterName]: target.value }));
      debounce(() =>
        setFilters((prevState) => ({
          ...prevState,
          [filterName]: target.value,
        }))
      );
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
    if (event.key == KeyboardKey.Enter) handleSearchBtnClick();
  };

  const isLangFilterDisabled = selectedTranslators.length > 0;

  const showTranslatorsAlreadySelectedToast = () => {
    if (isLangFilterDisabled) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Error,
        t('toasts.translatorsSelected')
      );

      dispatch(showNotifierToast(toast));
    }
  };

  const renderPhoneBottomAppBar = () =>
    isPhone &&
    showTable && (
      <AppBar
        color={Color.Primary}
        className="public-translator-filters__app-bar"
      >
        <Toolbar className="space-around public-translator-filters__app-bar__tool-bar">
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
            className="public-translator-filters__filter__language-pair"
            onClick={showTranslatorsAlreadySelectedToast}
          >
            <LanguageSelect
              data-testid="public-translator-filters__from-language-select"
              {...getComboBoxAttributes(SearchFilter.FromLang)}
              showError={hasError(SearchFilter.FromLang)}
              label={t('languagePair.fromPlaceholder')}
              placeholder={t('languagePair.fromPlaceholder')}
              id="filters-from-lang"
              excludedLanguage={filters.toLang}
              languages={langs.from}
              aria-label={`${t('languagePair.fromAriaLabel')}`}
              disabled={isLangFilterDisabled}
              onKeyUp={handleKeyUp}
            />
            <LanguageSelect
              data-testid="public-translator-filters__to-language-select"
              {...getComboBoxAttributes(SearchFilter.ToLang)}
              showError={hasError(SearchFilter.ToLang)}
              label={t('languagePair.toPlaceholder')}
              placeholder={t('languagePair.toPlaceholder')}
              id="filters-to-lang"
              excludedLanguage={filters.fromLang}
              languages={langs.to}
              aria-label={`${t('languagePair.toAriaLabel')}`}
              disabled={isLangFilterDisabled}
              onKeyUp={handleKeyUp}
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
            placeholder={t('town.placeholder')}
            label={t('town.placeholder')}
            id="filters-town"
            values={sortOptionsByLabels(towns.map(valueAsOption))}
            onKeyUp={handleKeyUp}
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
