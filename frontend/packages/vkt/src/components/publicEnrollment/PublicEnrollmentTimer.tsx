import { Box, LinearProgress } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

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

  setInterval(() => setProgress(calcProgress(expires, total)), 1000);

  return (
    <Box className="public-enrollment__grid__progress-container">
      <div className="public-enrollment__grid__progress-text">
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
    </Box>
  );
};
