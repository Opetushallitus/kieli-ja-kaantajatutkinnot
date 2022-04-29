import { CircularProgress, CircularProgressProps } from '@mui/material';

import './CustomCircularProgress.scss';

export const CustomCircularProgress = (props: CircularProgressProps) => (
  <div className="custom-circular-progress">
    <CircularProgress {...props} />
  </div>
);
