import { H2, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { DateUtils } from 'shared/utils';

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
    <div className="rows">
      <div className="rows-gapped-xxs">
        <H2 style={{ marginBottom: '1rem' }}>
          <b>{header}</b>
        </H2>
        {!isPartialExamRegistrationEndStep && (
          <Text>
            {`${translateCommon('partialExams')}: `}
            <b>
              {ExamSessionUtils.getPartialExamTypeText(
                examSession.type,
                partialExamTypeProp ?? initRegistration.partialExamType,
              )}
            </b>
          </Text>
        )}
        <Text>
          {`${translateCommon('examDate')}: `}
          <b>{DateUtils.formatOptionalDate(examSession.session_date)}</b>
        </Text>
        {!isPartialExamRegistrationEndStep && (
          <Text>
            {`${translateCommon('partialExamTimeLabel')}: `}
            <b>
              {translateCommon('partialExamTime', {
                startTime:
                  ExamSessionUtils.getStartTime(
                    examSession,
                    initRegistration.partialExamType,
                  ) || '',
              })}
            </b>
          </Text>
        )}
        <Text>
          {`${translateCommon('institution')}: `}
          <b>{`${location.name}, ${
            location.street_address
          }, ${ExamSessionUtils.getMunicipality(location)}`}</b>
        </Text>

        <Text>
          {`${t('registrationTime')}: `}
          <b>{`${DateUtils.formatOptionalDate(
            start,
          )} - ${DateUtils.formatOptionalDate(end)}`}</b>
        </Text>

        {!isPartialExamRegistrationEndStep && (
          <Text>
            {`${t('examFee')}: `}
            <b>{examFeeText}</b>
          </Text>
        )}
        {showOpenings && (
          <Text>
            {`${t('openings')}: `}
            <b>{availablePlaces ? availablePlaces : translateCommon('full')}</b>
          </Text>
        )}
        {activeStep === PublicRegistrationFormStep.Register &&
          freeRegistrationPossible &&
          attemptsUsed !== undefined && (
            <Text>
              {`${t('freeAttemptsLeft')}: `}
              <b>{attemptsLeft}</b>
            </Text>
          )}
      </div>
    </div>
  );
};
