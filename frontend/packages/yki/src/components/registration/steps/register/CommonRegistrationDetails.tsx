import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useEffect } from 'react';
import { H2, Text } from 'shared/components';
import { Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  CertificateLanguage,
  ExamLanguage,
  ExamLevel,
  InstructionLanguage,
} from 'enums/app';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { ExamSession } from 'interfaces/examSessions';
import {
  PersonFillOutDetails,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const ErrorLabelStyles = {
  '&.Mui-error .MuiFormControlLabel-label': {
    color: 'error.main',
  },
};

export const CommonRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  const { registration, showErrors } = useAppSelector(registrationSelector);
  const { language_code, level_code } = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const dispatch = useAppDispatch();
  const handleCheckboxClick = (
    fieldName: keyof RegistrationCheckboxDetails,
  ) => {
    dispatch(
      updatePublicRegistration({
        [fieldName]: !registration[fieldName],
      }),
    );
  };
  const handleChange = (fieldname: keyof PersonFillOutDetails) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(updatePublicRegistration({ [fieldname]: event.target.value }));
    };
  };

  const hideInstructionLanguageSelection =
    language_code === ExamLanguage.FIN ||
    language_code === ExamLanguage.SWE ||
    (language_code === ExamLanguage.ENG && level_code !== ExamLevel.PERUS);

  useEffect(() => {
    if (hideInstructionLanguageSelection) {
      const instructionLanguage =
        language_code === ExamLanguage.SWE
          ? InstructionLanguage.SV
          : InstructionLanguage.FI;
      dispatch(updatePublicRegistration({ instructionLanguage }));
    }
  }, [dispatch, hideInstructionLanguageSelection, language_code]);

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

  return (
    <>
      <fieldset style={{ border: 0, padding: 0 }}>
        <legend>
          <Text>
            <b>{t('certificateLanguage')}</b>
          </Text>
        </legend>
        <FormControl error={!!registrationErrors['certificateLanguage']}>
          <RadioGroup
            row={!isPhone}
            onChange={handleChange('certificateLanguage')}
          >
            <FormControlLabel
              className="radio-group-label"
              value={CertificateLanguage.FI}
              control={<Radio />}
              label={translateCommon('languages.fin')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value={CertificateLanguage.SV}
              control={<Radio />}
              label={translateCommon('languages.swe')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value={CertificateLanguage.EN}
              control={<Radio />}
              label={translateCommon('languages.eng')}
              sx={ErrorLabelStyles}
            />
          </RadioGroup>
        </FormControl>
      </fieldset>
      {hideInstructionLanguageSelection ? null : (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend>
            <Text>
              <b>{t('instructionLanguage')}</b>
            </Text>
          </legend>
          <FormControl error={!!registrationErrors['instructionLanguage']}>
            <RadioGroup
              row={!isPhone}
              onChange={handleChange('instructionLanguage')}
            >
              <FormControlLabel
                className="radio-group-label"
                value={InstructionLanguage.FI}
                control={<Radio />}
                label={translateCommon('languages.fin')}
                sx={ErrorLabelStyles}
              />
              <FormControlLabel
                className="radio-group-label"
                value={InstructionLanguage.SV}
                control={<Radio />}
                label={translateCommon('languages.swe')}
                sx={ErrorLabelStyles}
              />
            </RadioGroup>
          </FormControl>
        </fieldset>
      )}
      <H2 className="public-registration__grid__form-container__terms-and-conditions">
        {t('termsAndConditions.title')}
      </H2>
      <div>
        <Text>
          {t('termsAndConditions.description1')}
          <br />
          {t('termsAndConditions.description2')}
        </Text>
        <FormControl error={!!registrationErrors['termsAndConditionsAgreed']}>
          <FormControlLabel
            control={
              <Checkbox
                onClick={() => handleCheckboxClick('termsAndConditionsAgreed')}
                color={Color.Secondary}
                checked={registration.termsAndConditionsAgreed}
              />
            }
            label={t('termsAndConditions.label')}
            sx={ErrorLabelStyles}
          />
        </FormControl>
      </div>
      <H2>{translateCommon('privacyStatement.title')}</H2>
      <div>
        <Text>
          {translateCommon('privacyStatement.description')}
          <br />
          {translateCommon('privacyStatement.readConditions')}
        </Text>
        <div className="columns gapped-xxs">
          <Link
            href={translateCommon('privacyStatement.link.url')}
            target="_blank"
          >
            <Text>{translateCommon('privacyStatement.link.label')}</Text>
          </Link>
          <OpenInNewIcon />
        </div>
      </div>
      <FormControl error={!!registrationErrors['privacyStatementConfirmation']}>
        <FormControlLabel
          control={
            <Checkbox
              onClick={() =>
                handleCheckboxClick('privacyStatementConfirmation')
              }
              color={Color.Secondary}
              checked={registration.privacyStatementConfirmation}
            />
          }
          label={translateCommon('privacyStatement.grantApproval')}
          sx={ErrorLabelStyles}
        />
      </FormControl>
    </>
  );
};
