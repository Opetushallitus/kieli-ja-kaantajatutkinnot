import { OphLanguage } from '@opetushallitus/oph-design-system';
import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from 'shared/enums';

import { publicThemeOverrides } from 'ophTheme/OphTheme';

const themeLanguages: Record<AppLanguage, OphLanguage> = {
  [AppLanguage.Finnish]: 'fi',
  [AppLanguage.Swedish]: 'sv',
  [AppLanguage.English]: 'en',
};

export const YkiThemeProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const language = themeLanguages[i18n.language as AppLanguage] || 'fi';

  return (
    <OphThemeProvider
      lang={language}
      variant="opintopolku"
      overrides={publicThemeOverrides}
    >
      {children}
    </OphThemeProvider>
  );
};
