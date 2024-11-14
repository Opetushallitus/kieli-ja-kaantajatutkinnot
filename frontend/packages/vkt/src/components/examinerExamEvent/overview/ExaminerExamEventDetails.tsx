import EditIcon from '@mui/icons-material/Edit';
import { FC } from 'react';
import { CustomButton, H2, H3, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ExaminerEnrollmentListing } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListing';
import {
  useClerkTranslation,
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { EnrollmentAppointmentStatus } from 'enums/app';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';
import { examinerExamEventOverviewSelector } from 'redux/selectors/examinerExamEventOverview';
import { DateTimeUtils } from 'utils/dateTime';

interface EnrollmentListProps {
  enrollments: Array<ClerkEnrollmentAppointment>;
  status: EnrollmentAppointmentStatus;
}

const enrollmentFilter = (
  enrollments: Array<ClerkEnrollmentAppointment>,
  status: EnrollmentAppointmentStatus,
): Array<ClerkEnrollmentAppointment> =>
  enrollments.filter((e: ClerkEnrollmentAppointment) => e.status === status);

const EnrollmentList: FC<EnrollmentListProps> = ({ enrollments, status }) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview.examEventListingHeader',
  });

  const filteredEnrollments = enrollmentFilter(enrollments, status);

  return (
    <>
      {filteredEnrollments.length > 0 && (
        <div className="rows margin-top-xxl">
          <H2
            data-testid={`clerk-exam-event-overview-page__enrollment-list-${status}__header`}
          >{`${t(status)}: ${filteredEnrollments.length}`}</H2>
          <div className="margin-top-sm">
            <ExaminerEnrollmentListing enrollments={filteredEnrollments} />
          </div>
        </div>
      )}
    </>
  );
};

export const ExaminerExamEventDetails = () => {
  // Redux
  const { examEvent } = useAppSelector(examinerExamEventOverviewSelector);
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();

  if (!examEvent) {
    return null;
  }

  const { enrollments } = examEvent;

  const onEdit = () => {
    // TODO navigate to edit view
  };

  return (
    <>
      <div className="columns margin-top-lg flex-end">
        <CustomButton
          data-testid="clerk-exam-event-overview__exam-event-details__edit-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          {translateCommon('edit')}
        </CustomButton>
      </div>
      <div className="rows">
        <div className="grid-3-columns gapped">
          <div className="rows grow gapped-sm margin-top-lg">
            <H3>Kieli ja taso</H3>
            <Text>{translateCommon(`examLanguage.${examEvent.language}`)}</Text>
          </div>
          <div className="rows grow gapped-sm margin-top-lg">
            <H3>Tutkintopäivä</H3>
            <Text>{DateTimeUtils.renderDateTime(examEvent.date)}</Text>
          </div>
          <div className="rows grow gapped-sm margin-top-lg">
            <H3>Tutkintopaikka</H3>
            <Text>{translateMunicipality(examEvent.municipality.code)}</Text>
          </div>
          <div className="rows grow gapped-sm margin-top-lg">
            <H3>Osoitetiedot</H3>
            <Text>{examEvent.location}</Text>
          </div>
          <div className="rows grow gapped-sm margin-top-lg">
            <H3>Paikkojen lukumäärä</H3>
            <Text>{examEvent.maxParticipants}</Text>
          </div>
          <div className="rows grow gapped-sm margin-top-lg">
            <H3>Ilmoittautuminen sulkeutuu</H3>
            <Text>
              {DateTimeUtils.renderDateTime(examEvent.registrationCloses)}
            </Text>
          </div>
        </div>
      </div>
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.COMPLETED}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.AWAITING_PAYMENT}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={
          EnrollmentAppointmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
        }
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.WAITING_AUTHENTICATION}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.CANCELED}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.CANCELED_UNFINISHED_ENROLLMENT}
      />
    </>
  );
};
