import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

export const PublicExamDetailsPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}></Skeleton>
      <Skeleton
        className="full-max-width half-height margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      ></Skeleton>
      <Skeleton
        className="full-max-width margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      ></Skeleton>
    </>
  );
};
