import { Link } from '@mui/material';
import { FC } from 'react';

import { Text } from '../Text/Text';
import './SkipLink.scss';

export interface SkipLinkProps {
  text: string;
  href: string;
}

export const SkipLink: FC<SkipLinkProps> = ({ text, href }) => {
  return (
    <Link className="skip-link" href={href} color={'secondary'}>
      <Text>{text}</Text>
    </Link>
  );
};
