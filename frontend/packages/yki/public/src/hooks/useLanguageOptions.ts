import { getCurrentLang } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { languagesSelector } from 'redux/selectors/languages';
import { codeElementToComboBoxOption } from 'utils/autocomplete';

export const useLanguageOptions = () => {
  const lang = getCurrentLang();
  const { languages } = useAppSelector(languagesSelector);

  const options = [...languages]
    .filter((v) => v.language === lang)
    .map(codeElementToComboBoxOption);
  options.sort((a, b) => (a.label < b.label ? -1 : 1));

  return options;
};
