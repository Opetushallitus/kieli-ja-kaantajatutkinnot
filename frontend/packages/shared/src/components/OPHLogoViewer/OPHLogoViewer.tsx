import { FC } from 'react';

import { AppLanguage, Direction } from '../../enums/common';
import OPHLogoENHorizontal from '../../static/svg/oph_logo_horiz_en.svg';
import OPHLogoHorizontal from '../../static/svg/oph_logo_horiz_fi_sv.svg';
import OPHLogoENVertical from '../../static/svg/oph_logo_vert_en.svg';
import OPHLogoVertical from '../../static/svg/oph_logo_vert_fi_sv.svg';
import { Svg } from '../Svg/Svg';

interface OPHLogoViewerProps {
  direction: Direction;
  className?: string;
  alt: string;
  currentLang: string;
}

export const OPHLogoViewer: FC<OPHLogoViewerProps> = ({
  className,
  direction,
  alt,
  currentLang,
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

  return <Svg className={className} src={getLogo()} alt={alt} />;
};
