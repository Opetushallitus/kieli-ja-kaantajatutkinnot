import { TableCell, TableRow, Typography } from '@mui/material';
import { Dayjs } from 'dayjs';
import { ReactNode } from 'react';
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
  const { start } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  if (examSession.open) {
    return <>{t('examSessionIsFull')}</>;
  } else {
    if (examSession.upcoming_admission || examSession.upcoming_post_admission) {
      return (
        <>
          {t('admissionOpensOn', {
            startDate: DateUtils.formatOptionalDate(start),
          })}
        </>
      );
    } else {
      return <>{t('admissionPeriodIsClosed')}</>;
    }
  }
};

const renderAdmissionPeriod = ({
  start,
  end,
}: {
  start: Dayjs;
  end: Dayjs;
}) => {
  const startTimeStr = DateTimeUtils.renderDateTime(start);
  const endTimeStr = DateTimeUtils.renderDateTime(end);

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
        {translateCommon('postAdmission')}:
        <br aria-hidden={true} />
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

const TableCellForPhone = ({
  columnName,
  children,
}: {
  columnName: string;
  children: ReactNode;
}) => (
  <TableCell>
    <Typography variant="h3" component="h5">
      {columnName}
    </Typography>
    <Text>{children}</Text>
  </TableCell>
);

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
        <Typography variant="h2" component="h4">
          {ExamSessionUtils.languageAndLevelText(examSession)}
        </Typography>
      </TableCell>
      <TableCellForPhone columnName={translateCommon('examDate')}>
        {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
      </TableCellForPhone>
      <TableCellForPhone columnName={translateCommon('institution')}>
        {locationInfo.name}
        <br aria-hidden={true} />
        {ExamSessionUtils.getMunicipality(locationInfo)}
      </TableCellForPhone>
      <TableCellForPhone columnName={translateCommon('registrationPeriod')}>
        <AdmissionPeriodText examSession={examSession} />
      </TableCellForPhone>
      <TableCellForPhone columnName={translateCommon('price')}>
        {examSession.exam_fee} €
      </TableCellForPhone>
      <TableCellForPhone columnName={translateCommon('placesAvailable')}>
        {availablePlacesText}
      </TableCellForPhone>
      <TableCell>
        {registerActionAvailable ? (
          <RegisterToExamButton examSession={examSession} />
        ) : (
          <>
            <Typography variant="h3" component="h5" className="display-none">
              {translateCommon('actions')}
            </Typography>
            <Text className="centered uppercase">
              <RegistrationUnavailableText examSession={examSession} />
            </Text>
          </>
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
    getCurrentLang(),
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
