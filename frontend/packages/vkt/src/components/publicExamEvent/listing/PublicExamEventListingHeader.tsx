import { TableCell, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicExamEventListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const commonTranslation = useCommonTranslation();
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
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          <TableCell>{t('header.language')}</TableCell>
          <TableCell>{t('header.examDate')}</TableCell>
          <TableCell>{t('header.registrationCloses')}</TableCell>
          <TableCell>{t('header.openings')}</TableCell>
          <TableCell>
            <LoadingProgressIndicator isLoading={isInitialisationInProgress}>
              <CustomButton
                data-testid="public-exam-events__enroll-btn"
                color={Color.Secondary}
                variant={Variant.Contained}
                disabled={enrollButtonDisabled}
                onClick={() => navigate(AppRoutes.PublicAuth)}
              >
                {commonTranslation('enroll')}
              </CustomButton>
            </LoadingProgressIndicator>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
