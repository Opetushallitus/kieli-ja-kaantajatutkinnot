import { ButtonProps } from '@mui/material';
import { FC } from 'react';

import { Color } from '../../enums';
import { CustomButton } from '../CustomButton/CustomButton';

export interface ExtLinkProps {
  text: string;
  href: string;
  target?: string;
}

// TODO: use accessible WebLink instead
export const ExtLink: FC<ButtonProps & ExtLinkProps> = ({
  text,
  href,
  startIcon,
  endIcon,
  className,
  'aria-label': ariaLabel,
  ...rest
}) => {
  return (
    <CustomButton
      className={className}
      target={rest.target ?? "_blank"}
      rel="noreferrer"
      color={rest.color ?? Color.Inherit}
      href={href}
      startIcon={startIcon}
      endIcon={endIcon}
      aria-label={ariaLabel}
      {...rest}
    >
      {text}
    </CustomButton>
  );
};
