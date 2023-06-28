import { TableCell, TableRow } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { CustomButtonLink } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes, RegistrationKind } from 'enums/app';
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

  const placesAvailable =
    (registrationPeriodOpen &&
      examSession.participants < examSession.max_participants) ||
    (postAdmissionOpen &&
      examSession.pa_participants < examSession.post_admission_quota);
  const queueAvailable = registrationPeriodOpen && !examSession.queue_full;

  return (
    <CustomButtonLink
      color={Color.Secondary}
      variant={Variant.Outlined}
      onClick={() => {
        dispatch(storeExamSession(examSession));
        dispatch(resetPublicRegistration());
      }}
      to={AppRoutes.ExamSession.replace(/:examSessionId$/, `${examSession.id}`)}
    >
      {placesAvailable
        ? t('register')
        : queueAvailable
        ? t('orderCancellationNotification')
        : t('full')}
    </CustomButtonLink>
  );
};

const RegistrationUnavailableText = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationUnavailable',
  });
  const now = dayjs();
  const { start, end } =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  if (now.isBefore(start)) {
    return (
      <>
        {t('admissionOpensOn', {
          startDate: DateUtils.formatOptionalDate(start),
        })}
      </>
    );
  } else if (now.isAfter(end)) {
    return <>{t('admissionPeriodIsClosed')}</>;
  } else {
    return <>{t('examSessionIsFull')}</>;
  }
};

const renderAdmissionPeriod = ({
  start,
  end,
}: {
  start: Dayjs;
  end: Dayjs;
}) => {
  return `${ExamUtils.renderDateTime(start)} — ${ExamUtils.renderDateTime(
    end
  )}`;
};

const AdmissionPeriodText = ({ examSession }: { examSession: ExamSession }) => {
  const translateCommon = useCommonTranslation();
  const relevantPeriod =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  if (relevantPeriod.kind === RegistrationKind.Admission) {
    return <>{renderAdmissionPeriod(relevantPeriod)}</>;
  } else {
    return (
      <>
        {translateCommon('postAdmission')}:<br />
        {renderAdmissionPeriod(relevantPeriod)}
      </>
    );
  }
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
  const relevantPeriod =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  const getAvailablePlacesText = () => {
    if (
      relevantPeriod.kind === RegistrationKind.Admission &&
      examSession.participants < examSession.max_participants
    ) {
      return examSession.max_participants - (examSession.participants ?? 0);
    } else if (
      relevantPeriod.kind === RegistrationKind.PostAdmission &&
      examSession.pa_participants < examSession.post_admission_quota
    ) {
      return (
        examSession.post_admission_quota - (examSession.pa_participants ?? 0)
      );
    }

    return t('full');
  };

  const availablePlacesText = getAvailablePlacesText();
  const registerActionAvailable =
    examSession.open &&
    ((registrationPeriodOpen &&
      examSession.participants < examSession.max_participants) ||
      (registrationPeriodOpen && !examSession.queue_full) ||
      (postAdmissionOpen &&
        examSession.pa_participants < examSession.post_admission_quota));

  return (
    <TableRow data-testid={`public-exam-session__id-${examSession.id}-row`}>
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
        <AdmissionPeriodText examSession={examSession} />
      </TableCell>
      <TableCell>{examSession.exam_fee} €</TableCell>
      <TableCell>{availablePlacesText}</TableCell>
      <TableCell>
        {registerActionAvailable ? (
          <RegisterToExamButton
            examSession={examSession}
            registrationPeriodOpen={registrationPeriodOpen}
            postAdmissionOpen={postAdmissionOpen}
          />
        ) : (
          <RegistrationUnavailableText examSession={examSession} />
        )}
      </TableCell>
    </TableRow>
  );
};
