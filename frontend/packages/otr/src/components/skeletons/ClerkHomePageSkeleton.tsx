import { CustomSkeleton } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

// TODO Implement skeleton

export const ClerkHomePageSkeleton = () => {
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return <CustomSkeleton ariaLabel={ariaLabel} />;
};
