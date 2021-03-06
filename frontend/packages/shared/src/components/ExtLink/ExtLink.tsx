import { ButtonProps } from '@mui/material';
import { FC } from 'react';

import { Color } from '../../enums/common';
import { CustomButton } from '../CustomButton/CustomButton';

export interface ExtLinkProps {
  text: string;
  href: string;
}

export const ExtLink: FC<ButtonProps & ExtLinkProps> = ({
  text,
  href,
  endIcon,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <CustomButton
      className={className}
      target="_blank"
      rel="noreferrer"
      color={Color.Inherit}
      href={href}
      endIcon={endIcon}
      aria-label={ariaLabel}
    >
      {text}
    </CustomButton>
  );
};
