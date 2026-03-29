import { getCurrentLang } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { nationalitiesSelector } from 'redux/selectors/nationalities';

export const useCountryOptions = () => {
  const lang = getCurrentLang();
  const { nationalities } = useAppSelector(nationalitiesSelector);

  const options = [...nationalities]
    .filter((v) => v.language === lang)
    .map((country) => ({ label: country.name, value: country.code }));
  options.sort((a, b) => (a.label < b.label ? -1 : 1));

  return options;
};
