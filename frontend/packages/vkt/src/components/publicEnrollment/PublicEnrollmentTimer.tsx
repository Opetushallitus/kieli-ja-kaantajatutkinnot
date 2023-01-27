import { Box, LinearProgress } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

export const PublicEnrollmentTimer = ({ expires }: { expires: Dayjs }) => {
  const [progress, setProgress] = useState({
    value: 0,
    minutes: '',
    seconds: '',
  });

  setInterval(() => {
    const secondsDiff = expires.diff(dayjs(), 'second');
    const minutes = Math.floor(secondsDiff / 60);
    const seconds = secondsDiff - minutes * 60;

    setProgress({
      value: 100 - Math.floor((secondsDiff / 1800) * 100),
      seconds: String(seconds).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
    });
  }, 1000);

  return (
    <Box className="public-enrollment__grid__progress-container">
      <span>
        Paikkavarauksesi tutkintoon umpeutuu: {progress.minutes}:
        {progress.seconds}
      </span>
      <LinearProgress
        className="public-enrollment__grid__timer-progressbar"
        variant="determinate"
        value={progress.value}
      />
    </Box>
  );
};
