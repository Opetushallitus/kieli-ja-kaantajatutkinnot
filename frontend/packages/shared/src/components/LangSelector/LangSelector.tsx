import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { SelectChangeEvent } from '@mui/material';
import { TFunction } from 'i18next';
import { FC } from 'react';

import { AppLanguage, TextFieldVariant } from '../../enums';
import { CustomSelect } from '../CustomSelect/CustomSelect';

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
  const handleLangChange = (event: SelectChangeEvent) => {
    const language = event.target.value as AppLanguage;
    changeLang(language);
  };

  return (
    <div className="lang-selector">
      <LanguageOutlinedIcon className="lang-selector__icon" fontSize="small" />
      <CustomSelect
        disableUnderline
        values={langDict}
        aria-label={langSelectorAriaLabel}
        variant={TextFieldVariant.Standard}
        value={getCurrentLang()}
        onChange={handleLangChange}
        className="lang-selector__select"
        data-testid="lang-selector"
      />
    </div>
  );
};
