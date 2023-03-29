import { ReactNode } from 'react';

import { useTitle } from '../..//hooks';

interface TitleProps {
  title: string;
  children: ReactNode;
}

export const TitlePage = ({ title, children }: TitleProps) => {
  useTitle(title);

  return <>{children}</>;
};
