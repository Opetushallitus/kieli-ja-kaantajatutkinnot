import { TableCell, TableRow, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { CustomButtonLink, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes, RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';
import { storeExamSession } from 'redux/reducers/examSession';
import { resetPublicRegistration } from 'redux/reducers/registration';
import { ExamUtils } from 'utils/exam';

const RegisterToExamButton = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });

  const { participants, quota, open, kind } =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  const placesAvailable = participants < quota;
  const queueAvailable =
    open && kind === RegistrationKind.Admission && !examSession.queue_full;

  return (
    <CustomButtonLink
      className="public-exam-session-listing__register-to-exam-button"
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

const PublicExamSessionListingCellsForDesktop = ({
  examSession,
  locationInfo,
  availablePlacesText,
  registerActionAvailable,
}: {
  examSession: ExamSession;
  locationInfo: ExamSessionLocation;
  availablePlacesText: string;
  registerActionAvailable?: boolean;
}) => {
  return (
    <>
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
          <RegisterToExamButton examSession={examSession} />
        ) : (
          <RegistrationUnavailableText examSession={examSession} />
        )}
      </TableCell>
    </>
  );
};

const PublicExamSessionListingCellsForPhone = ({
  examSession,
  locationInfo,
  availablePlacesText,
  registerActionAvailable,
}: {
  examSession: ExamSession;
  locationInfo: ExamSessionLocation;
  availablePlacesText: string;
  registerActionAvailable?: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <TableCell>
      <div className="rows grow gapped-xs">
        <Typography variant="h2" component="p">
          {ExamUtils.languageAndLevelText(examSession)}
        </Typography>
        <Text>
          <b>{translateCommon('examDate')}</b>
          <br />
          {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
        </Text>
        <Text>
          <b>{translateCommon('institution')}</b>
          <br />
          {locationInfo?.name}
          <br />
          {locationInfo?.post_office}
        </Text>
        <Text>
          <b>{translateCommon('registrationPeriod')}</b>
          <br />
          <AdmissionPeriodText examSession={examSession} />
        </Text>
        <Text>
          <b>{translateCommon('price')}</b>
          <br />
          {examSession.exam_fee} €
        </Text>
        <Text>
          <b>{translateCommon('placesAvailable')}</b>
          <br />
          {availablePlacesText}
        </Text>
        {registerActionAvailable ? (
          <RegisterToExamButton examSession={examSession} />
        ) : (
          <Text>
            <RegistrationUnavailableText examSession={examSession} />
          </Text>
        )}
      </div>
    </TableCell>
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
  const { isPhone } = useWindowProperties();

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
      return `${
        examSession.max_participants - (examSession.participants ?? 0)
      }`;
    } else if (
      relevantPeriod.kind === RegistrationKind.PostAdmission &&
      examSession.pa_participants < examSession.post_admission_quota
    ) {
      return `${
        examSession.post_admission_quota - (examSession.pa_participants ?? 0)
      }`;
    }

    return '' + t('full');
  };

  const availablePlacesText = getAvailablePlacesText();
  const registerActionAvailable =
    examSession.open &&
    ((registrationPeriodOpen &&
      examSession.participants < examSession.max_participants) ||
      (registrationPeriodOpen && !examSession.queue_full) ||
      (postAdmissionOpen &&
        examSession.pa_participants < examSession.post_admission_quota));

  if (isPhone) {
    return (
      <TableRow>
        <PublicExamSessionListingCellsForPhone
          examSession={examSession}
          availablePlacesText={availablePlacesText}
          registerActionAvailable={registerActionAvailable}
          locationInfo={locationInfo}
        />
      </TableRow>
    );
  } else {
    return (
      <TableRow data-testid={`public-exam-session__id-${examSession.id}-row`}>
        <PublicExamSessionListingCellsForDesktop
          examSession={examSession}
          availablePlacesText={availablePlacesText}
          registerActionAvailable={registerActionAvailable}
          locationInfo={locationInfo}
        />
      </TableRow>
    );
  }
};
