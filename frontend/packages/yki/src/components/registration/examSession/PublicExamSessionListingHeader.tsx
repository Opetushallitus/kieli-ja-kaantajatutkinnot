import { TableCell, TableHead, TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation } from 'configs/i18n';

export const PublicExamSessionListingHeader = () => {
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>{translateCommon('examSession')}</TableCell>
          <TableCell>{translateCommon('examDate')}</TableCell>
          <TableCell>{translateCommon('institution')}</TableCell>
          <TableCell>{translateCommon('registrationPeriod')}</TableCell>
          <TableCell>{translateCommon('price')}</TableCell>
          <TableCell>{translateCommon('placesAvailable')}</TableCell>
          <TableCell>{translateCommon('actions')}</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
