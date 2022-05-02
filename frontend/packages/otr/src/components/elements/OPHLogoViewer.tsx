import { FC } from 'react';

import { Svg } from 'components/elements/Svg';
import { getCurrentLang } from 'configs/i18n';
import { AppLanguage, Direction } from 'enums/app';
import OPHLogoENHorizontal from 'public/assets/svg/oph_logo_horiz_en.svg';
import OPHLogoHorizontal from 'public/assets/svg/oph_logo_horiz_fi_sv.svg';
import OPHLogoENVertical from 'public/assets/svg/oph_logo_vert_en.svg';
import OPHLogoVertical from 'public/assets/svg/oph_logo_vert_fi_sv.svg';

interface OPHLogoViewerProps {
  direction: Direction;
  className?: string;
  alt: string;
}

export const OPHLogoViewer: FC<OPHLogoViewerProps> = ({
  className,
  direction,
  alt,
}) => {
  const currentLang = getCurrentLang();

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
