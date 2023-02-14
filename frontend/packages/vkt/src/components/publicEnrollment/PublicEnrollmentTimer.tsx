import { Box, LinearProgress } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import {
  CustomButton,
  CustomModal,
  LoadingProgressIndicator,
} from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicReservation } from 'interfaces/publicEnrollment';
import {
  cancelPublicEnrollmentAndRemoveReservation,
  renewPublicEnrollmentReservation,
} from 'redux/reducers/publicEnrollment';

const calcProgress = (expires: Dayjs, total: number) => {
  const secondsDiff = Math.max(0, expires.diff(dayjs(), 'second'));
  const minutes = Math.floor(secondsDiff / 60);
  const seconds = secondsDiff - minutes * 60;

  return {
    value: Math.floor((secondsDiff / total) * 100),
    seconds: String(seconds).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    secondsDiff,
  };
};

export const PublicEnrollmentTimer = ({
  reservation,
  isLoading,
}: {
  reservation: PublicReservation;
  isLoading: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.expirationTimer',
  });

  const dispatch = useAppDispatch();
  const expirationStart = reservation.renewedAt ?? reservation.createdAt;
  const expirationTime = Math.max(
    0,
    reservation.expiresAt.diff(expirationStart, 'second')
  );

  const [progress, setProgress] = useState(
    calcProgress(reservation.expiresAt, expirationTime)
  );
  const [timerWarningClosed, setTimerWarningClosed] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setProgress(calcProgress(reservation.expiresAt, expirationTime)),
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [reservation, expirationTime]);

  const renewReservation = () => {
    dispatch(renewPublicEnrollmentReservation(reservation));
    setTimerWarningClosed(true);
  };

  const cancelReservation = () => {
    dispatch(cancelPublicEnrollmentAndRemoveReservation(reservation.id));
  };

  const isExpired = progress.secondsDiff <= 0;
  const warningTreshold = 60 * 3; // 3 minutes
  const isContinueModalOpen =
    !timerWarningClosed &&
    !isExpired &&
    progress.secondsDiff < warningTreshold &&
    reservation.isRenewable;

  const isExpiredModalOpen = isExpired;

  return (
    <Box className="public-enrollment__grid__progress-container">
      <LoadingProgressIndicator isLoading={isLoading}>
        <div
          data-testid="public-enrollment__reservation-timer-text"
          className="public-enrollment__grid__progress-text"
        >
          {t('reservationExpiresIn', {
            minutes: progress.minutes,
            seconds: progress.seconds,
          })}
        </div>
      </LoadingProgressIndicator>
      <LinearProgress
        className="public-enrollment__grid__timer-progressbar"
        variant="determinate"
        value={progress.value}
      />
      <CustomModal
        data-testid="public-enrollment__renew-reservation-modal"
        open={isContinueModalOpen}
        onCloseModal={() => setTimerWarningClosed(true)}
        ariaLabelledBy="modal-title"
      >
        <div className="custom-modal__renew-reservation-modal">
          <h2>
            {t('reservationExpiresInTitle', {
              minutes: progress.minutes,
              seconds: progress.seconds,
            })}
          </h2>
          <p>{t('reservationInfoText')}</p>
          <div className="columns gapped flex-end">
            <CustomButton
              data-testid="public-enrollment__cancel-reservation-modal-button"
              variant={Variant.Text}
              color={Color.Secondary}
              onClick={cancelReservation}
            >
              {t('cancelReservation')}
            </CustomButton>
            <CustomButton
              data-testid="public-enrollment__renew-reservation-modal-button"
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={renewReservation}
            >
              {t('continueEnrollment')}
            </CustomButton>
          </div>
        </div>
      </CustomModal>
      <CustomModal
        data-testid="public-enrollment__reservation-expired-modal"
        open={isExpiredModalOpen}
        onCloseModal={() => setTimerWarningClosed(true)}
        ariaLabelledBy="modal-title"
      >
        <div className="custom-modal__renew-reservation-modal">
          <h2>{t('reservationExpired')}</h2>
          <p>{t('reservationExpiredText')}</p>
          <div className="columns gapped flex-end">
            <CustomButton
              data-testid="public-enrollment__reservation-expired-ok-button"
              variant={Variant.Text}
              color={Color.Secondary}
              onClick={cancelReservation}
            >
              {t('reservationExpiredContinue')}
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </Box>
  );
};
