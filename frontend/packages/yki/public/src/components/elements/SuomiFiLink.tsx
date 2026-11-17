import { OphLink } from '@opetushallitus/oph-design-system';

import { useCommonTranslation } from 'configs/i18n';

export const SuomiFiLink = () => {
  const translateCommon = useCommonTranslation();

  return (
    <OphLink href={translateCommon('suomiFiLink.url')} target="_blank">
      {translateCommon('suomiFiLink.label')}
    </OphLink>
  );
};
