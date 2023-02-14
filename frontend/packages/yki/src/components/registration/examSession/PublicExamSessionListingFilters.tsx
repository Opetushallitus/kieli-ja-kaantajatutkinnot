import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from '@mui/material';
import { useRef } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
  H3,
  LanguageSelect,
} from 'shared/components';
import { Color, TextFieldVariant, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { ExamSessionFilters } from 'interfaces/examSessions';
import {
  resetPublicExamSessionFilters,
  setPublicExamSessionFilters,
} from 'redux/reducers/examSessions';
import { examSessionsSelector } from 'redux/selectors/examSessions';

export const PublicExamSessionFilters = () => {
  // I18
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  const filtersGridRef = useRef<HTMLInputElement>(null);
  const scrollToSearch = () => {
    filtersGridRef.current?.scrollIntoView({
      block: 'end',
      inline: 'nearest',
    });
  };

  const { filters, municipalities } = useAppSelector(examSessionsSelector);
  const {
    language,
    level,
    municipality,
    excludeFullSessions,
    excludeNonOpenSessions,
  } = filters;

  const dispatch = useAppDispatch();
  const onFilterChange = (filter: Partial<ExamSessionFilters>) => {
    dispatch(setPublicExamSessionFilters(filter));
  };

  // TODO Fixme
  const searchButtonDisabled = false;
  const handleEmptyBtnClick = () => {
    dispatch(resetPublicExamSessionFilters());
    scrollToSearch();
  };
  // eslint-disable-next-line no-console
  const handleSearchBtnClick = () => console.log('search btn clicked..');
  const languages = Object.values(ExamLanguage);
  const translateLanguage = (language: string) =>
    translateCommon('languages.' + language);

  const levelToComboBoxOption = (v: ExamLevel) => ({
    value: v.toString(),
    label: translateCommon('levels.' + v.toString()),
  });
  const levelValues = Object.values(ExamLevel).map(levelToComboBoxOption);
  const municipalityToComboBoxOption = (m: string) => ({
    value: m,
    label: m,
  });

  return (
    <div className="public-exam-session-filters" ref={filtersGridRef}>
      <div className="public-exam-session-filters__dropdown-filters-box">
        <div className="public-exam-session-filters__filter">
          <H3>{translateCommon('language')}</H3>
          <LanguageSelect
            languages={languages}
            translateLanguage={translateLanguage}
            variant={TextFieldVariant.Outlined}
            value={
              language
                ? { value: language, label: translateLanguage(language) }
                : null
            }
            onChange={(_, v: AutocompleteValue) => {
              if (v) {
                onFilterChange({ language: v.value as ExamLanguage });
              } else {
                onFilterChange({ language: undefined });
              }
            }}
            label={t('labels.selectLanguage')}
            aria-label={t('labels.selectLanguage')}
          />
        </div>
        <div className="public-exam-session-filters__filter">
          <H3>{translateCommon('level')}</H3>
          <ComboBox
            variant={TextFieldVariant.Outlined}
            values={levelValues}
            value={level ? levelToComboBoxOption(level) : null}
            onChange={(_, v: AutocompleteValue) => {
              if (v) {
                onFilterChange({ level: v.value as ExamLevel });
              } else {
                onFilterChange({ level: undefined });
              }
            }}
            label={t('labels.selectLevel')}
            aria-label={t('labels.selectLevel')}
          />
        </div>
        <div className="public-exam-session-filters__filter">
          <H3> {translateCommon('municipality')}</H3>
          <ComboBox
            variant={TextFieldVariant.Outlined}
            values={municipalities.map(municipalityToComboBoxOption)}
            value={
              municipality ? municipalityToComboBoxOption(municipality) : null
            }
            onChange={(_, v: AutocompleteValue) => {
              if (v) {
                onFilterChange({ municipality: v.value });
              } else {
                onFilterChange({ municipality: undefined });
              }
            }}
            label={t('labels.selectMunicipality')}
            aria-label={t('labels.selectMunicipality')}
          />
        </div>
      </div>
      <Box className="public-exam-session-filters__toggle-box">
        <FormControl component="fieldset" variant={TextFieldVariant.Standard}>
          <FormLabel
            component="legend"
            className="public-exam-session-filters__toggle-box__legend bold"
          >
            {t('labels.filterExamSessions')}
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={excludeFullSessions}
                  onChange={(_, checked) => {
                    onFilterChange({ excludeFullSessions: checked });
                  }}
                />
              }
              label={t('labels.excludeFullSessions')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={excludeNonOpenSessions}
                  onChange={(_, checked) => {
                    onFilterChange({ excludeNonOpenSessions: checked });
                  }}
                />
              }
              label={t('labels.excludeNonOpenSessions')}
            />
          </FormGroup>
        </FormControl>
      </Box>
      <div className="public-exam-session-filters__btn-box">
        <CustomButton
          data-testid="public-exam-session-filters__filter__empty-btn"
          color={Color.Secondary}
          variant={Variant.Outlined}
          onClick={handleEmptyBtnClick}
        >
          {translateCommon('buttons.empty')}
        </CustomButton>
        <CustomButton
          disabled={searchButtonDisabled}
          data-testid="public-exam-session-filters__filter__search-btn"
          color={Color.Secondary}
          variant={Variant.Contained}
          onClick={handleSearchBtnClick}
          startIcon={<SearchIcon />}
        >
          {`${translateCommon('buttons.search')} (1337)`}
        </CustomButton>
      </div>
    </div>
  );
};
