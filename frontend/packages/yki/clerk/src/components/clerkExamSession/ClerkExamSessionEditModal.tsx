import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2 } from 'ophTheme/Text';
import {
  resetEditForm,
  updateEditForm,
} from 'redux/reducers/clerkExamSession';
import { clerkExamSessionEditFormSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

type ClerkExamSessionEditModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const ClerkExamSessionEditModal = ({
  isOpen,
  setIsOpen,
}: ClerkExamSessionEditModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.modals.edit',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const editForm = useAppSelector(clerkExamSessionEditFormSelector);

  const handleCloseModal = () => {
    dispatch(resetEditForm());
    setIsOpen(false);
  };

  return (
    <CustomModal
      open={isOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('title')}</H2>
          <CloseIcon
            color={Color.Inherit}
            aria-hidden={true}
            fontSize="large"
            onClick={handleCloseModal}
          />
        </Box>
      }
    >
      <div className="rows gapped">
        <OphInputFormField
          label={t('fields.maxParticipants')}
          value={editForm.maxParticipants}
          onChange={(e) =>
            dispatch(updateEditForm({ maxParticipants: e.target.value }))
          }
          type="number"
        />
        <OphInputFormField
          label={t('fields.streetAddress')}
          value={editForm.streetAddress}
          onChange={(e) =>
            dispatch(updateEditForm({ streetAddress: e.target.value }))
          }
        />
        <div className="columns gapped">
          <OphInputFormField
            label={t('fields.postalCode')}
            value={editForm.postalCode}
            onChange={(e) =>
              dispatch(updateEditForm({ postalCode: e.target.value }))
            }
          />
          <OphInputFormField
            label={t('fields.city')}
            value={editForm.city}
            onChange={(e) =>
              dispatch(updateEditForm({ city: e.target.value }))
            }
          />
        </div>
        <OphInputFormField
          label={t('fields.contactInfo')}
          value={editForm.contactInfo}
          onChange={(e) =>
            dispatch(updateEditForm({ contactInfo: e.target.value }))
          }
        />
        <div className="columns gapped flex-end">
          <OphButton
            variant={Variant.Outlined}
            onClick={handleCloseModal}
          >
            {translateCommon('cancel')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
