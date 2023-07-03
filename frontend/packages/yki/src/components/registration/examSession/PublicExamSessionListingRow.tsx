import { TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { CustomButtonLink } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { storeExamSession } from 'redux/reducers/examSession';
import { resetPublicRegistration } from 'redux/reducers/registration';
import { ExamUtils } from 'utils/exam';

const RegisterToExamButton = ({
  examSession,
  registrationPeriodOpen,
  postAdmissionOpen,
}: {
  examSession: ExamSession;
  registrationPeriodOpen: boolean;
  postAdmissionOpen: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });

  const registrationOrPostAdmissionOpen =
    registrationPeriodOpen || postAdmissionOpen;
  const placesAvailable =
    (registrationPeriodOpen &&
      examSession.participants < examSession.max_participants) ||
    (postAdmissionOpen &&
      examSession.pa_participants < examSession.post_admission_quota);

  return (
    <CustomButtonLink
      color={Color.Secondary}
      variant={Variant.Outlined}
      disabled={!(placesAvailable && registrationOrPostAdmissionOpen)}
      onClick={() => {
        dispatch(storeExamSession(examSession));
        dispatch(resetPublicRegistration());
      }}
      to={AppRoutes.ExamSession.replace(/:examSessionId$/, `${examSession.id}`)}
    >
      {placesAvailable && registrationOrPostAdmissionOpen
        ? t('register')
        : !registrationOrPostAdmissionOpen
        ? t('periodNotOpen')
        : t('full')}
    </CustomButtonLink>
  );
};

export const PublicExamSessionListingRow = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });
  const now = dayjs();

  const locationInfo = ExamUtils.getLocationInfo(examSession, getCurrentLang());
  const registrationPeriodOpen = ExamUtils.isRegistrationOpen(examSession, now);
  const postAdmissionOpen = ExamUtils.isPostAdmissionOpen(examSession, now);

  const getAvailablePlacesText = () => {
    if (
      (now.isBefore(examSession.registration_start_date) ||
        registrationPeriodOpen) &&
      examSession.participants < examSession.max_participants
    ) {
      return examSession.max_participants - (examSession.participants ?? 0);
    } else if (
      postAdmissionOpen &&
      examSession.pa_participants < examSession.post_admission_quota
    ) {
      return (
        examSession.post_admission_quota - (examSession.pa_participants ?? 0)
      );
    }

    return t('full');
  };

  const availablePlacesText = getAvailablePlacesText();

  return (
    <TableRow
      className="cursor-pointer"
      data-testid={`public-exam-session__id-${examSession.id}-row`}
    >
      <TableCell>{ExamUtils.languageAndLevelText(examSession)}</TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
      </TableCell>
      <TableCell>
        {locationInfo?.name}
        <br />
        {locationInfo?.post_office}
      </TableCell>
      <TableCell>
        {ExamUtils.renderDateTime(
          examSession.registration_start_date?.hour(10)
        )}{' '}
        &ndash;{' '}
        {ExamUtils.renderDateTime(examSession.registration_end_date?.hour(16))}
      </TableCell>
      <TableCell>{examSession.exam_fee} €</TableCell>
      <TableCell>{availablePlacesText}</TableCell>
      <TableCell>
        <RegisterToExamButton
          examSession={examSession}
          registrationPeriodOpen={registrationPeriodOpen}
          postAdmissionOpen={postAdmissionOpen}
        />
      </TableCell>
    </TableRow>
  );
};
