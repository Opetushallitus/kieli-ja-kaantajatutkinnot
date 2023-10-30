import { LangSelector } from 'shared/components';
import { AppLanguage } from 'shared/enums';

import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useAppTranslation,
} from 'configs/i18n';

export const AkrLangSelector = ({ usage }: { usage: 'dialog' | 'header' }) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.header',
  });
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [t('lang.fi'), finnish],
    [t('lang.sv'), swedish],
    [t('lang.en'), english],
  ]);

  return (
    <LangSelector
      usage={usage}
      changeLang={changeLang}
      getCurrentLang={getCurrentLang}
      langDict={langDict}
      langSelectorAriaLabel={t('accessibility.langSelectorAriaLabel')}
    />
  );
};
