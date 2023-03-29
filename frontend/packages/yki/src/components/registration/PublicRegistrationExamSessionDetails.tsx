import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { ExamSession } from 'interfaces/examSessions';
import { ExamUtils } from 'utils/exam';

export const PublicRegistrationExamSessionDetails = ({
  examSession,
  showOpenings,
}: {
  examSession: ExamSession;
  showOpenings: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.examSessionDetails',
  });
  const header = ExamUtils.languageAndLevelText(examSession);

  const location = ExamUtils.getLocationInfo(examSession, getCurrentLang());

  return (
    <div className="rows">
      <div className="rows-gapped-xxs">
        <Text>
          {`${t('exam')}: `}
          <b>{header}</b>
        </Text>
        <Text>
          {`${t('registrationTime')}: `}
          <b>{`${DateUtils.formatOptionalDate(
            examSession.registration_end_date
          )} - ${DateUtils.formatOptionalDate(
            examSession.registration_start_date
          )}`}</b>
        </Text>
        <Text>
          {`${t('address')}: `}
          <b>{`${location.name}, ${location.street_address}, ${location.post_office}`}</b>
        </Text>
        <Text>
          {`${t('examFee')}: `}
          <b>{`${examSession.exam_fee} €`}</b>
        </Text>

        {showOpenings && (
          <Text>
            {`${t('openings')}: `}
            <b>{`${
              examSession.participants
                ? Math.max(
                    examSession.max_participants - examSession.participants,
                    0
                  )
                : examSession.max_participants
            }`}</b>
          </Text>
        )}
      </div>
    </div>
  );
};
