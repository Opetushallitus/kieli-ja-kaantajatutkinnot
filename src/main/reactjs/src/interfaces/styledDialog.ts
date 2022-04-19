import { DialogProps } from '@mui/material';

export interface StyledDialogProps extends DialogProps {
  title: string;
  content: JSX.Element;
  actions: JSX.Element;
}
