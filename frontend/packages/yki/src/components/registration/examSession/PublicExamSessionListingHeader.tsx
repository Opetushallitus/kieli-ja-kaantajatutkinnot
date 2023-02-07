import { TableCell, TableHead, TableRow } from '@mui/material';
import { H3 } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation } from 'configs/i18n';

export const PublicExamSessionListingHeader = () => {
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  return (
    <TableHead>
      {!isPhone && (
        <TableRow>
          <TableCell>
            <H3>{translateCommon('examSession')}</H3>
          </TableCell>
          <TableCell>
            <H3>{translateCommon('date')}</H3>
          </TableCell>
          <TableCell>
            <H3>{translateCommon('institution')}</H3>
          </TableCell>
          <TableCell>
            <H3>{translateCommon('registrationPeriod')}</H3>
          </TableCell>
          <TableCell>
            <H3>{translateCommon('placesAvailable')}</H3>
          </TableCell>
          <TableCell />
        </TableRow>
      )}
    </TableHead>
  );
};
