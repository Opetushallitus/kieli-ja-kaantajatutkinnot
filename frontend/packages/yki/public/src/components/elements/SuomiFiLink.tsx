import { WebLink } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

export const SuomiFiLink = () => {
  const translateCommon = useCommonTranslation();

  return (
    <WebLink
      href={translateCommon('suomiFiLink.url')}
      label={translateCommon('suomiFiLink.label')}
    />
  );
};
