import { Skeleton, SkeletonProps } from '@mui/material';
import { FC } from 'react';

import { useCommonTranslation } from 'configs/i18n';

export const CustomSkeleton: FC<SkeletonProps> = ({ ...props }) => {
  const translateCommon = useCommonTranslation();

  return <Skeleton {...props} aria-label={translateCommon('loadingContent')} />;
};
