import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { useEffect, useRef, useState } from 'react';
import { CustomModal } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { H2 } from 'ophTheme/Text';
import { saveExamSession } from 'redux/reducers/clerkExamSession';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

type ClerkExamSessionEditModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  examSessionDetails: ClerkExamSession;
};

export const ClerkExamSessionEditModal = ({
  isOpen,
  setIsOpen,
  examSessionDetails,
}: ClerkExamSessionEditModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.modals.edit',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { updateStatus } = useAppSelector(clerkExamSessionDetailsSelector);

  const location = examSessionDetails.location[0];
  const contact = examSessionDetails.contact[0];
  const isSaving = updateStatus === APIResponseStatus.InProgress;
  const prevUpdateStatus = useRef(updateStatus);

  useEffect(() => {
    if (
      prevUpdateStatus.current === APIResponseStatus.InProgress &&
      updateStatus === APIResponseStatus.Success
    ) {
      setIsOpen(false);
    }
    prevUpdateStatus.current = updateStatus;
  }, [updateStatus, setIsOpen]);

  const [form, setForm] = useState({
    maxParticipants: String(examSessionDetails.maxParticipants ?? ''),
    streetAddress: location?.streetAddress ?? '',
    postalCode: location?.zip ?? '',
    city: location?.postOffice ?? '',
    contactInfo: contact?.name ?? '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    dispatch(
      saveExamSession({
        examSessionId: examSessionDetails.id,
        form,
      }),
    );
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
          value={form.maxParticipants}
          onChange={(e) => updateField('maxParticipants', e.target.value)}
          type="number"
          disabled={isSaving}
        />
        <OphInputFormField
          label={t('fields.streetAddress')}
          value={form.streetAddress}
          onChange={(e) => updateField('streetAddress', e.target.value)}
          disabled={isSaving}
        />
        <div className="columns gapped">
          <OphInputFormField
            label={t('fields.postalCode')}
            value={form.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            disabled={isSaving}
          />
          <OphInputFormField
            label={t('fields.city')}
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            disabled={isSaving}
          />
        </div>
        <OphInputFormField
          label={t('fields.contactInfo')}
          value={form.contactInfo}
          onChange={(e) => updateField('contactInfo', e.target.value)}
          disabled={isSaving}
        />
        <div className="columns gapped flex-end">
          <OphButton variant={Variant.Outlined} onClick={handleCloseModal}>
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={handleSave}
            disabled={isSaving}
          >
            {t('saveButton')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
