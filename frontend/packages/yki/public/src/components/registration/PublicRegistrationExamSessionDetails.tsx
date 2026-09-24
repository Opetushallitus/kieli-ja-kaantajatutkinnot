import { ReactNode } from 'react';
import { H2 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ExamSessionFormat } from 'components/registration/examSession/ExamSessionFormat';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { PartialExamType } from 'interfaces/publicRegistration';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';
import { ExamSessionUtils } from 'utils/examSession';

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </>
);

// PartialExamTypeProp is only used when ConfirmRegistrationPage renders ExamSessionDetails
export const PublicRegistrationExamSessionDetails = ({
  examSession,
  showOpenings,
  partialExamType: partialExamTypeProp,
}: {
  examSession?: ExamSession;
  showOpenings: boolean;
  partialExamType?: PartialExamType;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.examSessionDetails',
  });
  const translateCommon = useCommonTranslation();

  const { isFree, attemptsUsed } = useAppSelector(
    publicFreeRegistrationSelector,
  );
  const { loggedInSession } = useAppSelector(sessionSelector);
  const { activeStep, submitRegistration, initRegistration } =
    useAppSelector(registrationSelector);

  if (!examSession) {
    return null;
  }

  const { availablePlaces, start, end } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(
      examSession,
      initRegistration.partialExamType,
    );

  const header = ExamSessionUtils.languageAndLevelText(examSession);
  const location = ExamSessionUtils.getLocationInfo(
    examSession,
    getCurrentLang(),
  );

  const freeRegistrationPossible = ExamSessionUtils.freeRegistrationPossible(
    examSession,
    loggedInSession,
  );

  let examFeeText: string;
  if (freeRegistrationPossible) {
    switch (activeStep) {
      case PublicRegistrationFormStep.Identify:
        // If user has not yet progressed to registration form, always display an undecided exam fee amount
        examFeeText = `0 ${translateCommon(
          'or',
        )} ${ExamSessionUtils.getPartialExamFee(
          examSession,
          initRegistration.partialExamType,
        )} €`;
        break;
      case PublicRegistrationFormStep.Register:
        if (submitRegistration.status === APIResponseStatus.Success) {
          // If user is on register step and form is submitted,
          // the registration is either free or not; however, not undecided.
          switch (isFree) {
            case 'YES':
              examFeeText = '0 €';
              break;
            default:
              examFeeText = `${ExamSessionUtils.getPartialExamFee(
                examSession,
                initRegistration.partialExamType,
              )} €`;
              break;
          }
        } else {
          // If user is on register step with form not yet submitted,
          // registration can be free, paid or not yet definitely either.
          switch (isFree) {
            case 'YES':
              examFeeText = '0 €';
              break;
            case 'NO':
              examFeeText = `${ExamSessionUtils.getPartialExamFee(
                examSession,
                initRegistration.partialExamType,
              )} €`;
              break;
            case 'UNDECIDED':
              examFeeText = `0 ${translateCommon(
                'or',
              )} ${ExamSessionUtils.getPartialExamFee(
                examSession,
                initRegistration.partialExamType,
              )} €`;
              break;
          }
        }
        break;
      case PublicRegistrationFormStep.Payment:
        examFeeText = `${ExamSessionUtils.getPartialExamFee(
          examSession,
          initRegistration.partialExamType,
        )} €`;
        break;
      case PublicRegistrationFormStep.Done:
        switch (isFree) {
          case 'YES':
            examFeeText = '0 €';
            break;
          default:
            examFeeText = `${ExamSessionUtils.getPartialExamFee(
              examSession,
              initRegistration.partialExamType,
            )} €`;
            break;
        }
    }
  } else {
    examFeeText = `${ExamSessionUtils.getPartialExamFee(
      examSession,
      initRegistration.partialExamType,
    )} €`;
  }

  const attemptsLeft = 3 - (attemptsUsed || 0);

  const isPartialExamRegistrationEndStep =
    activeStep === PublicRegistrationFormStep.Done &&
    examSession.type !== 'FULL';

  return (
    <div className="public-registration-exam-session-details rows">
      <H2 style={{ marginBottom: '2rem' }}>
        <b>{header}</b>
      </H2>
      <dl className="public-registration-exam-session-details__fields">
        {!isPartialExamRegistrationEndStep && (
          <DetailRow label={translateCommon('partialExams')}>
            {ExamSessionUtils.getPartialExamTypeText(
              examSession.type,
              partialExamTypeProp ?? initRegistration.partialExamType,
            )}
          </DetailRow>
        )}
        <DetailRow label={t('testFormat')}>
          <ExamSessionFormat examSessionId={examSession.id} showDescription />
        </DetailRow>
        <DetailRow label={translateCommon('examDate')}>
          {DateUtils.formatOptionalDate(examSession.session_date)}
        </DetailRow>
        {examSession.type !== 'FULL' &&
          activeStep !== PublicRegistrationFormStep.Done && (
            <DetailRow label={translateCommon('partialExamTimeLabel')}>
              {translateCommon('partialExamTime', {
                startTime:
                  ExamSessionUtils.getStartTime(
                    examSession,
                    initRegistration.partialExamType,
                  ) || '',
              })}
            </DetailRow>
          )}
        <DetailRow label={translateCommon('institution')}>
          {`${location.name}, ${location.street_address}, ${ExamSessionUtils.getMunicipality(location)}`}
        </DetailRow>
        <DetailRow label={t('registrationTime')}>
          {`${DateUtils.formatOptionalDate(start)} - ${DateUtils.formatOptionalDate(end)}`}
        </DetailRow>
        {activeStep !== PublicRegistrationFormStep.Done && (
          <DetailRow label={t('examFee')}>{examFeeText}</DetailRow>
        )}
        {showOpenings && (
          <DetailRow label={t('openings')}>
            {availablePlaces ? availablePlaces : translateCommon('full')}
          </DetailRow>
        )}
        {activeStep === PublicRegistrationFormStep.Register &&
          freeRegistrationPossible &&
          attemptsUsed !== undefined && (
            <DetailRow label={t('freeAttemptsLeft')}>{attemptsLeft}</DetailRow>
          )}
      </dl>
    </div>
  );
};
