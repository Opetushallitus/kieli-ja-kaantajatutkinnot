import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';
import { LinkProps } from 'react-router-dom';

type CustomButtonProps = ButtonProps &
  Partial<Pick<LinkProps, 'target' | 'rel'>>;

export const CustomButton: FC<CustomButtonProps> = ({ ...props }) => {
  return <Button {...props} aria-disabled={props.disabled} />;
};
