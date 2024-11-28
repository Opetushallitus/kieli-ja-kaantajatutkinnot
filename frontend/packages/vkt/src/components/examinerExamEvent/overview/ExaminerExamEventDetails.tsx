import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { CustomButtonLink, ExtLink, H2, H3, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ExaminerEnrollmentListing } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListing';
import {
  useClerkTranslation,
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes, EnrollmentAppointmentStatus } from 'enums/app';
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

  // I18n
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview',
  });

  const { oid } = useParams();

  if (!examEvent || !oid) {
    return null;
  }

  const { enrollments } = examEvent;

  return (
    <>
      <div className="columns margin-top-lg flex-end">
        <CustomButtonLink
          data-testid="clerk-exam-event-overview__exam-event-details__edit-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          startIcon={<EditIcon />}
          to={AppRoutes.ExaminerExamEventUpdatePage.replace(
            /:oid/,
            oid,
          ).replace(/:examEventId/, `${examEvent.id}`)}
        >
          {translateCommon('edit')}
        </CustomButtonLink>
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
        status={EnrollmentAppointmentStatus.WAITING_AUTHENTICATION}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.CANCELED}
      />
      {enrollments.length > 0 && (
        <div className="columns gapped margin-top-xxl flex-end">
          <ExtLink
            href={`${APIEndpoints.ExaminerExamEvent.replace(/:oid/, oid)}/${
              examEvent.id
            }/excel`}
            text={t('examEventDetails.downloadExcel')}
            startIcon={<DownloadIcon />}
            data-testid="examiner-exam-event-overview-page__download-excel-button"
          />
        </div>
      )}
    </>
  );
};
