import { CircularProgress, CircularProgressProps } from '@mui/material';

export const CustomCircularProgress = (props: CircularProgressProps) => (
  <div className="custom-circular-progress">
    <CircularProgress {...props} />
  </div>
);
