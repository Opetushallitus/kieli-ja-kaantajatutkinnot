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
        {examSession.language_code}, {examSession.level_code}ƒ
      </TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.session_date)}
      </TableCell>
      <TableCell>{examSession.location[0].name}</TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.registration_start_date)} -{' '}
        {DateUtils.formatOptionalDate(examSession.registration_end_date)}
      </TableCell>
      <TableCell>
        {examSession.max_participants - (examSession.participants ?? 0)} /{' '}
        {examSession.max_participants}
      </TableCell>
      <TableCell>Ilmoittaudu</TableCell>
    </TableRow>
  );
};
