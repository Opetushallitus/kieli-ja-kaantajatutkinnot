import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { SelectChangeEvent } from '@mui/material';
import { TFunction } from 'i18next';
import { FC } from 'react';

import { TextFieldVariant } from '../../enums';
import { CustomSelect } from '../CustomSelect/CustomSelect';

import './LangSelector.scss';

interface LangSelectorProps {
  changeLang: (language: string) => Promise<TFunction>;
  getCurrentLang: () => string;
  langDict: Map<string, string>;
  langSelectorAriaLabel: string;
}

export const LangSelector: FC<LangSelectorProps> = ({
  changeLang,
  getCurrentLang,
  langDict,
  langSelectorAriaLabel,
}) => {
  const handleLangChange = (event: SelectChangeEvent) => {
    changeLang(event.target.value);
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
