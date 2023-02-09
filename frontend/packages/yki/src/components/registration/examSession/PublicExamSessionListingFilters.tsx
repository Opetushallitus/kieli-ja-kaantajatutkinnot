import SearchIcon from '@mui/icons-material/Search';
//import { Box, TextField } from '@mui/material';
import { useRef, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomButton,
  H3,
  LanguageSelect,
} from 'shared/components';
import { Color, TextFieldVariant, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLanguage, ExamLevel } from 'enums/app';

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
  const [language, setLanguage] = useState<string | undefined>('fin');
  const [level, setLevel] = useState<ExamLevel | undefined>(undefined);
  const [municipality, setMunicipality] = useState<string | undefined>(
    undefined
  );

  // TODO FIXME Get these from redux state
  const municipalities = ['Helsinki', 'Vantaa', 'Porvoo'];

  // TODO Fixme
  const searchButtonDisabled = false;
  const handleEmptyBtnClick = scrollToSearch;
  // eslint-disable-next-line no-console
  const handleSearchBtnClick = () => console.log('empty btn clicked..');
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
      <div className="public-exam-session-filters__filter-box">
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
              setLanguage(v?.value);
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
              if (v?.value) {
                setLevel(v?.value as ExamLevel);
              } else {
                setLevel(undefined);
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
              setMunicipality(v?.value);
            }}
            label={t('labels.selectMunicipality')}
            aria-label={t('labels.selectMunicipality')}
          />
        </div>
      </div>
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
