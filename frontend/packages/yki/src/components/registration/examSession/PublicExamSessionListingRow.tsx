import { TableCell, TableRow } from '@mui/material';
import { DateUtils } from 'shared/utils';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { ExamSession } from 'interfaces/examSessions';
import { ExamUtils } from 'utils/exam';

export const PublicExamSessionListingRow = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });
  const handleRowClick = () =>
    // eslint-disable-next-line no-console
    console.log('clicked on examSession', examSession.id);
  const locationInfo = ExamUtils.getLocationInfo(examSession, getCurrentLang());

  return (
    <TableRow
      className="cursor-pointer"
      data-testid={`public-exam-session__id-${examSession.id}-row`}
      onClick={handleRowClick}
    >
      <TableCell>{ExamUtils.renderLanguageAndLevel(examSession)}</TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
      </TableCell>
      <TableCell>
        {locationInfo?.name}
        <br />
        <b>{locationInfo?.post_office}</b>
      </TableCell>
      <TableCell>
        {ExamUtils.renderDateTime(
          examSession.registration_start_date?.hour(10)
        )}{' '}
        &ndash;{' '}
        {ExamUtils.renderDateTime(examSession.registration_end_date?.hour(16))}
      </TableCell>
      <TableCell>
        {examSession.max_participants - (examSession.participants ?? 0)} /{' '}
        {examSession.max_participants}
      </TableCell>
      <TableCell>{t('register')}</TableCell>
    </TableRow>
  );
};
