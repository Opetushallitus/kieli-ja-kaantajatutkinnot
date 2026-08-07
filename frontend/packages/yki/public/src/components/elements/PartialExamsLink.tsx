import { WebLink } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

export const PartialExamsLink = () => {
  const translateCommon = useCommonTranslation();

  return (
    <WebLink
      href={translateCommon('partialExamsLink.url')}
      label={translateCommon('partialExamsLink.label')}
    />
  );
};
