import { TableCell, TableHead, TableRow } from '@mui/material';

import { useCommonTranslation } from 'configs/i18n';

export const PublicExamSessionListingHeader = () => {
  const translateCommon = useCommonTranslation();

  return (
    <TableHead className="heading-text public-exam-session-listing__header">
      <TableRow>
        <TableCell>{translateCommon('examSession')}</TableCell>
        <TableCell>{translateCommon('examDate')}</TableCell>
        <TableCell>{translateCommon('institution')}</TableCell>
        <TableCell>{translateCommon('registrationPeriod')}</TableCell>
        <TableCell>{translateCommon('price')}</TableCell>
        <TableCell>{translateCommon('placesAvailable')}</TableCell>
        <TableCell>{translateCommon('actions')}</TableCell>
      </TableRow>
    </TableHead>
  );
};
