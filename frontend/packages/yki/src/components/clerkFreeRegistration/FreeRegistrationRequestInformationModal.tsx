import CloseIcon from '@mui/icons-material/Close';
import { Box, TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import {
  CustomButton,
  CustomDatePicker,
  CustomModal,
  Text,
} from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H1, Label } from 'ophTheme/Text';
import {
  FreeRegistrationModalStatus,
  resetInformationRequestStatus,
  submitClerkFreeRegistrationInformationRequest,
} from 'redux/reducers/clerkFreeRegistration';
import { clerkFreeRegistrationSelector } from 'redux/selectors/clerkFreeRegistration';

type FreeRegistrationRequestInformationModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  registrationId: number;
  renderPersonDetails: () => React.JSX.Element;
  renderExamSessionDetails: () => React.JSX.Element;
};

export const FreeRegistrationRequestInformationModal = ({
  isModalOpen,
  setIsModalOpen,
  registrationId,
  renderPersonDetails,
  renderExamSessionDetails,
}: FreeRegistrationRequestInformationModalProps) => {
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
    () => dispatch(resetInformationRequestStatus());
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
          <H1>{t('details.modals.informationRequest.title')}</H1>
          <CloseIcon
            color={Color.Primary}
            aria-hidden={true}
            fontSize="large"
            onClick={() => setIsModalOpen(false)}
          />
        </Box>
      }
    >
      <div className="rows gapped">
        <div>
          {renderPersonDetails()}
          {renderExamSessionDetails()}
        </div>
        <div>
          <Label>{t('details.modals.informationRequest.subTitleLabel')}</Label>
          <Text>{t('details.modals.informationRequest.subTitle')}</Text>
          <TextField
            label={t('details.modals.informationRequest.subTitleLabel')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched(true)}
            error={messageError}
            helperText={
              messageError
                ? t('details.modals.informationRequest.messageError')
                : ' '
            }
            minRows={4}
            multiline
            fullWidth
          />
        </div>
        <div>
          <Label>{t('details.modals.informationRequest.dueDateLabel')}</Label>
          <Text>
            {t('details.modals.informationRequest.dueDateDescription')}
          </Text>
          <CustomDatePicker
            value={dueDate}
            setValue={(value: Dayjs | null) => setDueDate(value)}
            onError={() => setTouched(true)}
            helperText={
              dateError
                ? t('details.modals.informationRequest.dueDateError')
                : ''
            }
          />
        </div>
        <div className="columns gapped flex-end">
          <CustomButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleCloseModal}
          >
            {translateCommon('cancel')}
          </CustomButton>
          <CustomButton
            variant={Variant.Contained}
            disabled={
              modalSubmitStatus ===
              FreeRegistrationModalStatus.InformationRequestInProgress
            }
            onClick={() => {
              setTouched(true);
              if (!message || !dueDate) return;

              dispatch(
                submitClerkFreeRegistrationInformationRequest({
                  registrationId,
                  message: message.trim(),
                  dueDate,
                }),
              );
              handleCloseModal();
            }}
          >
            {t('details.modals.informationRequest.submitButton')}
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
