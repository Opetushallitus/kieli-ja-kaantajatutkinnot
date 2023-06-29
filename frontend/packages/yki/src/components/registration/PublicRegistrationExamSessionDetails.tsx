import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { ExamSession } from 'interfaces/examSessions';
import { ExamUtils } from 'utils/exam';

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

  if (!examSession) {
    return null;
  }

  const { start, end, participants, quota } =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  const openings = Math.max(quota - participants, 0);

  const header = ExamUtils.languageAndLevelText(examSession);
  const location = ExamUtils.getLocationInfo(examSession, getCurrentLang());

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
          <b>{`${location.name}, ${location.street_address}, ${location.post_office}`}</b>
        </Text>
        <Text>
          {`${t('registrationTime')}: `}
          <b>{`${DateUtils.formatOptionalDate(
            start
          )} - ${DateUtils.formatOptionalDate(end)}`}</b>
        </Text>
        <Text>
          {`${t('examFee')}: `}
          <b>{`${examSession.exam_fee} €`}</b>
        </Text>

        {showOpenings && (
          <Text>
            {`${t('openings')}: `}
            <b>{openings > 0 ? openings : translateCommon('full')}</b>
          </Text>
        )}
      </div>
    </div>
  );
};
