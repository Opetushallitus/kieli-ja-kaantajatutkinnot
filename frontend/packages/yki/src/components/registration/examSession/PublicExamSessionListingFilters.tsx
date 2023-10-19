import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
  LanguageSelect,
  NativeSelect,
  Text,
} from 'shared/components';
import { Color, Severity, TextFieldVariant, Variant } from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage, ExamLevel } from 'enums/app';
import { ExamSessionFilters } from 'interfaces/examSessions';
import { setPublicExamSessionFilters } from 'redux/reducers/examSessions';
import {
  examSessionsSelector,
  selectFilteredPublicExamSessions,
} from 'redux/selectors/examSessions';

const municipalityToComboBoxOption = (m: string) => ({
  value: m,
  label: m,
});

const SelectMunicipality = () => {
  const municipalities = useAppSelector(examSessionsSelector).municipalities;
  const { municipality } = useAppSelector(examSessionsSelector).filters;
  const dispatch = useAppDispatch();
  const onMunicipalityChange = useCallback(
    (municipality?: string) => {
      dispatch(setPublicExamSessionFilters({ municipality }));
    },
    [dispatch]
  );

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });
  const { isPhone } = useWindowProperties();

  return (
    <div className="public-exam-session-filters__filter public-exam-session-filters__municipality">
      <Typography
        variant="h3"
        component="label"
        htmlFor="public-exam-session-filters__municipality-filter"
      >
        {t('labels.selectMunicipality')}
      </Typography>
      {isPhone ? (
        <NativeSelect
          id="public-exam-session-filters__municipality-filter"
          onChange={(e) => {
            onMunicipalityChange(e.target.value as string);
          }}
          placeholder={t('labels.selectMunicipality')}
          value={
            municipality ? municipalityToComboBoxOption(municipality) : null
          }
          values={municipalities.map(municipalityToComboBoxOption)}
        />
      ) : (
        <ComboBox
          id="public-exam-session-filters__municipality-filter"
          variant={TextFieldVariant.Outlined}
          values={municipalities.map(municipalityToComboBoxOption)}
          value={
            municipality ? municipalityToComboBoxOption(municipality) : null
          }
          onChange={(_, v: AutocompleteValue) => {
            const municipality = v?.value;
            onMunicipalityChange(municipality);
          }}
          label={t('labels.selectMunicipality')}
          aria-label={t('labels.selectMunicipality')}
        />
      )}
    </div>
  );
};

const SelectExamLanguage = ({
  showError,
  onFilterChange,
}: {
  showError: boolean;
  onFilterChange: (filter: Partial<ExamSessionFilters>) => void;
}) => {
  const { language } = useAppSelector(examSessionsSelector).filters;

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });
  const translateCommon = useCommonTranslation();
  const translateLanguage = (language: string) =>
    translateCommon('languages.' + language);
  const languages = Object.values(ExamLanguage);

  return (
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
        {translateCommon('language')}{' '}
        <span className="public-exam-session-filters__hint">
          {t('filters.selectExamDetails.required')}
        </span>
      </Typography>
      <LanguageSelect
        id="public-exam-session-filters__language-filter"
        primaryLanguages={[
          ExamLanguage.ALL,
          ExamLanguage.FIN,
          ExamLanguage.SWE,
          ExamLanguage.ENG,
        ]}
        languages={languages}
        translateLanguage={translateLanguage}
        variant={TextFieldVariant.Outlined}
        value={
          language
            ? { value: language, label: translateLanguage(language) }
            : null
        }
        onLanguageChange={(v) => {
          const language = v as ExamLanguage | undefined;
          onFilterChange({ language });
        }}
        label={t('labels.selectLanguage')}
        aria-label={t('labels.selectLanguage')}
        showError={showError && !language}
        helperText={showError && !language ? t('filters.errors.required') : ''}
      />
    </FormControl>
  );
};

const SelectExamLevel = ({
  showError,
  onFilterChange,
}: {
  showError: boolean;
  onFilterChange: (filter: Partial<ExamSessionFilters>) => void;
}) => {
  const { level } = useAppSelector(examSessionsSelector).filters;

  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  const levelToComboBoxOption = (v: ExamLevel) => ({
    value: v.toString(),
    label: translateCommon('languageLevel.' + v.toString()),
  });
  const levelValues = Object.values(ExamLevel).map(levelToComboBoxOption);

  const errorStyles = { color: 'error.main' };
  const { isPhone } = useWindowProperties();

  return (
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
        {translateCommon('level')}{' '}
        <span className="public-exam-session-filters__hint">
          {t('filters.selectExamDetails.required')}
        </span>
      </Typography>
      {isPhone ? (
        <NativeSelect
          id="public-exam-session-filters__level-filter"
          onChange={(e) => {
            const level = e.target.value as ExamLevel | undefined;
            onFilterChange({ level });
          }}
          placeholder={t('labels.selectLevel')}
          value={level ? levelToComboBoxOption(level) : null}
          values={levelValues}
        />
      ) : (
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
      )}
    </FormControl>
  );
};

export const PublicExamSessionFilters = ({
  onApplyFilters,
}: {
  onApplyFilters: () => void;
}) => {
  // I18
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  const { showDialog } = useDialog();

  const filteredExamSessions = useAppSelector(selectFilteredPublicExamSessions);
  const { language, level, excludeFullSessions, excludeNonOpenSessions } =
    useAppSelector(examSessionsSelector).filters;

  const dispatch = useAppDispatch();
  const onFilterChange = (filter: Partial<ExamSessionFilters>) => {
    dispatch(setPublicExamSessionFilters(filter));
  };

  const [showError, setShowError] = useState(false);

  const handleSubmitBtnClick = () => {
    if (!language || !level) {
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

  return (
    <div className="public-exam-session-filters">
      <div className="public-exam-session-filters__dropdown-filters-container">
        <fieldset className="public-exam-session-filters__fieldset">
          <legend>
            <Text>
              <b>{t('filters.selectExamDetails.prompt')}</b>
            </Text>
          </legend>
          <div className="public-exam-session-filters__dropdown-filters-box">
            <SelectExamLanguage
              showError={showError}
              onFilterChange={onFilterChange}
            />
            <SelectExamLevel
              showError={showError}
              onFilterChange={onFilterChange}
            />
          </div>
        </fieldset>
        <SelectMunicipality />
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
