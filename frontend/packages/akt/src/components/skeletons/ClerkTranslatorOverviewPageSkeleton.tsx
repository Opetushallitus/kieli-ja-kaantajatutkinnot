import { Skeleton } from '@mui/material';

import { AuthorisationDetails } from 'components/clerkTranslator/overview/AuthorisationDetails';
import { ClerkTranslatorDetails } from 'components/clerkTranslator/overview/ClerkTranslatorDetails';
import { TopControls } from 'components/clerkTranslator/overview/TopControls';
import { SkeletonVariant } from 'enums/app';

export const ClerkTranslatorOverviewPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}>
        <TopControls />
      </Skeleton>
      <Skeleton
        className="full-max-width half-height margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      >
        <ClerkTranslatorDetails />
      </Skeleton>
      <Skeleton
        className="full-max-width margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      >
        <AuthorisationDetails />
      </Skeleton>
    </>
  );
};
