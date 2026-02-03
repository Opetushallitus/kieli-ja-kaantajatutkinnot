import { OphButton } from '@opetushallitus/oph-design-system';
import { useNavigate } from 'react-router-dom';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

type ClerkAddOrganizerDetailsProps = {
  selectedOrganizationOid: string;
};

export const ClerkAddOrganizerDetails = ({
  selectedOrganizationOid,
}: ClerkAddOrganizerDetailsProps) => {
  console.log('Selected Organization OID:', selectedOrganizationOid);
  const navigate = useNavigate();

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });
  const translateCommon = useCommonTranslation();

  const handleCancel = () => {
    navigate(AppRoutes.ClerkOrganizerRegister);
  };

  const handleSave = () => {
    // TODO: Implement add organizer logic
    navigate(AppRoutes.ClerkOrganizerRegister);
  };

  return (
    <div
      className="rows gapped"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="columns gapped flex-end" style={{ marginTop: '1rem' }}>
        <OphButton
          variant={Variant.Outlined}
          color={Color.Primary}
          onClick={handleCancel}
        >
          {translateCommon('cancel')}
        </OphButton>
        <OphButton
          variant={Variant.Contained}
          color={Color.Primary}
          onClick={handleSave}
        >
          {t('listing.modals.addOrganizer.addButton')}
        </OphButton>
      </div>
    </div>
  );
};
