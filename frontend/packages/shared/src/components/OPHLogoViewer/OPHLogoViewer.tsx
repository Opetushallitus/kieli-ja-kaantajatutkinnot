import { FC } from 'react';

import { AppLanguage, Direction } from '../../enums/common';
import OPHLogoENHorizontal from '../../statics/svg/oph_logo_horiz_en.svg';
import OPHLogoHorizontal from '../../statics/svg/oph_logo_horiz_fi_sv.svg';
import OPHLogoENVertical from '../../statics/svg/oph_logo_vert_en.svg';
import OPHLogoVertical from '../../statics/svg/oph_logo_vert_fi_sv.svg';
import { Svg } from '../Svg/Svg';
import { Text } from '../Text/Text';
import './OPHLogoViewer.scss';

interface OPHLogoViewerProps {
  direction: Direction;
  className?: string;
  alt: string;
  currentLang: string;
  title?: string;
}

export const OPHLogoViewer: FC<OPHLogoViewerProps> = ({
  className,
  direction,
  alt,
  currentLang,
  title,
}) => {
  const getLogo = () => {
    const isEnglish = currentLang === AppLanguage.English;

    if (isEnglish && direction === Direction.Horizontal) {
      return OPHLogoENHorizontal;
    } else if (isEnglish && direction === Direction.Vertical) {
      return OPHLogoENVertical;
    } else if (!isEnglish && direction === Direction.Horizontal) {
      return OPHLogoHorizontal;
    } else if (!isEnglish && direction === Direction.Vertical) {
      return OPHLogoVertical;
    }
  };

  return (
    <div className="oph-logo columns">
      <Svg className={className} src={getLogo()} alt={alt} />
      {title && <Text className="oph-logo__label--bold">{title}</Text>}
    </div>
  );
};
