import { FC } from 'react';
import { Svg } from 'shared/components';
import { AppLanguage } from 'shared/enums';

import OPHLogoEN from 'static/opintopolku_logo_header_en.svg';
import OPHLogoFI from 'static/opintopolku_logo_header_fi.svg';
import OPHLogoSV from 'static/opintopolku_logo_header_sv.svg';

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
  const getLogo = () => {
    if (currentLang === AppLanguage.Finnish) {
      return OPHLogoFI;
    } else if (currentLang === AppLanguage.English) {
      return OPHLogoEN;
    } else if (currentLang === AppLanguage.Swedish) {
      return OPHLogoSV;
    }
  };

  return <Svg className={className} src={getLogo()} alt={alt} />;
};
