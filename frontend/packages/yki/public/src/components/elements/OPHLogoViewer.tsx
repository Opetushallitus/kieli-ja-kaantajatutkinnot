import { FC } from 'react';
import { AppLanguage } from 'shared/enums';

import OPHLogoEN from 'static/opintopolku_logo_header_en.svg';
import OPHLogoFI from 'static/opintopolku_logo_header_fi.svg';
import OPHLogoSV from 'static/opintopolku_logo_header_sv.svg';

// Scale the fractional SVG viewBox dimensions to integer HTML dimensions.
// CSS sets the displayed height; these dimensions reserve the correct ratio.
const logos = {
  [AppLanguage.Finnish]: { src: OPHLogoFI, width: 15387, height: 2457 },
  [AppLanguage.English]: { src: OPHLogoEN, width: 10718, height: 1812 },
  [AppLanguage.Swedish]: { src: OPHLogoSV, width: 12018, height: 2100 },
};

interface OPHLogoViewerProps {
  className?: string;
  alt: string;
  currentLang: AppLanguage;
}

export const OPHLogoViewer: FC<OPHLogoViewerProps> = ({
  className,
  alt,
  currentLang,
}) => {
  return <img className={className} {...logos[currentLang]} alt={alt} />;
};
