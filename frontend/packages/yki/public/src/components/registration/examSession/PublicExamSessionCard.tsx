import { Dayjs } from 'dayjs';
import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { RegistrationKind } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import {
  initRegistration,
  resetPublicRegistration,
} from 'redux/reducers/registration';
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

  const { available_registration_kind } = examSession;

  return (
    <CustomButton
      color={Color.Secondary}
      variant={Variant.Outlined}
      onClick={() => {
        dispatch(resetPublicRegistration());
        dispatch(
          initRegistration({
            examSessionId: examSession.id,
            registrationKind: available_registration_kind,
          }),
        );
      }}
    >
      {available_registration_kind === RegistrationKind.Admission
        ? t('register')
        : t('enrollToQueue')}
    </CustomButton>
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
  if (examSession.upcoming_admission) {
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

  return `${startTimeStr} - ${endTimeStr}`;
};

const MetaField = ({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) => (
  <div className="exam-session-card__meta-field">
    <div className="exam-session-card__meta-label">{label}</div>
    <div className="exam-session-card__meta-value">{value}</div>
  </div>
);

export const PublicExamSessionCard = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });

  const locationInfo = ExamSessionUtils.getLocationInfo(
    examSession,
    getCurrentLang(),
  );

  const { open, availablePlaces, start, end } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  const availablePlacesText =
    availablePlaces > 0 ? '' + availablePlaces : t('full');

  const examSessionFee = ExamSessionUtils.freeRegistrationPossible(examSession)
    ? `0 / ${examSession.exam_fee} €`
    : `${examSession.exam_fee} €`;

  const registerActionAvailable = !!open;

  return (
    <article
      className="exam-session-card"
      data-testid={`public-exam-session__id-${examSession.id}-card`}
    >
      <div>
        <h3 className="exam-session-card__title">
          {ExamSessionUtils.languageAndLevelText(examSession)}
        </h3>
      </div>

      <div className="exam-session-card__meta">
        <MetaField
          label={translateCommon('examDate')}
          value={DateUtils.formatOptionalDate(examSession.session_date, 'l')}
        />
        <MetaField
          label={translateCommon('institution')}
          value={
            <>
              {locationInfo.name}
              <br />
              {ExamSessionUtils.getMunicipality(locationInfo)}
            </>
          }
        />
        <MetaField
          label={translateCommon('registrationPeriod')}
          value={renderAdmissionPeriod({ start, end })}
        />
      </div>

      <table className="exam-session-card__table">
        <thead>
          <tr>
            <th>{translateCommon('price')}</th>
            <th>{translateCommon('placesAvailable')}</th>
            <th>{translateCommon('actions')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label={translateCommon('price')}>{examSessionFee}</td>
            <td data-label={translateCommon('placesAvailable')}>
              {availablePlacesText}
            </td>
            <td data-label={translateCommon('actions')}>
              {registerActionAvailable ? (
                <RegisterToExamButton examSession={examSession} />
              ) : (
                <Text>
                  <RegistrationUnavailableText examSession={examSession} />
                </Text>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  );
};
