import { FC } from 'react';

import OPHLogo from '../../statics/svg/oph_logo_textless.svg';
import { Svg } from '../Svg/Svg';
import { Text } from '../Text/Text';
import { CommonUtils } from 'utils';
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
  const classNames = CommonUtils.combineClassNames([
    'oph-clerk-logo columns',
    className,
  ]);

  return (
    <div className={classNames}>
      <Svg className="oph-clerk-logo__img" src={OPHLogo} alt={alt} />
      <div className="rows">
        <Text className="oph-clerk-logo__label--bold">{mainLabel}</Text>
        <Text className="oph-clerk-logo__label">{subLabel}</Text>
      </div>
    </div>
  );
};
