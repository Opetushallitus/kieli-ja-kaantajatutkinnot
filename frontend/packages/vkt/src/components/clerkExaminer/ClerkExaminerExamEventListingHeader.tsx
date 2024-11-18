import { TableCell, TableHead, TableRow } from '@mui/material';

import { useClerkTranslation } from 'configs/i18n';

export const ClerkExaminerExamEventListingHeader = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExaminerExamEventListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('examiner')}</TableCell>
        <TableCell>{t('language')}</TableCell>
        <TableCell>{t('municipality')}</TableCell>
        <TableCell>{t('examDate')}</TableCell>
        <TableCell>{t('isPublic')}</TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
