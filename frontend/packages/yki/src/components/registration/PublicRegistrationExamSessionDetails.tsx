import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { sessionSelector } from 'redux/selectors/session';
import { ExamSessionUtils } from 'utils/examSession';

export const PublicRegistrationExamSessionDetails = ({
  examSession,
  showOpenings,
}: {
  examSession?: ExamSession;
  showOpenings: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.examSessionDetails',
  });
  const translateCommon = useCommonTranslation();

  const { isFree, attemptsUsed } = useAppSelector(
    publicFreeRegistrationSelector,
  );
  const { loggedInSession } = useAppSelector(sessionSelector);

  if (!examSession) {
    return null;
  }

  const { availablePlaces, start, end } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  const header = ExamSessionUtils.languageAndLevelText(examSession);
  const location = ExamSessionUtils.getLocationInfo(
    examSession,
    getCurrentLang(),
  );

  const examFeeText = ExamSessionUtils.freeRegistrationPossible(
    examSession,
    loggedInSession,
    attemptsUsed,
  )
    ? isFree === 'YES'
      ? `0 €`
      : isFree === 'NO'
      ? `${examSession.exam_fee} €`
      : `0 ${translateCommon('or')} ${examSession.exam_fee} €`
    : `${examSession.exam_fee} €`;

  return (
    <div className="rows">
      <div className="rows-gapped-xxs">
        <Text>
          {`${translateCommon('examSession')}: `}
          <b>{header}</b>
        </Text>
        <Text>
          {`${translateCommon('examDate')}: `}
          <b>{DateUtils.formatOptionalDate(examSession.session_date)}</b>
        </Text>
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
        <Text>
          {`${t('examFee')}: `}
          <b>{examFeeText}</b>
        </Text>

        {showOpenings && (
          <Text>
            {`${t('openings')}: `}
            <b>{availablePlaces ? availablePlaces : translateCommon('full')}</b>
          </Text>
        )}
      </div>
    </div>
  );
};
