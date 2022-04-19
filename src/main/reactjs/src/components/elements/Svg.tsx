import { FC } from 'react';

export const Svg: FC<{
  className?: string;
  src: string;
  alt: string;
}> = ({ className, src, alt }) => {
  return <img className={className} src={src} alt={alt} />;
};
