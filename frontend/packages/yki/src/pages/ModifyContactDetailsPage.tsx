import { Box, Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import {
  H1,
  H2,
  HeaderSeparator,
  LabeledTextField,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  InputAutoComplete,
  TextFieldTypes,
} from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadPersonDetails } from 'redux/reducers/userDetails';
import { userDetailsSelector } from 'redux/selectors/userDetails';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.modifyContactDetailsPage',
  });

  return (
    <Grid className="modify-contact-details-page__grid-container__item-header">
      <H1>{t('title')}</H1>
      <HeaderSeparator />
    </Grid>
  );
};

const ContactDetailInputFields = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const { isPhone } = useWindowProperties();

  if (isPhone) {
    return (
      <>
        <LabeledTextField
          id="modify-contact-details__input-field__address"
          label={`${t('labels.address')} *`}
          placeholder={t('placeholders.address')}
          autoComplete={InputAutoComplete.Street}
          fullWidth
        />
        <LabeledTextField
          id="modify-contact-details__input-field__postNumber"
          label={`${t('labels.postNumber')} *`}
          placeholder={t('placeholders.postNumber')}
          autoComplete={InputAutoComplete.PostalCode}
          fullWidth
        />
        <LabeledTextField
          id="modify-contact-details__input-field__postOffice"
          label={`${t('labels.postOffice')} *`}
          placeholder={t('placeholders.postOffice')}
          autoComplete={InputAutoComplete.Town}
          fullWidth
        />
        <LabeledTextField
          id="modify-contact-details__input-field__email"
          label={`${t('labels.email')} *`}
          placeholder={t('placeholders.email')}
          type={TextFieldTypes.Email}
          autoComplete={InputAutoComplete.Email}
          fullWidth
        />
        <LabeledTextField
          id="modify-contact-details__input-field__emailConfirmation"
          label={`${t('labels.emailConfirmation')} *`}
          placeholder={t('placeholders.emailConfirmation')}
          type={TextFieldTypes.Email}
          autoComplete={InputAutoComplete.Email}
          onPaste={(e) => {
            e.preventDefault();

            return false;
          }}
          fullWidth
        />
        <LabeledTextField
          id="modify-contact-details__input-field__phoneNumber"
          label={`${t('labels.phoneNumber')} *`}
          placeholder={t('placeholders.phoneNumber')}
          type={TextFieldTypes.PhoneNumber}
          autoComplete={InputAutoComplete.PhoneNumber}
          fullWidth
        />
      </>
    );
  }

  return (
    <div className="grid-2-columns gapped">
      <LabeledTextField
        id="modify-contact-details__input-field__address"
        label={`${t('labels.address')} *`}
        placeholder={t('placeholders.address')}
        autoComplete={InputAutoComplete.Street}
      />
      <div className="grid-2-columns gapped">
        <LabeledTextField
          id="modify-contact-details__input-field__postNumber"
          label={`${t('labels.postNumber')} *`}
          placeholder={t('placeholders.postNumber')}
          autoComplete={InputAutoComplete.PostalCode}
        />
        <LabeledTextField
          id="modify-contact-details__input-field__postOffice"
          label={`${t('labels.postOffice')} *`}
          placeholder={t('placeholders.postOffice')}
          autoComplete={InputAutoComplete.Town}
        />
      </div>
      <LabeledTextField
        id="modify-contact-details__input-field__email"
        label={`${t('labels.email')} *`}
        placeholder={t('placeholders.email')}
        type={TextFieldTypes.Email}
        autoComplete={InputAutoComplete.Email}
      />
      <LabeledTextField
        id="modify-contact-details__input-field__emailConfirmation"
        label={`${t('labels.emailConfirmation')} *`}
        placeholder={t('placeholders.emailConfirmation')}
        type={TextFieldTypes.Email}
        autoComplete={InputAutoComplete.Email}
        onPaste={(e) => {
          e.preventDefault();

          return false;
        }}
      />
      <LabeledTextField
        id="modify-contact-details__input-field__phoneNumber"
        label={`${t('labels.phoneNumber')} *`}
        placeholder={t('placeholders.phoneNumber')}
        type={TextFieldTypes.PhoneNumber}
        autoComplete={InputAutoComplete.PhoneNumber}
      />
    </div>
  );
};

const EditContactDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.modifyContactDetailsPage',
  });
  const { personDetails } = useAppSelector(userDetailsSelector);

  if (!personDetails) {
    return null;
  }

  return (
    <Grid className="modify-contact-details-page__grid-container__item-info">
      <Paper elevation={3} className="modify-contact-details-page__info">
        <div className="rows gapped">
          <Text>
            {t('description.part1')} {t('description.part2')}
          </Text>
          <H2>
            {personDetails.firstName} {personDetails.lastName}
          </H2>
          <ContactDetailInputFields />
        </div>
      </Paper>
    </Grid>
  );
};

export const ModifyContactDetailsPage = () => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(userDetailsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadPersonDetails());
    }
  }, [dispatch, status]);

  const loading = status === APIResponseStatus.InProgress;

  return (
    <Box className="modify-contact-details-page">
      <LoadingProgressIndicator isLoading={loading}>
        <Grid
          container
          rowSpacing={4}
          direction="column"
          className="modify-contact-details-page__grid-container"
        >
          <Header />
          <EditContactDetails />
        </Grid>
      </LoadingProgressIndicator>
    </Box>
  );
};
