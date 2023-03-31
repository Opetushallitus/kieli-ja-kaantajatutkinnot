import { TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { storeExamSession } from 'redux/reducers/examSession';
import { ExamUtils } from 'utils/exam';

const RegisterToExamButton = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });
  const now = dayjs();
  const registrationPeriodOpen = ExamUtils.isRegistrationOpen(examSession, now);
  const postAdmissionOpen = ExamUtils.isPostAdmissionOpen(examSession, now);

  const registrationOrPostAdmissionOpen =
    registrationPeriodOpen || postAdmissionOpen;
  const placesAvailable =
    (registrationPeriodOpen &&
      examSession.participants < examSession.max_participants) ||
    (postAdmissionOpen &&
      examSession.pa_participants < examSession.post_admission_quota);

  // TODO Instead of disabling button, perhaps style it differently and indicate error when clicking.
  return (
    <CustomButton
      color={Color.Secondary}
      variant={Variant.Outlined}
      disabled={!(placesAvailable && registrationOrPostAdmissionOpen)}
      onClick={() => {
        dispatch(storeExamSession(examSession));
        navigate(
          AppRoutes.ExamSession.replace(/:examSessionId$/, `${examSession.id}`)
        );
      }}
    >
      {placesAvailable && registrationOrPostAdmissionOpen
        ? t('register')
        : !registrationOrPostAdmissionOpen
        ? t('periodNotOpen')
        : t('full')}
    </CustomButton>
  );
};

export const PublicExamSessionListingRow = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const locationInfo = ExamUtils.getLocationInfo(examSession, getCurrentLang());

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
        <b>{locationInfo?.post_office}</b>
      </TableCell>
      <TableCell>
        {ExamUtils.renderDateTime(
          examSession.registration_start_date?.hour(10)
        )}{' '}
        &ndash;{' '}
        {ExamUtils.renderDateTime(examSession.registration_end_date?.hour(16))}
      </TableCell>
      <TableCell>{examSession.exam_fee} €</TableCell>
      <TableCell>
        {examSession.max_participants - (examSession.participants ?? 0)}
      </TableCell>
      <TableCell>
        <RegisterToExamButton examSession={examSession} />
      </TableCell>
    </TableRow>
  );
};
