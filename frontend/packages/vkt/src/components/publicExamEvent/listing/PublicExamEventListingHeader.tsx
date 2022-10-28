import { TableCell, TableHead, TableRow } from '@mui/material';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadReservation } from 'redux/reducers/publicReservation';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';
import { publicReservationSelector } from 'redux/selectors/publicReservation';

export const PublicExamEventListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const { isPhone } = useWindowProperties();

  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);
  const { status } = useAppSelector(publicReservationSelector);

  const isReservationCreationInProgress =
    status === APIResponseStatus.InProgress;

  const enrollButtonDisabled =
    !selectedExamEvent ||
    selectedExamEvent.hasCongestion ||
    isReservationCreationInProgress;

  const dispatch = useAppDispatch();

  const startEnrollment = () =>
    selectedExamEvent && dispatch(loadReservation(selectedExamEvent.id));

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
            <LoadingProgressIndicator
              isLoading={isReservationCreationInProgress}
            >
              <CustomButton
                data-testid="public-exam-events__enroll-btn"
                color={Color.Secondary}
                variant={Variant.Contained}
                disabled={enrollButtonDisabled}
                onClick={startEnrollment}
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
