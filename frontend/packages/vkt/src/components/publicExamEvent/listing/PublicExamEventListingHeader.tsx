import { TableCell, TableHead, TableRow } from '@mui/material';
import { CustomButton, H3 } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicExamEventListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const { isPhone } = useWindowProperties();

  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);

  const enrollButtonDisabled =
    !selectedExamEvent || selectedExamEvent.hasCongestion;

  return (
    <TableHead>
      {!isPhone && (
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          <TableCell>
            <H3>{t('header.language')}</H3>
          </TableCell>
          <TableCell>
            <H3>{t('header.examDate')}</H3>
          </TableCell>
          <TableCell>
            <H3>{t('header.registrationCloses')}</H3>
          </TableCell>
          <TableCell>
            <H3>{t('header.openings')}</H3>
          </TableCell>
          <TableCell>
            <CustomButton
              data-testid="public-exam-events__enroll-btn"
              color={Color.Secondary}
              variant={Variant.Contained}
              disabled={enrollButtonDisabled}
            >
              {t('enroll')}
            </CustomButton>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
