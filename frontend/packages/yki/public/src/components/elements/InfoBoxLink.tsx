import { OphLink } from '@opetushallitus/oph-design-system';

import { useCommonTranslation } from 'configs/i18n';

export const InfoBoxLink = () => {
  const translateCommon = useCommonTranslation();

  return (
    <OphLink href={translateCommon('infoBoxLink.url')} target="_blank">
      {translateCommon('infoBoxLink.label')}
    </OphLink>
  );
};
