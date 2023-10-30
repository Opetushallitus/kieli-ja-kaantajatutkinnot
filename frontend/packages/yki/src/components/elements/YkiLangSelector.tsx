import { LangSelector } from 'shared/components';
import { AppLanguage } from 'shared/enums';

import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useCommonTranslation,
} from 'configs/i18n';

export const YkiLangSelector = ({ usage }: { usage: 'dialog' | 'header' }) => {
  const translateCommon = useCommonTranslation();
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
    [translateCommon('header.lang.en'), english],
  ]);

  return (
    <LangSelector
      usage={usage}
      changeLang={changeLang}
      getCurrentLang={getCurrentLang}
      langDict={langDict}
      langSelectorAriaLabel={translateCommon(
        'header.accessibility.langSelectorAriaLabel'
      )}
    />
  );
};
