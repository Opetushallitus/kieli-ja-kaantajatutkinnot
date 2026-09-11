import { Box, LinearProgress } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomModal, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { setHasTimerExpired } from 'features/registration/redux/reducers/registrationv2';
import { RegistrationRoutes } from 'features/registration/routesv2';
import { useAppDispatch } from 'features/registration/state/reduxv2';
import { useInterval } from 'hooks/useInterval';

const TOTAL_RESERVATION_TIME = 30 * 60 * 1000;

const calcProgress = (total: number) => (expiresIn: number) => {
  const millisecondsDiff = Math.max(0, expiresIn);
  const minutes = Math.floor(millisecondsDiff / 60000);
  const seconds = Math.floor((millisecondsDiff % 60000) / 1000);

  return {
    value: Math.floor((millisecondsDiff / total) * 100),
    seconds: String(seconds).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    millisecondsDiff,
  };
};

const calcProgressWithTotal = calcProgress(TOTAL_RESERVATION_TIME);

const PublicRegistrationTimer = ({ deadline }: { deadline: string }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.expirationTimer',
  });
  const expirationTime = Date.parse(deadline);
  const [progress, setProgress] = useState(() =>
    calcProgressWithTotal(expirationTime - Date.now()),
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const updateProgress = () =>
    setProgress(() => {
      const delta = Math.floor(expirationTime - Date.now());

      return calcProgressWithTotal(delta);
    });

  useInterval(updateProgress, 1000);

  const isExpired = progress.millisecondsDiff <= 0;

  useEffect(() => {
    if (isExpired) {
      dispatch(setHasTimerExpired(true));
    }
  }, [isExpired, dispatch]);

  return (
    <Box className="public-registration__grid__progress-container">
      <div
        data-testid="public-registration__reservation-timer-text"
        className="public-registration__grid__progress-text"
      >
        {t('reservationExpiresIn', {
          minutes: progress.minutes,
          seconds: progress.seconds,
        })}
      </div>
      <LinearProgress
        className="public-registration__grid__timer-progressbar"
        variant="determinate"
        value={progress.value}
        aria-hidden={true}
      />
      <CustomModal
        data-testid="public-registration__reservation-expired-modal"
        className="public-registration__renew-reservation-modal"
        open={isExpired}
        onCloseModal={() => {}}
        aria-labelledby="expired-modal-title"
        aria-describedby="expired-modal-description"
        modalTitle={t('reservationExpired')}
      >
        <>
          <Text id="expired-modal-description">
            {t('reservationExpiredText')}
          </Text>
          <div className="columns gapped flex-end">
            <CustomButton
              data-testid="public-registration__reservation-expired-ok-button"
              variant={Variant.Text}
              color={Color.Secondary}
              onClick={() => navigate(RegistrationRoutes.Listing)}
            >
              {t('reservationExpiredContinue')}
            </CustomButton>
          </div>
        </>
      </CustomModal>
    </Box>
  );
};

export const MemoizedPublicRegistrationTimer = memo(PublicRegistrationTimer);
