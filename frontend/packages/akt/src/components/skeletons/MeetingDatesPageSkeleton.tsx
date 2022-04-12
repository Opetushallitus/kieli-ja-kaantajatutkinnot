import { AddMeetingDate } from 'components/clerkTranslator/meetingDates/AddMeetingDate';
import { MeetingDatesListing } from 'components/clerkTranslator/meetingDates/MeetingDatesListing';
import { MeetingDatesToggleFilters } from 'components/clerkTranslator/meetingDates/MeetingDatesToggleFilters';
import { CustomSkeleton } from 'components/elements/CustomSkeleton';
import { H2 } from 'components/elements/Text';
import { useCommonTranslation } from 'configs/i18n';
import { SkeletonVariant } from 'enums/app';

export const MeetingDatesPageSkeleton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
      >
        <H2>{translateCommon('register')}</H2>
      </CustomSkeleton>
      <CustomSkeleton variant={SkeletonVariant.Rectangular}>
        <MeetingDatesToggleFilters />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
      >
        <AddMeetingDate />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
      >
        <MeetingDatesListing />
      </CustomSkeleton>
    </>
  );
};
