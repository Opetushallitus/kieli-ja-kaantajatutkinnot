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
import { PartialExamType } from 'interfaces/publicRegistration';
import {
  initRegistration,
  resetPublicRegistration,
} from 'redux/reducers/registration';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamSessionUtils } from 'utils/examSession';

const RegisterToExamButton = ({
  examSession,
  partialExamType,
}: {
  examSession: ExamSession;
  partialExamType: PartialExamType;
}) => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationButtonLabels',
  });

  const registrationKind = ExamSessionUtils.getRegistrationKind({
    examSession,
    partialExamType,
  });

  return (
    <CustomButton
      color={Color.Secondary}
      variant={Variant.Outlined}
      onClick={() => {
        dispatch(resetPublicRegistration());
        dispatch(
          initRegistration({
            examSessionId: examSession.id,
            registrationKind,
            partialExamType,
          }),
        );
      }}
    >
      {registrationKind === RegistrationKind.Admission
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

const getTableBody = ({
  examSession,
  t,
}: {
  examSession: ExamSession;
  t: ReturnType<typeof usePublicTranslation>['t'];
}) => {
  const examSessionFee = ExamSessionUtils.freeRegistrationPossible(examSession)
    ? `0 / ${examSession.exam_fee} €`
    : `${examSession.exam_fee} €`;

  const availablePlaces = ExamSessionUtils.getAvailablePlaces(examSession);

  const availablePlacesText =
    availablePlaces > 0
      ? '' + availablePlaces
      : t('registrationButtonLabels.full');

  const renderActions = ({
    examSession,
    partialExamType,
    availablePlaces,
  }: {
    examSession: ExamSession;
    partialExamType: PartialExamType;
    availablePlaces: number;
  }) => {
    if (examSession.open) {
      if (
        availablePlaces === 0 &&
        ['LISTEN_WRITE', 'READ_SPEAK'].includes(examSession.type) &&
        partialExamType === 'ALL_PARTS'
      ) {
        return (
          <Text>{t('examSessionCard.registerToPartialExamsSeparately')}</Text>
        );
      } else {
        return (
          <RegisterToExamButton
            examSession={examSession}
            partialExamType={partialExamType}
          />
        );
      }
    } else {
      return (
        <Text>
          <RegistrationUnavailableText examSession={examSession} />
        </Text>
      );
    }
  };

  if (examSession.type === 'READ_SPEAK') {
    return (
      <>
        <tr>
          <td data-label={t('examSessionCard.examType.readSpeak')}>
            {t('examSessionCard.examType.readSpeak')}
          </td>
          <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
          <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
          <td data-label={t('examSessionCard.placesAvailable')}>
            {availablePlacesText}
          </td>
          <td data-label={t('examSessionCard.actions')}>
            {renderActions({
              examSession,
              partialExamType: 'ALL_PARTS',
              availablePlaces,
            })}
          </td>
        </tr>
        <tr>
          <td data-label={t('examSessionCard.examType.read')}>
            {t('examSessionCard.examType.read')}
          </td>
          <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
          <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
          <td data-label={t('examSessionCard.placesAvailable')}>
            {availablePlacesText}
          </td>
          <td data-label={t('examSessionCard.actions')}>
            {renderActions({
              examSession,
              partialExamType: 'READ',
              availablePlaces,
            })}
          </td>
        </tr>
        <tr>
          <td data-label={t('examSessionCard.examType.speak')}>
            {t('examSessionCard.examType.speak')}
          </td>
          <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
          <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
          <td data-label={t('examSessionCard.placesAvailable')}>
            {availablePlacesText}
          </td>
          <td data-label={t('examSessionCard.actions')}>
            {renderActions({
              examSession,
              partialExamType: 'SPEAK',
              availablePlaces,
            })}
          </td>
        </tr>
      </>
    );
  } else if (examSession.type === 'LISTEN_WRITE') {
    return (
      <>
        <tr>
          <td data-label={t('examSessionCard.examType.listenWrite')}>
            {t('examSessionCard.examType.listenWrite')}
          </td>
          <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
          <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
          <td data-label={t('examSessionCard.placesAvailable')}>
            {availablePlacesText}
          </td>
          <td data-label={t('examSessionCard.actions')}>
            {renderActions({
              examSession,
              partialExamType: 'ALL_PARTS',
              availablePlaces,
            })}
          </td>
        </tr>
        <tr>
          <td data-label={t('examSessionCard.examType.listen')}>
            {t('examSessionCard.examType.listen')}
          </td>
          <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
          <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
          <td data-label={t('examSessionCard.placesAvailable')}>
            {availablePlacesText}
          </td>
          <td data-label={t('examSessionCard.actions')}>
            {renderActions({
              examSession,
              partialExamType: 'LISTEN',
              availablePlaces,
            })}
          </td>
        </tr>
        <tr>
          <td data-label={t('examSessionCard.examType.write')}>
            {t('examSessionCard.examType.write')}
          </td>
          <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
          <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
          <td data-label={t('examSessionCard.placesAvailable')}>
            {availablePlacesText}
          </td>
          <td data-label={t('examSessionCard.actions')}>
            {renderActions({
              examSession,
              partialExamType: 'WRITE',
              availablePlaces,
            })}
          </td>
        </tr>
      </>
    );
  }

  return (
    <tr>
      <td data-label={t('examSessionCard.examType.full')}>
        {t('examSessionCard.examType.full')}
      </td>
      <td data-label={t('examSessionCard.examStartTime')}>klo 14:30</td>
      <td data-label={t('examSessionCard.price')}>{examSessionFee}</td>
      <td data-label={t('examSessionCard.placesAvailable')}>
        {availablePlacesText}
      </td>
      <td data-label={t('examSessionCard.actions')}>
        {renderActions({
          examSession,
          partialExamType: 'ALL_PARTS',
          availablePlaces,
        })}
      </td>
    </tr>
  );
};

export const PublicExamSessionCard = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });

  const locationInfo = ExamSessionUtils.getLocationInfo(
    examSession,
    getCurrentLang(),
  );
  const { start, end } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  return (
    <article
      className="exam-session-card"
      data-testid={`public-exam-session__id-${examSession.id}-card`}
    >
      <div>
        <div className="exam-session-card__partial-exam-indicator">
          {examSession.type === 'READ_SPEAK' && (
            <>
              <div className="exam-session-card__partial-exam-indicator__item">
                <span>{t('examSessionCard.examType.read')}</span>
              </div>
              <div className="exam-session-card__partial-exam-indicator__item">
                <span>{t('examSessionCard.examType.speak')}</span>
              </div>
            </>
          )}
          {examSession.type === 'LISTEN_WRITE' && (
            <>
              <div className="exam-session-card__partial-exam-indicator__item">
                <span>{t('examSessionCard.examType.listen')}</span>
              </div>
              <div className="exam-session-card__partial-exam-indicator__item">
                <span>{t('examSessionCard.examType.write')}</span>
              </div>
            </>
          )}
          {examSession.type === 'FULL' && (
            <div className="exam-session-card__partial-exam-indicator__item">
              <span>{t('examSessionCard.registrationType.allParts')}</span>
            </div>
          )}
        </div>
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
            <th>{t('examSessionCard.exam')}</th>
            <th>{t('examSessionCard.examStartTime')}</th>
            <th>{t('examSessionCard.price')}</th>
            <th>{t('examSessionCard.placesAvailable')}</th>
            <th>{t('examSessionCard.actions')}</th>
          </tr>
        </thead>
        <tbody>{getTableBody({ examSession, t })}</tbody>
      </table>
    </article>
  );
};
