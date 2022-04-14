import { Skeleton, SkeletonProps } from '@mui/material';
import { FC } from 'react';

type CustomSkeletonProps = SkeletonProps & {
  ariaLabel: string;
};

export const CustomSkeleton: FC<CustomSkeletonProps> = ({
  ariaLabel,
  ...props
}) => {
  return <Skeleton {...props} aria-label={ariaLabel} />;
};
