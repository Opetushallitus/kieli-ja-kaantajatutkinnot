import { Box, LinearProgress } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import {
  CustomButton,
  CustomModal,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicReservation } from 'interfaces/publicEnrollment';
import {
  cancelPublicEnrollmentAndRemoveReservation,
  renewReservation,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

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
  const translateCommon = useCommonTranslation();
  const { cancelStatus } = useAppSelector(publicEnrollmentSelector);
  const cancelLoading = cancelStatus === APIResponseStatus.InProgress;

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

  const handleRenewReservation = () => {
    dispatch(renewReservation(reservation.id));
    setTimerWarningClosed(true);
  };

  const handleCancelEnrollment = () => {
    dispatch(cancelPublicEnrollmentAndRemoveReservation(reservation.id));
  };

  const isExpired = progress.secondsDiff <= 0;
  const warningThreshold = 60 * 3; // 3 minutes
  const isContinueModalOpen =
    !timerWarningClosed &&
    !isExpired &&
    progress.secondsDiff < warningThreshold &&
    reservation.isRenewable;

  const isExpiredModalOpen = isExpired;

  return (
    <Box className="public-enrollment__grid__progress-container">
      <div
        data-testid="public-enrollment__reservation-timer-text"
        className="public-enrollment__grid__progress-text"
      >
        {t('reservationExpiresIn', {
          minutes: progress.minutes,
          seconds: progress.seconds,
        })}
      </div>
      <LinearProgress
        className="public-enrollment__grid__timer-progressbar"
        variant="determinate"
        value={progress.value}
        aria-hidden={true}
      />
      <CustomModal
        data-testid="public-enrollment__renew-reservation-modal"
        className="public-enrollment__renew-reservation-modal"
        open={isContinueModalOpen}
        onCloseModal={() => setTimerWarningClosed(true)}
        aria-labelledby="expires-modal-title"
        aria-describedby="expires-modal-description"
        modalTitle={t('reservationExpiresInTitle', {
          minutes: progress.minutes,
          seconds: progress.seconds,
        })}
      >
        <>
          <p id="expires-modal-description">{t('reservationInfoText')}</p>
          <div className="columns gapped flex-end">
            <LoadingProgressIndicator
              translateCommon={translateCommon}
              isLoading={cancelLoading}
            >
              <CustomButton
                data-testid="public-enrollment__cancel-enrollment-modal-button"
                variant={Variant.Text}
                color={Color.Secondary}
                onClick={handleCancelEnrollment}
                disabled={cancelLoading || isLoading}
              >
                {t('cancelEnrollment')}
              </CustomButton>
            </LoadingProgressIndicator>
            <CustomButton
              data-testid="public-enrollment__renew-reservation-modal-button"
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={handleRenewReservation}
              disabled={cancelLoading || isLoading}
            >
              {t('continueEnrollment')}
            </CustomButton>
          </div>
        </>
      </CustomModal>
      <CustomModal
        data-testid="public-enrollment__reservation-expired-modal"
        className="public-enrollment__renew-reservation-modal"
        open={isExpiredModalOpen}
        onCloseModal={() => setTimerWarningClosed(true)}
        aria-labelledby="expired-modal-title"
        aria-describedby="expired-modal-description"
        modalTitle={t('reservationExpired')}
      >
        <>
          <p id="expired-modal-description">{t('reservationExpiredText')}</p>
          <div className="columns gapped flex-end">
            <LoadingProgressIndicator
              translateCommon={translateCommon}
              isLoading={cancelLoading}
            >
              <CustomButton
                data-testid="public-enrollment__reservation-expired-ok-button"
                variant={Variant.Text}
                color={Color.Secondary}
                onClick={handleCancelEnrollment}
                disabled={cancelLoading || isLoading}
              >
                {t('reservationExpiredContinue')}
              </CustomButton>
            </LoadingProgressIndicator>
          </div>
        </>
      </CustomModal>
    </Box>
  );
};
