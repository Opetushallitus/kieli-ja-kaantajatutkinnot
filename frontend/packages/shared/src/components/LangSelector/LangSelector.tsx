import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { Divider } from '@mui/material';
import { TFunction } from 'i18next';
import { FC, Fragment } from 'react';

import { AppLanguage } from '../../enums';
import { CustomButton } from '../CustomButton/CustomButton';
import { Text } from '../Text/Text';

import './LangSelector.scss';

interface LangSelectorProps {
  changeLang: (language: AppLanguage) => Promise<TFunction>;
  getCurrentLang: () => AppLanguage;
  langDict: Map<string, AppLanguage>;
  langSelectorAriaLabel: string;
}

export const LangSelector: FC<LangSelectorProps> = ({
  changeLang,
  getCurrentLang,
  langDict,
  langSelectorAriaLabel,
}) => {
  const currentLang = getCurrentLang();
  const languageEntries = Array.from(langDict.entries());

  return (
    <nav className="lang-selector" aria-label={langSelectorAriaLabel}>
      <LanguageOutlinedIcon className="lang-selector__icon" fontSize="small" />
      {languageEntries.map((entry, idx) => {
        const [languageName, appLanguage] = entry;
        const addDivider = idx < languageEntries.length - 1;
        const isLanguageSelected = currentLang === appLanguage;

        return (
          <Fragment key={`lang-select_${appLanguage}`}>
            <CustomButton
              onClick={() => changeLang(appLanguage)}
              aria-current={isLanguageSelected ? 'true' : 'false'}
              lang={appLanguage}
            >
              <Text>
                {isLanguageSelected ? <b>{languageName}</b> : languageName}
              </Text>
            </CustomButton>
            {addDivider && (
              <Divider orientation="vertical" variant="middle" flexItem />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
};
