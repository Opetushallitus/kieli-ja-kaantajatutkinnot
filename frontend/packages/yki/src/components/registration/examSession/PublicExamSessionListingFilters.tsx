import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { useRef } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
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
import {
  examSessionsSelector,
  selectFilteredPublicExamSessions,
} from 'redux/selectors/examSessions';

export const PublicExamSessionFilters = ({
  onApplyFilters,
  onEmptyFilters,
}: {
  onApplyFilters: () => void;
  onEmptyFilters: () => void;
}) => {
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
  const filteredExamSessions = useAppSelector(selectFilteredPublicExamSessions);
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

  const handleEmptyBtnClick = () => {
    dispatch(resetPublicExamSessionFilters());
    onEmptyFilters();
    scrollToSearch();
  };

  const languages = Object.values(ExamLanguage);
  const translateLanguage = (language: string) =>
    translateCommon('languages.' + language);

  const levelToComboBoxOption = (v: ExamLevel) => ({
    value: v.toString(),
    label: translateCommon('languageLevel.' + v.toString()),
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
          <Typography
            variant="h3"
            component="label"
            htmlFor="public-exam-session-filters__language-filter"
          >
            {translateCommon('language')}
          </Typography>
          <LanguageSelect
            id="public-exam-session-filters__language-filter"
            languages={languages}
            translateLanguage={translateLanguage}
            variant={TextFieldVariant.Outlined}
            value={
              language
                ? { value: language, label: translateLanguage(language) }
                : null
            }
            onChange={(_, v: AutocompleteValue) => {
              const language = v?.value as ExamLanguage | undefined;
              onFilterChange({ language });
            }}
            label={t('labels.selectLanguage')}
            aria-label={t('labels.selectLanguage')}
          />
        </div>
        <div className="public-exam-session-filters__filter">
          <Typography
            variant="h3"
            component="label"
            htmlFor="public-exam-session-filters__level-filter"
          >
            {translateCommon('level')}
          </Typography>
          <ComboBox
            id="public-exam-session-filters__level-filter"
            variant={TextFieldVariant.Outlined}
            values={levelValues}
            value={level ? levelToComboBoxOption(level) : null}
            onChange={(_, v: AutocompleteValue) => {
              const level = v?.value as ExamLevel | undefined;
              onFilterChange({ level });
            }}
            label={t('labels.selectLevel')}
            aria-label={t('labels.selectLevel')}
          />
        </div>
        <div className="public-exam-session-filters__filter">
          <Typography
            variant="h3"
            component="label"
            htmlFor="public-exam-session-filters__municipality-filter"
          >
            {translateCommon('municipality')}
          </Typography>
          <ComboBox
            id="public-exam-session-filters__municipality-filter"
            variant={TextFieldVariant.Outlined}
            values={municipalities.map(municipalityToComboBoxOption)}
            value={
              municipality ? municipalityToComboBoxOption(municipality) : null
            }
            onChange={(_, v: AutocompleteValue) => {
              const municipality = v?.value;
              onFilterChange({ municipality });
            }}
            label={t('labels.selectMunicipality')}
            aria-label={t('labels.selectMunicipality')}
          />
        </div>
      </div>
      <Box className="public-exam-session-filters__toggle-box">
        <FormControl component="fieldset" variant={TextFieldVariant.Standard}>
          <Typography variant="h3" component="legend">
            {t('labels.filterExamSessions')}
          </Typography>
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
          disabled={false}
          data-testid="public-exam-session-filters__filter__search-btn"
          color={Color.Secondary}
          variant={Variant.Contained}
          onClick={onApplyFilters}
          startIcon={<SearchIcon />}
        >
          {`${translateCommon('buttons.showResults', {
            count: filteredExamSessions.length,
          })}`}
        </CustomButton>
      </div>
    </div>
  );
};
