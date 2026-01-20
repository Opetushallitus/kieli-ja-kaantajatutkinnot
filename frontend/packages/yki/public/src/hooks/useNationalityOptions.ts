import { getCurrentLang } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { nationalityToComboBoxOption } from 'utils/autocomplete';

export const useNationalityOptions = () => {
  const lang = getCurrentLang();
  const { nationalities } = useAppSelector(nationalitiesSelector);

  const options = [...nationalities]
    .filter((v) => v.language === lang)
    .map(nationalityToComboBoxOption);
  options.sort((a, b) => (a.label < b.label ? -1 : 1));

  return options;
};
