import { Button, ButtonProps } from '@mui/material';
import { FC } from 'react';
import { Link, LinkProps } from 'react-router-dom';

type CustomButtonLinkProps = ButtonProps &
  Pick<LinkProps, 'target' | 'rel' | 'to'>;

export const CustomButtonLink: FC<CustomButtonLinkProps> = ({
  to,
  target,
  rel,
  ...btnProps
}) => {
  return (
    <Link className="custom-button-link" to={to} target={target} rel={rel}>
      <Button {...btnProps}></Button>
    </Link>
  );
};
