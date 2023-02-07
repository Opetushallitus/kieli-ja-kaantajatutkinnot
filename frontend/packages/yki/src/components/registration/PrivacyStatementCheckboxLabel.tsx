import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Trans } from 'react-i18next';
import { ExtLink } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const PrivacyStatementCheckboxLabel = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.register.privacyStatement',
  });

  return (
    <Trans t={t} i18nKey="label">
      <ExtLink
        className="public-registration__grid__preview__privacy-statement-checkbox-label__link"
        text={t('linkLabel')}
        href={AppRoutes.PrivacyPolicyPage}
        endIcon={<OpenInNewIcon />}
        aria-label={t('ariaLabel')}
      />
    </Trans>
  );
};
