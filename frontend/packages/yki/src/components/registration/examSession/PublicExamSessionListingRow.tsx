import { TableCell, TableRow } from '@mui/material';
import { DateUtils } from 'shared/utils';

//import { getCurrentLang } from 'configs/i18n';
import { ExamSession } from 'interfaces/examSessions';

export const PublicExamSessionListingRow = (examSession: ExamSession) => {
  const handleRowClick = () =>
    // eslint-disable-next-line no-console
    console.log('clicked on examSession', examSession.id);
  //const currentLanguage = getCurrentLang();

  return (
    <TableRow
      className="cursor-pointer"
      data-testid={`public-exam-session__id-${examSession.id}-row`}
      onClick={handleRowClick}
    >
      <TableCell>
        {examSession.language_code}, {examSession.level_code}
      </TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
      </TableCell>
      <TableCell>{examSession.location[0].name}</TableCell>
      <TableCell>
        {DateUtils.formatOptionalDateTime(
          examSession.registration_start_date?.hour(10),
          'l HH:mm'
        )}{' '}
        -{' '}
        {DateUtils.formatOptionalDateTime(
          examSession.registration_end_date?.hour(16),
          'l HH:mm'
        )}
      </TableCell>
      <TableCell>
        {examSession.max_participants - (examSession.participants ?? 0)} /{' '}
        {examSession.max_participants}
      </TableCell>
      <TableCell>Ilmoittaudu</TableCell>
    </TableRow>
  );
};
