import { FC } from 'react';
import { Button, Link, ButtonProps } from '@mui/material';

import { ExtLinkProps } from 'interfaces/extLink';

export const ExtLink: FC<ButtonProps & ExtLinkProps> = ({
  text,
  href,
  endIcon,
}) => {
  return (
    <Button
      target="_blank"
      rel="noreferrer"
      component={Link}
      variant="text"
      color="inherit"
      href={href}
      endIcon={endIcon}
    >
      {text}
    </Button>
  );
};
