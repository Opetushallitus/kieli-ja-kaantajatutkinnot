import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { AuthorisationDetails } from 'components/clerkTranslator/overview/AuthorisationDetails';
import { ClerkTranslatorDetails } from 'components/clerkTranslator/overview/ClerkTranslatorDetails';
import { TopControls } from 'components/clerkTranslator/overview/TopControls';

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
