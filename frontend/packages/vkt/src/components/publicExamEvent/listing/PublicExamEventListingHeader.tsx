import { TableCell, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicExamEventListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing.header',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  const { selectedExamEvent, reservationDetailsStatus } = useAppSelector(
    publicEnrollmentSelector
  );

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
          <TableCell>{t('language')}</TableCell>
          <TableCell>{t('examDate')}</TableCell>
          <TableCell>{t('registrationCloses')}</TableCell>
          <TableCell>{t('openings')}</TableCell>
          <TableCell>
            <LoadingProgressIndicator isLoading={isInitialisationInProgress}>
              <CustomButton
                data-testid="public-exam-events__enroll-btn"
                color={Color.Secondary}
                variant={Variant.Contained}
                disabled={enrollButtonDisabled}
                onClick={() =>
                  navigate(
                    AppRoutes.PublicAuth.replace(
                      ':examEventId',
                      selectedExamEvent.id
                    )
                  )
                }
              >
                {translateCommon('enroll')}
              </CustomButton>
            </LoadingProgressIndicator>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
