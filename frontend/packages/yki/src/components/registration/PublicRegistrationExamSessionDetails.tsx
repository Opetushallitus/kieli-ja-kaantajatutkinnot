import { H2, HeaderSeparator, Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { ExamSession } from 'interfaces/examSessions';
import { ExamUtils } from 'utils/exam';
import { ExamSessionUtils } from 'utils/examSession';

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
  const translateCommon = useCommonTranslation();
  const header = ExamSessionUtils.languageAndLevelText(
    examSession.language_code,
    examSession.level_code,
    translateCommon
  );

  const location = ExamUtils.getLocationInfo(examSession, getCurrentLang());

  return (
    <div className="margin-top-xxl rows">
      <div className="rows gapped-xs">
        <H2>{header}</H2>
        <HeaderSeparator />
      </div>
      <div className="rows-gapped-xxs">
        <Text>{`${t('address')}: ${location.name}, ${
          location.street_address
        }, ${location.post_office}`}</Text>
        <Text>{`${t('examDate')}: ${DateUtils.formatOptionalDate(
          examSession.session_date
        )}`}</Text>
        <Text>{`${t('registrationCloses')}: ${DateUtils.formatOptionalDate(
          examSession.registration_end_date
        )}`}</Text>
        {showOpenings && (
          <Text>{`${t('openings')}: ${
            examSession.participants
              ? Math.max(
                  examSession.max_participants - examSession.participants,
                  0
                )
              : examSession.max_participants
          }`}</Text>
        )}
      </div>
    </div>
  );
};
