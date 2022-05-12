import { CustomSkeleton, H2 } from 'shared/components';

import { AddMeetingDate } from 'components/clerkTranslator/meetingDates/AddMeetingDate';
import { MeetingDatesListing } from 'components/clerkTranslator/meetingDates/MeetingDatesListing';
import { MeetingDatesToggleFilters } from 'components/clerkTranslator/meetingDates/MeetingDatesToggleFilters';
import { useCommonTranslation } from 'configs/i18n';
import { SkeletonVariant } from 'enums/app';

export const MeetingDatesPageSkeleton = () => {
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return (
    <>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <H2>{translateCommon('register')}</H2>
      </CustomSkeleton>
      <CustomSkeleton
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <MeetingDatesToggleFilters />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <AddMeetingDate />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <MeetingDatesListing />
      </CustomSkeleton>
    </>
  );
};
