import { CustomSkeleton, H2 } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { AddMeetingDate } from 'components/meetingDate/AddMeetingDate';
import { MeetingDatesListing } from 'components/meetingDate/MeetingDatesListing';
import { MeetingDatesToggleFilters } from 'components/meetingDate/MeetingDatesToggleFilters';
import { useCommonTranslation } from 'configs/i18n';

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
