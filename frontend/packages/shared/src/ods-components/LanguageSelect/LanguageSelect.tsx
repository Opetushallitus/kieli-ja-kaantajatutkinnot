import {
  AutoCompleteComboBox,
  ComboBoxOption,
  ComboBoxProps,
} from '../../interfaces';
import { ComboBox, sortOptionsByLabels } from '../ComboBox/ComboBox';

export const languageToComboBoxOption = (
  translate: (language: string) => string,
  language: string,
): ComboBoxOption => ({
  label: translate(language),
  value: language,
});

interface LanguageSelectProps {
  languages: Array<string>;
  primaryLanguages?: Array<string>;
  excludedLanguage?: string;
  translateLanguage: (language: string) => string;
  onLanguageChange: (language?: string) => void;
}

export const LanguageSelect = ({
  languages,
  primaryLanguages,
  excludedLanguage,
  translateLanguage,
  onLanguageChange,
  helperText,
  showError,
  value,
  ...rest
}: LanguageSelectProps &
  Omit<ComboBoxProps, 'values'> &
  Omit<AutoCompleteComboBox, 'onChange'>) => {
  const includedLanguages = excludedLanguage
    ? languages.filter((language) => language !== excludedLanguage)
    : languages;

  const primaryOptions: Array<ComboBoxOption> =
    primaryLanguages
      ?.filter((language) => includedLanguages.includes(language))
      .map((language) =>
        languageToComboBoxOption(translateLanguage, language),
      ) || [];

  const secondaryOptions: Array<ComboBoxOption> = includedLanguages
    .filter((language) => !primaryLanguages?.includes(language))
    .map((language) => languageToComboBoxOption(translateLanguage, language));

  const sortedOptions = [
    ...primaryOptions,
    ...sortOptionsByLabels(secondaryOptions),
  ];

  return (
    <ComboBox
      {...rest}
      onChange={onLanguageChange}
      values={sortedOptions}
      value={value}
      helperText={helperText}
      showError={showError}
    />
  );
};
