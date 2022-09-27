import {
  AutoCompleteComboBox,
  ComboBoxOption,
  ComboBoxProps,
} from '../../interfaces/comboBox';
import { ComboBox, sortOptionsByLabels } from '../ComboBox/ComboBox';

interface LanguageSelectProps {
  languages: Array<string>;
  excludedLanguage?: string;
  primaryLanguages?: Array<string>;
  translateLanguage: (l: string) => string;
}

export const languageToComboBoxOption = (
  translate: (l: string) => string,
  lang: string
): ComboBoxOption => ({
  label: translate(lang),
  value: lang,
});

export const LanguageSelect = ({
  languages,
  excludedLanguage,
  primaryLanguages,
  translateLanguage,
  ...rest
}: LanguageSelectProps &
  Omit<ComboBoxProps, 'values'> &
  AutoCompleteComboBox) => {
  const primaryOptions: Array<ComboBoxOption> =
    primaryLanguages
      ?.filter(
        (language) =>
          languages.includes(language) && language !== excludedLanguage
      )
      .map((language) =>
        languageToComboBoxOption(translateLanguage, language)
      ) || [];

  let secondaryOptions: Array<ComboBoxOption> = [];

  if (
    !excludedLanguage ||
    !primaryLanguages ||
    primaryLanguages.includes(excludedLanguage)
  ) {
    secondaryOptions = languages
      .filter(
        (language) =>
          language !== excludedLanguage && !primaryLanguages?.includes(language)
      )
      .map((language) => languageToComboBoxOption(translateLanguage, language));
  }

  const sortedOptions = [
    ...primaryOptions,
    ...sortOptionsByLabels(secondaryOptions),
  ];

  return <ComboBox {...rest} values={sortedOptions} />;
};
