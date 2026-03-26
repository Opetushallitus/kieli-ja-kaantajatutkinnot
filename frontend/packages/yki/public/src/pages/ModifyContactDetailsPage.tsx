import { Box, Grid, Paper } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CustomButton,
  CustomButtonLink,
  H1,
  H2,
  HeaderSeparator,
  LabeledComboBox,
  LabeledTextField,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Duration,
  InputAutoComplete,
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog, useToast, useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useCountryOptions } from 'hooks/useCountryOptions';
import { useModifyContactDetailsErrors } from 'hooks/useModifyContactDetailsErrors';
import { ModifyContactDetails } from 'interfaces/userDetails';
import { loadNationalities } from 'redux/reducers/nationalities';
import { loadSession } from 'redux/reducers/session';
import {
  doModifyContactDetails,
  loadPersonDetails,
  resetModifyContactDetails,
  updateModifyContactDetails,
} from 'redux/reducers/userDetails';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
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

const ContactDetailInputFields = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.modifyContactDetailsPage',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const { modifyContactDetails } = useAppSelector(userDetailsSelector);
  const dispatch = useAppDispatch();

  const countryOptions = useCountryOptions();
  const getErrors = useModifyContactDetailsErrors(showErrors);
  const fieldErrors = getErrors();

  const updateModifyContactDetailsField = (
    fieldName: keyof ModifyContactDetails,
    value: string,
  ) => {
    dispatch(updateModifyContactDetails({ [fieldName]: value }));
  };

  const handleChange =
    (fieldName: keyof ModifyContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateModifyContactDetailsField(fieldName, event.target.value);
    };

  const getLabeledTextFieldAttributes = (
    fieldName: keyof ModifyContactDetails,
  ) => {
    return {
      id: `modify-contact-details__${fieldName}`,
      label: t('labels.' + fieldName) + ' *',
      onChange: handleChange(fieldName),
      value: modifyContactDetails[fieldName] || '',
      error: showErrors && !!fieldErrors[fieldName],
      helperText: fieldErrors[fieldName]
        ? translateCommon(fieldErrors[fieldName] as string)
        : '',
      placeholder: t('placeholders.' + fieldName),
      required: true,
      disabled: false,
      fullWidth: isPhone,
    };
  };

  const countryCodeDropdown = (
    <LabeledComboBox
      id="modify-contact-details__country-code-field"
      className="half-width-on-desktop"
      label={`${t('labels.countryCode')} *`}
      aria-label={`${t('labels.countryCode')} *`}
      placeholder={t('placeholders.countryCode')}
      variant={TextFieldVariant.Outlined}
      values={countryOptions}
      value={
        countryOptions.find(
          (o) => o.value === modifyContactDetails.countryCode,
        ) || null
      }
      onChange={(v?: string) => {
        dispatch(updateModifyContactDetails({ countryCode: v }));
      }}
      showError={showErrors && !!fieldErrors['countryCode']}
      helperText={
        fieldErrors['countryCode']
          ? translateCommon(fieldErrors['countryCode'] as string)
          : ''
      }
    />
  );

  if (isPhone) {
    return (
      <>
        <LabeledTextField
          {...getLabeledTextFieldAttributes('streetAddress')}
          autoComplete={InputAutoComplete.Street}
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('zip')}
          autoComplete={InputAutoComplete.PostalCode}
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('postOffice')}
          autoComplete={InputAutoComplete.Town}
        />
        {countryCodeDropdown}
        <LabeledTextField
          {...getLabeledTextFieldAttributes('email')}
          type={TextFieldTypes.Email}
          autoComplete={InputAutoComplete.Email}
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('confirmEmail')}
          type={TextFieldTypes.Email}
          autoComplete={InputAutoComplete.Email}
          onPaste={(e) => {
            e.preventDefault();

            return false;
          }}
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('phoneNumber')}
          type={TextFieldTypes.PhoneNumber}
          autoComplete={InputAutoComplete.PhoneNumber}
        />
      </>
    );
  }

  return (
    <div className="grid-2-columns gapped">
      <LabeledTextField
        {...getLabeledTextFieldAttributes('streetAddress')}
        autoComplete={InputAutoComplete.Street}
      />
      <LabeledTextField
        {...getLabeledTextFieldAttributes('zip')}
        autoComplete={InputAutoComplete.PostalCode}
      />
      <LabeledTextField
        {...getLabeledTextFieldAttributes('postOffice')}
        autoComplete={InputAutoComplete.Town}
      />
      {countryCodeDropdown}
      <LabeledTextField
        {...getLabeledTextFieldAttributes('email')}
        type={TextFieldTypes.Email}
        autoComplete={InputAutoComplete.Email}
      />
      <LabeledTextField
        {...getLabeledTextFieldAttributes('confirmEmail')}
        type={TextFieldTypes.Email}
        autoComplete={InputAutoComplete.Email}
        onPaste={(e) => {
          e.preventDefault();

          return false;
        }}
      />
      <LabeledTextField
        {...getLabeledTextFieldAttributes('phoneNumber')}
        type={TextFieldTypes.PhoneNumber}
        autoComplete={InputAutoComplete.PhoneNumber}
      />
    </div>
  );
};

const ControlButtons = ({
  setShowErrors,
}: {
  setShowErrors: (show: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.modifyContactDetailsPage',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const { showDialog } = useDialog();
  const getErrors = useModifyContactDetailsErrors(true);
  const { modifyContactDetailsStatus, modifyContactDetails } =
    useAppSelector(userDetailsSelector);
  const dispatch = useAppDispatch();
  const modifyRequestInProgress =
    modifyContactDetailsStatus === APIResponseStatus.InProgress;

  const trimmedValue = (value?: string) => (value ? value.trim() : '');

  const onSave = () => {
    dispatch(
      updateModifyContactDetails({
        email: trimmedValue(modifyContactDetails.email),
        confirmEmail: trimmedValue(modifyContactDetails.confirmEmail),
        phoneNumber: trimmedValue(modifyContactDetails.phoneNumber),
        streetAddress: trimmedValue(modifyContactDetails.streetAddress),
        postOffice: trimmedValue(modifyContactDetails.postOffice),
        zip: trimmedValue(modifyContactDetails.zip),
      }),
    );

    const errors = getErrors();
    if (Object.values(errors).some((v) => v)) {
      setShowErrors(true);
      const dialogContent = (
        <div>
          <Text>{t('errorDialog.fixErrors')}</Text>
          <ul>
            {Object.entries(errors)
              .filter(([_, val]) => val)
              .map(([field, _]) => (
                <li key={field}>
                  <Text>{t(`labels.${field}`)}</Text>
                </li>
              ))}
          </ul>
        </div>
      );
      showDialog({
        title: t('errorDialog.title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    } else {
      const payload = modifyContactDetails as ModifyContactDetails;
      dispatch(doModifyContactDetails(payload));
    }
  };

  const SaveButton = () => (
    <LoadingProgressIndicator isLoading={modifyRequestInProgress}>
      <CustomButton
        color={Color.Secondary}
        variant={Variant.Contained}
        fullWidth={isPhone}
        onClick={onSave}
        disabled={modifyRequestInProgress}
      >
        <Text color="white">{t('buttons.save')}</Text>
      </CustomButton>
    </LoadingProgressIndicator>
  );
  const CancelButton = () => (
    <CustomButtonLink
      color={Color.Secondary}
      variant={Variant.Outlined}
      fullWidth={isPhone}
      to={AppRoutes.UserDetails}
      disabled={modifyRequestInProgress}
    >
      {t('buttons.cancel')}
    </CustomButtonLink>
  );

  if (isPhone) {
    return (
      <>
        <SaveButton />
        <CancelButton />
      </>
    );
  } else {
    return (
      <div className="columns gapped margin-top-lg">
        <SaveButton />
        <CancelButton />
      </div>
    );
  }
};

const EditContactDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.modifyContactDetailsPage',
  });
  const { personDetails } = useAppSelector(userDetailsSelector);
  const [showErrors, setShowErrors] = useState(false);

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
          <ContactDetailInputFields showErrors={showErrors} />
          <ControlButtons setShowErrors={setShowErrors} />
        </div>
      </Paper>
    </Grid>
  );
};

export const ModifyContactDetailsPage = () => {
  const dispatch = useAppDispatch();
  const { status, personDetails, modifyContactDetailsStatus } =
    useAppSelector(userDetailsSelector);
  const { status: nationalitiesStatus } = useAppSelector(nationalitiesSelector);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.modifyContactDetailsPage',
  });

  useEffect(() => {
    if (nationalitiesStatus === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, nationalitiesStatus]);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadPersonDetails());
    } else if (status === APIResponseStatus.Success && personDetails) {
      const {
        email,
        phoneNumber,
        streetAddress,
        postOffice,
        zip,
        countryCode,
      } = personDetails;
      dispatch(
        updateModifyContactDetails({
          email,
          confirmEmail: email,
          phoneNumber,
          streetAddress,
          postOffice,
          zip,
          countryCode,
        }),
      );
    }
  }, [dispatch, status, personDetails]);

  useEffect(() => {
    if (modifyContactDetailsStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toast.success'),
        timeOut: Duration.MediumExtra,
      });
      navigate(AppRoutes.UserDetails);
      dispatch(loadPersonDetails());
      dispatch(loadSession());
    }
  });

  // Clean-up
  useEffect(() => {
    return () => {
      dispatch(resetModifyContactDetails());
    };
  }, [dispatch]);

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
