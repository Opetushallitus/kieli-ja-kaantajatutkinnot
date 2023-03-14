import { ReactNode, useEffect } from 'react';

interface TitleProps {
  title: string;
  children: ReactNode;
}

export const TitlePage = ({ title, children }: TitleProps) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <>{children}</>;
};
