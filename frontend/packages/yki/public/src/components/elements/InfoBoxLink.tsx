import { WebLink } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

export const InfoBoxLink = () => {
  const translateCommon = useCommonTranslation();

  return (
    <WebLink
      href={translateCommon('infoBoxLink.url')}
      label={translateCommon('infoBoxLink.label')}
    />
  );
};
