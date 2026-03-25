import { TextField } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';
import { CustomModal } from 'shared/components';
import { TextFieldTypes, Variant } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { CustomerPerson } from 'interfaces/clerkCustomer';
import { Label } from 'ophTheme/Text';
import { updateCustomerContactDetails } from 'redux/reducers/clerkCustomerDetails';

type EditCustomerInformationModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  person: CustomerPerson;
};

export const EditCustomerInformationModal = ({
  isModalOpen,
  setIsModalOpen,
  person,
}: EditCustomerInformationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();

  const [email, setEmail] = useState(person.email);
  const [confirmEmail, setConfirmEmail] = useState(person.email);
  const [streetAddress, setStreetAddress] = useState(person.streetAddress);
  const [phoneNumber, setPhoneNumber] = useState(person.phoneNumber);
  const [zip, setZip] = useState(person.zip);
  const [postOffice, setPostOffice] = useState(person.postOffice);
  const [emailMismatch, setEmailMismatch] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      setEmail(person.email);
      setConfirmEmail(person.email);
      setStreetAddress(person.streetAddress);
      setPhoneNumber(person.phoneNumber);
      setZip(person.zip);
      setPostOffice(person.postOffice);
      setEmailMismatch(false);
      setEmailError('');
      setPhoneNumberError('');
    }
  }, [isModalOpen, person]);

  return (
    <CustomModal
      open={isModalOpen}
      onCloseModal={() => setIsModalOpen(false)}
      aria-labelledby="edit-customer-information-modal-title"
      modalTitle={t('details.fields.modalTitle')}
    >
      <div className="rows gapped">
        <div className="">
          <Label>{person.firstName + ' ' + person.lastName}</Label>
          <div>{person.ssn}</div>
          <div>{person.oid}</div>
        </div>
        <div className="rows gapped-xs">
          <Label>{t('details.fields.email')}</Label>
          <TextField
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailMismatch || !!emailError}
            helperText={emailError}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            fullWidth
          />

          <Label>{t('details.fields.confirmEmail')}</Label>
          <TextField
            value={confirmEmail}
            onChange={(event) => setConfirmEmail(event.target.value)}
            error={emailMismatch}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            fullWidth
          />
        </div>
        <div className="rows gapped-xxs">
          <Label>{t('details.fields.phoneNumber')}</Label>
          <TextField
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            error={!!phoneNumberError}
            helperText={phoneNumberError}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            fullWidth
          />

          <Label>{t('details.fields.streetAddress')}</Label>
          <TextField
            value={streetAddress}
            onChange={(event) => setStreetAddress(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            fullWidth
          />

          <div className="columns gapped">
            <div className="rows gapped-xxs" style={{ flex: 1 }}>
              <Label>{t('details.fields.zip')}</Label>
              <TextField
                value={zip}
                onChange={(event) => setZip(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 255 } }}
                fullWidth
              />
            </div>
            <div className="rows gapped-xxs" style={{ flex: 2 }}>
              <Label>{t('details.fields.postOffice')}</Label>
              <TextField
                value={postOffice}
                onChange={(event) => setPostOffice(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 50 } }}
                fullWidth
              />
            </div>
          </div>
        </div>
        <div className="columns gapped flex-end">
          <OphButton
            variant={Variant.Outlined}
            onClick={() => setIsModalOpen(false)}
          >
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={() => {
              const emailValidation =
                InputFieldUtils.validateCustomTextFieldErrors({
                  type: TextFieldTypes.Email,
                  value: email ?? '',
                  required: true,
                });
              const phoneValidation =
                InputFieldUtils.validateCustomTextFieldErrors({
                  type: TextFieldTypes.PhoneNumber,
                  value: phoneNumber ?? '',
                  required: true,
                });

              setEmailError(
                emailValidation ? translateCommon(emailValidation) : '',
              );
              setPhoneNumberError(
                phoneValidation ? translateCommon(phoneValidation) : '',
              );
              setEmailMismatch(!emailValidation && email !== confirmEmail);

              if (
                emailValidation ||
                phoneValidation ||
                email !== confirmEmail
              ) {
                return;
              }
              dispatch(
                updateCustomerContactDetails({
                  oid: person.oid,
                  email: email ?? '',
                  phoneNumber: phoneNumber ?? '',
                  streetAddress: streetAddress ?? '',
                  postOffice: postOffice ?? '',
                  zip: zip ?? '',
                }),
              );
              setIsModalOpen(false);
            }}
          >
            {t('details.buttons.save')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
