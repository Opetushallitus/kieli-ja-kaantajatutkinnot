import { useWindowProperties } from '../../hooks/useWindowProperties/useWindowProperties';
import {
  AutoCompleteComboBox,
  ComboBoxOption,
  ComboBoxProps,
} from '../../interfaces/comboBox';
import { ComboBox, sortOptionsByLabels } from '../ComboBox/ComboBox';
import { NativeSelect } from '../NativeSelect/NativeSelect';

export const languageToComboBoxOption = (
  translate: (l: string) => string,
  lang: string
): ComboBoxOption => ({
  label: translate(lang),
  value: lang,
});

interface LanguageSelectProps {
  languages: Array<string>;
  primaryLanguages?: Array<string>;
  excludedLanguage?: string;
  translateLanguage: (l: string) => string;
  onLanguageChange: (l?: string) => void;
}

/**
 * Returns ComboBox with values as language options.
 *
 * The first selectable options are `primaryLanguages` that are also part of `languages`.
 * The remaining options are the rest of the `languages` sorted by their display values.
 * If `excludedLanguage` is also provided, that language is filtered out of the result.
 *
 * @param languages - selectable language options
 * @param primaryLanguages - first language options
 * @param excludedLanguage - excluded language option
 * @param translateLanguage
 * @param rest
 * @constructor
 */
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
        languageToComboBoxOption(translateLanguage, language)
      ) || [];

  const secondaryOptions: Array<ComboBoxOption> = includedLanguages
    .filter((language) => !primaryLanguages?.includes(language))
    .map((language) => languageToComboBoxOption(translateLanguage, language));

  const sortedOptions = [
    ...primaryOptions,
    ...sortOptionsByLabels(secondaryOptions),
  ];

  const { isPhone } = useWindowProperties();
  if (isPhone) {
    return (
      <NativeSelect
        placeholder={rest.label || ''}
        values={sortedOptions}
        value={value}
        onChange={(e) => onLanguageChange(e.target.value as string)}
        helperText={helperText}
        showError={showError}
      />
    );
  }

  return (
    <ComboBox
      {...rest}
      onChange={(_, v) => onLanguageChange(v?.value)}
      values={sortedOptions}
      value={value}
      helperText={helperText}
      showError={showError}
    />
  );
};
