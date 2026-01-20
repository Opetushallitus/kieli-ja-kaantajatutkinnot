import CloseIcon from '@mui/icons-material/Close';
import { Box, TextField } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { CustomDatePicker, CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2, Label, Text } from 'ophTheme/Text';
import {
  FreeRegistrationModalStatus,
  resetSupplementRequestStatus,
  submitClerkFreeRegistrationSupplementRequest,
} from 'redux/reducers/clerkFreeRegistration';
import { clerkFreeRegistrationSelector } from 'redux/selectors/clerkFreeRegistration';

type FreeRegistrationSupplementRequestModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  freeRegistrationId: number;
  renderPersonDetails: () => React.JSX.Element;
  renderExamSessionDetails: () => React.JSX.Element;
};

export const FreeRegistrationSupplementRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  freeRegistrationId,
  renderPersonDetails,
  renderExamSessionDetails,
}: FreeRegistrationSupplementRequestModalProps) => {
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState<Dayjs | null>(() =>
    dayjs().add(7, 'day'),
  );
  const [touched, setTouched] = useState(false);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });
  const { modalSubmitStatus } = useAppSelector(clerkFreeRegistrationSelector);
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    () => dispatch(resetSupplementRequestStatus());
  });

  const handleCloseModal = () => {
    setMessage('');
    setDueDate(dayjs().add(7, 'day'));
    setIsModalOpen(false);
    setTouched(false);
  };

  const messageError = touched && message.trim().length === 0;
  const dateError = touched && (!dueDate || dueDate.isBefore(dayjs(), 'day'));

  return (
    <CustomModal
      open={isModalOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('details.modals.supplementRequest.title')}</H2>
          <div className="free-registration-details__modal-close-icon">
            <CloseIcon
              color={Color.Inherit}
              aria-hidden={true}
              fontSize="large"
              onClick={handleCloseModal}
            />
          </div>
        </Box>
      }
    >
      <div className="rows gapped">
        <div>
          {renderPersonDetails()}
          {renderExamSessionDetails()}
        </div>
        <div>
          <Label>{t('details.modals.supplementRequest.subTitleLabel')}</Label>
          <Text>{t('details.modals.supplementRequest.subTitle')}</Text>
          <TextField
            id="supplement-request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched(true)}
            error={messageError}
            helperText={
              messageError
                ? t('details.modals.supplementRequest.messageError')
                : ' '
            }
            minRows={4}
            multiline
            fullWidth
          />
        </div>
        <div>
          <Label>{t('details.modals.supplementRequest.dueDateLabel')}</Label>
          <Text>
            {t('details.modals.supplementRequest.dueDateDescription')}
          </Text>
          <CustomDatePicker
            value={dueDate}
            setValue={(value: Dayjs | null) => setDueDate(value)}
            onError={() => setTouched(true)}
            helperText={
              dateError
                ? t('details.modals.supplementRequest.dueDateError')
                : ''
            }
          />
        </div>
        <div className="columns gapped flex-end">
          <OphButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleCloseModal}
          >
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            disabled={
              modalSubmitStatus ===
              FreeRegistrationModalStatus.SupplementRequestInProgress
            }
            onClick={() => {
              setTouched(true);
              if (!message || !dueDate) return;

              dispatch(
                submitClerkFreeRegistrationSupplementRequest({
                  freeRegistrationId,
                  message: message.trim(),
                  dueDate,
                }),
              );
              handleCloseModal();
            }}
          >
            {t('details.modals.supplementRequest.submitButton')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
