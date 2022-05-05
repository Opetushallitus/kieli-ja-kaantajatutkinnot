import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { SelectChangeEvent } from '@mui/material';
import { FC } from 'react';
import { CustomSelect } from 'shared/components';
import { TextFieldVariant } from 'shared/enums';

import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useAppTranslation,
} from 'configs/i18n';

export const LangSelector: FC = () => {
  const { t } = useAppTranslation({ keyPrefix: 'otr.component.header' });
  const [finnish, swedish, english] = getSupportedLangs();

  const values = new Map<string, string>([
    [t('lang.fi'), finnish],
    [t('lang.sv'), swedish],
    [t('lang.en'), english],
  ]);

  const handleLangChange = (event: SelectChangeEvent) => {
    changeLang(event.target.value);
  };

  return (
    <div className="lang-selector">
      <LanguageOutlinedIcon className="lang-selector__icon" fontSize="small" />
      <CustomSelect
        disableUnderline
        values={values}
        aria-label={t('accessibility.langSelectorAriaLabel')}
        variant={TextFieldVariant.Standard}
        value={getCurrentLang()}
        onChange={handleLangChange}
        className="lang-selector__select"
        data-testid="lang-selector"
      />
    </div>
  );
};
