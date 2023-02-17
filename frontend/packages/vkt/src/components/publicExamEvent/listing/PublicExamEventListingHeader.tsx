import { TableCell, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicExamEventListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const { isPhone } = useWindowProperties();

  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);
  const { reservationDetailsStatus } = useAppSelector(publicEnrollmentSelector);

  const isInitialisationInProgress =
    reservationDetailsStatus === APIResponseStatus.InProgress;

  const enrollButtonDisabled =
    !selectedExamEvent ||
    selectedExamEvent.hasCongestion ||
    isInitialisationInProgress;

  const navigate = useNavigate();

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
            <LoadingProgressIndicator isLoading={isInitialisationInProgress}>
              <CustomButton
                data-testid="public-exam-events__enroll-btn"
                color={Color.Secondary}
                variant={Variant.Contained}
                disabled={enrollButtonDisabled}
                onClick={() => navigate(AppRoutes.PublicIdentify)}
              >
                {t('enroll')}
              </CustomButton>
            </LoadingProgressIndicator>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
