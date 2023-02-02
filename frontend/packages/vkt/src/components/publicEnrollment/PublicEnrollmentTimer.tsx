import { Box, LinearProgress } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { CustomButton, CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';

export const PublicEnrollmentTimer = ({ expires }: { expires: Dayjs }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.expirationTimer',
  });

  const total = 1800;
  const calcProgress = (expires: Dayjs, total: number) => {
    const secondsDiff = Math.max(0, expires.diff(dayjs(), 'second'));
    const minutes = Math.floor(secondsDiff / 60);
    const seconds = secondsDiff - minutes * 60;

    return {
      value: 100 - Math.floor((secondsDiff / total) * 100),
      seconds: String(seconds).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
    };
  };

  const [progress, setProgress] = useState(calcProgress(expires, total));
  const [timerWarningOpen, setTimerWarningOpen] = useState(true);

  setInterval(() => setProgress(calcProgress(expires, total)), 1000);

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
      />
      <CustomModal
        data-testid="qualification-details__add-qualification-modal"
        open={timerWarningOpen}
        onCloseModal={() => setTimerWarningOpen(false)}
        ariaLabelledBy="modal-title"
        modalTitle={t('addQualification')}
      >
        <CustomButton
          data-testid="clerk-new-interpreter-page__add-qualification-button"
          variant={Variant.Contained}
          color={Color.Secondary}
        >
          {t('addQualification')}
        </CustomButton>
      </CustomModal>
    </Box>
  );
};
