import {
  CustomNativeSelectProps,
  NativeSelect,
} from '../../components/NativeSelect/NativeSelect';
import { useWindowProperties } from '../../hooks';
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

  const { isPhone } = useWindowProperties();
  if (isPhone) {
    const nativeSelectProps: CustomNativeSelectProps = {
      placeholder: rest.label || '',
      values: sortedOptions,
      value: value || undefined,
      helperText,
      showError,
      'data-testid': rest['data-testid'],
    };
    for (const prop in rest) {
      if (prop in nativeSelectProps) {
        nativeSelectProps[prop as keyof CustomNativeSelectProps] =
          rest[prop as keyof typeof rest];
      }
    }

    return (
      <NativeSelect
        {...nativeSelectProps}
        onChange={(event) => onLanguageChange(event.target.value as string)}
      />
    );
  }

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
