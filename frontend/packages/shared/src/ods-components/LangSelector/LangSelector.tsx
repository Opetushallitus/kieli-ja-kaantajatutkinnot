import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { Box, Divider } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { TFunction } from 'i18next';
import { Fragment } from 'react';

import { AppLanguage } from '../../enums';

interface LangSelectorProps {
  changeLang: (language: AppLanguage) => Promise<TFunction>;
  getCurrentLang: () => AppLanguage;
  langDict: Map<string, AppLanguage>;
  langSelectorAriaLabel: string;
}

export const LangSelector = ({
  changeLang,
  getCurrentLang,
  langDict,
  langSelectorAriaLabel,
}: LangSelectorProps) => {
  const languages = Array.from(langDict.entries());

  return (
    <Box
      component="nav"
      aria-label={langSelectorAriaLabel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        color: 'inherit',
      }}
    >
      <LanguageOutlinedIcon fontSize="small" />
      {languages.map(([name, language], index) => (
        <Fragment key={language}>
          <OphButton
            onClick={() => changeLang(language)}
            aria-current={getCurrentLang() === language ? 'true' : undefined}
            lang={language}
            color="inherit"
            variant="text"
            sx={{
              minWidth: 0,
              padding: '0.5rem',
              textTransform: 'none',
              fontWeight: getCurrentLang() === language ? 700 : 400,
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            {name}
          </OphButton>
          {index < languages.length - 1 && (
            <Divider
              orientation="vertical"
              flexItem
              aria-hidden="true"
              sx={{ borderColor: 'currentColor', marginBlock: '0.5rem' }}
            />
          )}
        </Fragment>
      ))}
    </Box>
  );
};
