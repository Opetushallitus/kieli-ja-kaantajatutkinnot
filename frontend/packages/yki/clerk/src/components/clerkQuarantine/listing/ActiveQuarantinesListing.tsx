import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { Variant } from 'shared/enums';

import { AddNewQuarantineModal } from 'components/clerkQuarantine/listing/AddNewQuarantineModal';
import { usePublicTranslation } from 'configs/i18n';

export const ActiveQuarantinesListing = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.activeQuarantines',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="rows gapped">
      <OphButton
        className="align-self-start"
        variant={Variant.Contained}
        onClick={() => setIsModalOpen(true)}
      >
        {t('addButton')}
      </OphButton>
      <AddNewQuarantineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
