import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
  LanguageSelect,
  Text,
} from 'shared/components';
import { Color, Severity, TextFieldVariant, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

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

  const { showDialog } = useDialog();
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

  const [showError, setShowError] = useState(false);

  const handleEmptyBtnClick = () => {
    dispatch(resetPublicExamSessionFilters());
    onEmptyFilters();
    scrollToSearch();
  };

  const handleSubmitBtnClick = () => {
    if (!filters.language || !filters.level) {
      setShowError(true);
      showDialog({
        severity: Severity.Error,
        title: t('filters.errorDialog.title'),
        description: t('filters.errorDialog.description'),
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Contained,
          },
        ],
      });
    } else {
      setShowError(false);
      onApplyFilters();
    }
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

  const errorStyles = { color: 'error.main' };

  return (
    <div className="public-exam-session-filters" ref={filtersGridRef}>
      <Text>
        <b>{t('filters.selectExamDetails.prompt')}</b>{' '}
        {t('filters.selectExamDetails.required')}
      </Text>
      <div className="public-exam-session-filters__dropdown-filters-box">
        <FormControl
          className="public-exam-session-filters__filter"
          error={showError && !language}
        >
          <Typography
            variant="h3"
            component="label"
            htmlFor="public-exam-session-filters__language-filter"
            sx={showError && !language ? { color: 'error.main' } : {}}
          >
            {translateCommon('language')}
          </Typography>
          <LanguageSelect
            id="public-exam-session-filters__language-filter"
            primaryLanguages={[ExamLanguage.ALL]}
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
            showError={showError && !language}
            helperText={
              showError && !language ? t('filters.errors.required') : ''
            }
          />
        </FormControl>
        <FormControl
          className="public-exam-session-filters__filter"
          error={showError && !level}
        >
          <Typography
            variant="h3"
            component="label"
            htmlFor="public-exam-session-filters__level-filter"
            sx={showError && !level ? errorStyles : {}}
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
            showError={showError && !level}
            helperText={showError && !level ? t('filters.errors.required') : ''}
          />
        </FormControl>
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
          {t('filters.buttons.empty')}
        </CustomButton>
        <CustomButton
          disabled={false}
          data-testid="public-exam-session-filters__filter__search-btn"
          color={Color.Secondary}
          variant={Variant.Contained}
          onClick={handleSubmitBtnClick}
          startIcon={<SearchIcon />}
        >
          {`${t('filters.buttons.showResults', {
            count: filteredExamSessions.length,
          })}`}
        </CustomButton>
      </div>
    </div>
  );
};
