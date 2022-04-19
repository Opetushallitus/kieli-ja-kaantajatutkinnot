import { CircularProgress, CircularProgressProps } from '@mui/material';

export const ProgressIndicator = (props: CircularProgressProps) => (
  <div className="progress-indicator">
    <CircularProgress {...props} />
  </div>
);
