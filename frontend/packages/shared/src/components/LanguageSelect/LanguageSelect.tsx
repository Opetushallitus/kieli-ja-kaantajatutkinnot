import {
  AutoCompleteComboBox,
  ComboBoxOption,
  ComboBoxProps,
} from '../../interfaces/comboBox';
import { ComboBox, sortOptionsByLabels } from '../ComboBox/ComboBox';

interface LanguageSelectProps {
  excludedLanguage: string | undefined;
  languages: Array<string>;
  translateLanguage: (l: string) => string;
}

const primaryLanguages = ['FI', 'SV', 'SEIN', 'SEKO', 'SEPO'];

export const languageToComboBoxOption = (
  translate: (l: string) => string,
  lang: string
): ComboBoxOption => ({
  label: translate(lang),
  value: lang,
});

export const LanguageSelect = ({
  excludedLanguage,
  languages,
  translateLanguage,
  ...rest
}: LanguageSelectProps &
  Omit<ComboBoxProps, 'values'> &
  AutoCompleteComboBox) => {
  // Helpers
  const filterSelectedLang = (
    excludedLanguage: string | undefined,
    valuesArray: Array<ComboBoxOption>,
    primaryLanguages: string[]
  ): Array<ComboBoxOption> => {
    const valuesArrayWithoutSelectedLang = valuesArray.filter(
      ({ value }) => value !== excludedLanguage
    );
    if (excludedLanguage && !primaryLanguages.includes(excludedLanguage)) {
      return valuesArrayWithoutSelectedLang.filter(({ value }) =>
        primaryLanguages.includes(value)
      );
    }

    return valuesArrayWithoutSelectedLang;
  };

  const values = languages.map((l) =>
    languageToComboBoxOption(translateLanguage, l)
  );

  const filteredValuesArray = filterSelectedLang(
    excludedLanguage,
    values,
    primaryLanguages
  );
  const optionValuesToShow = sortOptionsByLabels(filteredValuesArray);
  // Sort option value pairs into order set in primaryOptions parameter
  const primaryValues = optionValuesToShow
    .filter(({ value }) => {
      return primaryLanguages.indexOf(value) >= 0;
    })
    .sort((a, b) => {
      return (
        primaryLanguages.indexOf(a.value) - primaryLanguages.indexOf(b.value)
      );
    });

  // Merge sorted primaryOptions and sorted values
  const valuesToShow = [
    ...primaryValues,
    ...optionValuesToShow.filter((value) => !primaryValues.includes(value)),
  ];

  return <ComboBox {...rest} values={valuesToShow} />;
};
