import {
  useState,
  ChangeEvent,
  SetStateAction,
  Dispatch,
  KeyboardEvent,
} from 'react';
import {
  TextField,
  InputAdornment,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { H3 } from 'components/elements/Text';
import { Dropdown } from 'components/elements/Dropdown';
import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector, useAppDispatch } from 'configs/redux';
import {
  addPublicTranslatorFilter,
  addPublicTranslatorFilterError,
  emptyPublicTranslatorFilters,
  emptySelectedTranslators,
  removePublicTranslatorFilterError,
} from 'redux/actions/publicTranslator';
import { publicTranslatorsSelector } from 'redux/selectors/publicTranslator';
import { Utils } from 'utils/index';
import { SearchFilter, KeyboardKey, Severity } from 'enums/app';
import { showNotifierToast } from 'redux/actions/notifier';

export const PublicTranslatorFilters = ({
  setShowTable,
}: {
  setShowTable: Dispatch<SetStateAction<boolean>>;
}) => {
  // I18
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.publicTranslatorFilters',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  // State
  const defaultFiltersState = {
    fromLang: '',
    toLang: '',
    name: '',
    town: '',
  };
  const [filters, setFilters] = useState(defaultFiltersState);

  // Redux
  const dispatch = useAppDispatch();
  const {
    langs,
    towns,
    filters: reduxFilters,
  } = useAppSelector(publicTranslatorsSelector);

  // Handlers
  const handleSearchBtnClick = () => {
    const toast = Utils.createNotifierToast(
      Severity.Error,
      t('toasts.selectLanguagePair')
    );

    if (reduxFilters?.errors?.length) {
      // If there are already errors show them
      dispatch(showNotifierToast(toast));
    } else if (
      (filters.fromLang && !filters.toLang) ||
      (!filters.fromLang && filters.toLang)
    ) {
      // If one of the fields are not defined show an error
      const langFields = [SearchFilter.FromLang, SearchFilter.ToLang];
      langFields.forEach((field) => {
        if (!filters[field] && !hasError(field))
          dispatch(addPublicTranslatorFilterError(field));
      });
      dispatch(showNotifierToast(toast));
    } else {
      dispatch(addPublicTranslatorFilter(filters));
      setShowTable(true);
    }
  };

  const handleEmptyBtnClick = () => {
    setFilters(defaultFiltersState);
    dispatch(emptyPublicTranslatorFilters);
    dispatch(emptySelectedTranslators);
    setShowTable(false);
  };

  const isEmptyBtnDisabled = () => {
    const { fromLang, toLang, town, name } = filters;

    return !(!!fromLang || !!toLang || !!name || !!town);
  };

  const hasError = (fieldName: SearchFilter) => {
    return reduxFilters?.errors?.includes(fieldName);
  };

  const handleFilterChange =
    (filterName: SearchFilter) =>
    (
      event:
        | SelectChangeEvent
        | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFilters({ ...filters, [filterName]: event.target.value });
      dispatch(removePublicTranslatorFilterError(filterName));
    };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == KeyboardKey.Enter) handleSearchBtnClick();
  };

  return (
    <div className="public-translator-filters">
      <div className="public-translator-filters__filter-box">
        <div className="public-translator-filters__filter">
          <H3>{t('languagePair.title')}</H3>
          <div className="public-translator-filters__filter__language-pair">
            <Dropdown
              data-testid="public-translator-filters__from-language-select"
              showInputLabel
              showError={hasError(SearchFilter.FromLang)}
              sortByKeys
              label={t('languagePair.fromPlaceholder')}
              id="filters-from-lang"
              variant="outlined"
              values={Utils.createMapFromArray(langs.from, translateLanguage)}
              value={filters.fromLang}
              onChange={handleFilterChange(SearchFilter.FromLang)}
            />
            <Dropdown
              data-testid="public-translator-filters__to-language-select"
              showInputLabel
              showError={hasError(SearchFilter.ToLang)}
              sortByKeys
              label={t('languagePair.toPlaceholder')}
              id="filters-to-lang"
              variant="outlined"
              values={Utils.createMapFromArray(langs.to, translateLanguage)}
              value={filters.toLang}
              onChange={handleFilterChange(SearchFilter.ToLang)}
            />
          </div>
        </div>
        <div className="public-translator-filters__filter">
          <H3>{t('name.title')}</H3>
          <TextField
            data-testid="public-translator-filters__name-field"
            id="outlined-search"
            label={t('name.placeholder')}
            type="search"
            value={filters.name}
            onKeyUp={handleKeyUp}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={handleFilterChange(SearchFilter.Name)}
          />
        </div>
        <div className="public-translator-filters__filter">
          <H3> {t('town.title')}</H3>
          <Dropdown
            data-testid="public-translator-filters__town-select"
            showInputLabel
            sortByKeys
            label={t('town.placeholder')}
            id="filters-town"
            variant="outlined"
            values={Utils.createMapFromArray(towns)}
            value={filters.town}
            onChange={handleFilterChange(SearchFilter.Town)}
          />
        </div>
      </div>
      <div className="public-translator-filters__btn-box">
        <Button
          data-testid="public-translator-filters__empty-btn"
          color="secondary"
          variant="outlined"
          onClick={handleEmptyBtnClick}
          size="large"
          disabled={isEmptyBtnDisabled()}
        >
          {t('buttons.empty')}
        </Button>
        <Button
          data-testid="public-translator-filters__search-btn"
          color="secondary"
          variant="contained"
          size="large"
          onClick={handleSearchBtnClick}
        >
          {t('buttons.search')}
        </Button>
      </div>
    </div>
  );
};
