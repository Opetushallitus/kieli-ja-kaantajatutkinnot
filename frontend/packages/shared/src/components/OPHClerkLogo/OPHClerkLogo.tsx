import { FC } from 'react';

import OPHLogo from '../../statics/svg/oph_logo_textless.svg';
import { Svg } from '../Svg/Svg';
import { Text } from '../Text/Text';
import './OPHClerkLogo.scss';

interface OPHClerkLogoProps {
  className?: string;
  mainLabel: string;
  subLabel: string;
  alt: string;
}

export const OPHClerkLogo: FC<OPHClerkLogoProps> = ({
  className,
  mainLabel,
  subLabel,
  alt,
}) => {
  return (
    <div className={`oph-clerk-logo columns ${className}`}>
      <Svg className="oph-clerk-logo__img" src={OPHLogo} alt={alt} />
      <div className="rows">
        <Text className="oph-clerk-logo__label--bold">{mainLabel}</Text>
        <Text className="oph-clerk-logo__label">{subLabel}</Text>
      </div>
    </div>
  );
};
