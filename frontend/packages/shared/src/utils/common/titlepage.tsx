import { ReactNode } from 'react';

import { useTitle } from '../..//hooks';

export interface TitlePageProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const TitlePage = ({ title, children, className }: TitlePageProps) => {
  useTitle(title);

  return <div className={className}>{children}</div>;
};
