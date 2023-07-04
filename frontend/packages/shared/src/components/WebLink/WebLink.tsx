import { Link } from '@mui/material';
import React, { FC } from 'react';
import './WebLink.scss';

export interface WebLinkProps {
  href: string;
  label: string;
  target?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const WebLink: FC<WebLinkProps> = ({
  href,
  label,
  target = '_blank',
  startIcon,
  endIcon,
}) => {
  const link = (
    <Link sx={{ fontWeight: 400 }} href={href} target={target}>
      {label}
    </Link>
  );

  if (!startIcon && !endIcon) {
    return <>{link}</>;
  }

  return (
    <span className="weblink">
      <span className="icon">
        {startIcon && startIcon}
      </span>
      {link}
      <span className="icon">
        {endIcon && endIcon}
      </span>
    </span>
  );
};
