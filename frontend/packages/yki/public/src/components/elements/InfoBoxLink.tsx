import { OphLink } from '@opetushallitus/oph-design-system';

import { useCommonTranslation } from 'configs/i18n';

export const InfoBoxLink = () => {
  const translateCommon = useCommonTranslation();

  return (
    <OphLink href={translateCommon('partialExamsLink.url')} target="_blank">
      {translateCommon('partialExamsLink.label')}
    </OphLink>
  );
};
