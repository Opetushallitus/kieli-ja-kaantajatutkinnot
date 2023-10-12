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
import { DateTimeUtils } from 'utils/dateTime';
import { ExamSessionUtils } from 'utils/examSession';

const RegisterToExamButton = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });
  const { isPhone } = useWindowProperties();

  const { availablePlaces, availableQueue } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  return (
    <CustomButtonLink
      color={Color.Secondary}
      variant={Variant.Outlined}
      onClick={() => {
        dispatch(storeExamSession(examSession));
        dispatch(resetPublicRegistration());
      }}
      to={AppRoutes.ExamSession.replace(/:examSessionId$/, `${examSession.id}`)}
      fullWidth={isPhone}
    >
      {availablePlaces
        ? t('register')
        : availableQueue
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
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
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
  const startTimeStr = DateTimeUtils.renderDateTime(
    start.tz('Europe/Helsinki')
  );
  const endTimeStr = DateTimeUtils.renderDateTime(end.tz('Europe/Helsinki'));

  return (
    <span aria-label={`${startTimeStr} — ${endTimeStr}`}>
      {startTimeStr} —
      <br aria-hidden={true} />
      {endTimeStr}
    </span>
  );
};

const AdmissionPeriodText = ({ examSession }: { examSession: ExamSession }) => {
  const translateCommon = useCommonTranslation();
  const relevantPeriod =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  if (relevantPeriod.kind === RegistrationKind.Admission) {
    return <>{renderAdmissionPeriod(relevantPeriod)}</>;
  } else {
    return (
      <>
        {translateCommon('postAdmission')}:<br aria-hidden={true} />
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
  registerActionAvailable: boolean;
}) => {
  return (
    <>
      <TableCell>
        {ExamSessionUtils.languageAndLevelText(examSession)}
      </TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
      </TableCell>
      <TableCell>
        {locationInfo.name}
        <br />
        {ExamSessionUtils.getMunicipality(locationInfo)}
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
  registerActionAvailable: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <>
      <TableCell>
        <Typography variant="h2" component="p">
          {ExamSessionUtils.languageAndLevelText(examSession)}
        </Typography>
      </TableCell>
      <TableCell>
        <Text>
          <b aria-hidden={true}>{translateCommon('examDate')}</b>
          <br aria-hidden={true} />
          {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
        </Text>
      </TableCell>
      <TableCell>
        <Text>
          <b aria-hidden={true}>{translateCommon('institution')}</b>
          <br aria-hidden={true} />
          {locationInfo.name}
          <br aria-hidden={true} />
          {ExamSessionUtils.getMunicipality(locationInfo)}
        </Text>
      </TableCell>
      <TableCell>
        <Text>
          <b aria-hidden={true}>{translateCommon('registrationPeriod')}</b>
          <br aria-hidden={true} />
          <AdmissionPeriodText examSession={examSession} />
        </Text>
      </TableCell>
      <TableCell>
        <Text>
          <b aria-hidden={true}>{translateCommon('price')}</b>
          <br aria-hidden={true} />
          {examSession.exam_fee} €
        </Text>
      </TableCell>
      <TableCell>
        <Text>
          <b aria-hidden={true}>{translateCommon('placesAvailable')}</b>
          <br aria-hidden={true} />
          {availablePlacesText}
        </Text>
      </TableCell>
      <TableCell>
        {registerActionAvailable ? (
          <RegisterToExamButton examSession={examSession} />
        ) : (
          <Text
            className="centered uppercase"
            aria-label={translateCommon('actions')}
          >
            <RegistrationUnavailableText examSession={examSession} />
          </Text>
        )}
      </TableCell>
    </>
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
  const { isPhone } = useWindowProperties();

  const locationInfo = ExamSessionUtils.getLocationInfo(
    examSession,
    getCurrentLang()
  );

  const { open, availablePlaces, availableQueue } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  const availablePlacesText =
    availablePlaces > 0 ? '' + availablePlaces : t('full');

  const registerActionAvailable = open && (availablePlaces || availableQueue);

  if (isPhone) {
    return (
      <TableRow className="rows gapped-xs">
        <PublicExamSessionListingCellsForPhone
          examSession={examSession}
          availablePlacesText={availablePlacesText}
          registerActionAvailable={!!registerActionAvailable}
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
          registerActionAvailable={!!registerActionAvailable}
          locationInfo={locationInfo}
        />
      </TableRow>
    );
  }
};
