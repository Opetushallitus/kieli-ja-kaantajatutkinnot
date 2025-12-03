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
import { H2, H3, Text } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { ExamFee } from 'components/registration/steps/register/ExamFee';
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
import { getKoskiEducations } from 'redux/reducers/publicEducation';
import { setPublicFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { publicEducationSelector } from 'redux/selectors/publicEducation';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';
import { ExamSessionUtils } from 'utils/examSession';

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

  const { loggedInSession } = useAppSelector(sessionSelector);
  const { status: publicEducationStatus } = useAppSelector(
    publicEducationSelector,
  );
  const { basis, attemptsUsed, isFree } = useAppSelector(
    publicFreeRegistrationSelector,
  );
  const { registration, showErrors } = useAppSelector(registrationSelector);
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { language_code, level_code } = examSession;

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

  const shouldGetKoskiEducations = ExamSessionUtils.freeRegistrationPossible(
    examSession,
    loggedInSession,
  );
  const showExamFeeSection = shouldGetKoskiEducations;
  useEffect(() => {
    if (hideInstructionLanguageSelection) {
      const instructionLanguage =
        language_code === ExamLanguage.SWE
          ? InstructionLanguage.SV
          : InstructionLanguage.FI;
      dispatch(updatePublicRegistration({ instructionLanguage }));
    }
  }, [dispatch, hideInstructionLanguageSelection, language_code]);

  useEffect(() => {
    if (shouldGetKoskiEducations) {
      if (publicEducationStatus === APIResponseStatus.NotStarted) {
        dispatch(getKoskiEducations());
      } else if (
        publicEducationStatus === APIResponseStatus.Success &&
        attemptsUsed !== undefined
      ) {
        const freeAttemptsLeft = 3 - attemptsUsed;
        if (freeAttemptsLeft > 0) {
          if (basis?.source === 'KOSKI') {
            dispatch(setPublicFreeRegistration({ isFree: 'YES' }));
          }
        } else {
          dispatch(setPublicFreeRegistration({ isFree: 'NO' }));
        }
      }
    }
  }, [
    dispatch,
    shouldGetKoskiEducations,
    publicEducationStatus,
    basis?.source,
    attemptsUsed,
  ]);

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

  return (
    <>
      <fieldset className="registration-details__radio-group">
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
        <fieldset className="registration-details__radio-group">
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
      {showExamFeeSection && <ExamFee />}
      <H2 className="public-registration__grid__form-container__terms-and-conditions">
        {t('termsAndConditions.title')}
      </H2>
      <H3>{t('termsAndConditions.subTitle')}</H3>
      <div>
        <Text>
          {t('termsAndConditions.description1')}
          <br />
          <ul>
            <li>{t('termsAndConditions.item1')}</li>
            <li>{t('termsAndConditions.item2')}</li>
            <li>{t('termsAndConditions.item3')}</li>
            <li>{t('termsAndConditions.item4')}</li>
            <li>{t('termsAndConditions.item5')}</li>
            <ul>
              <li>{t('termsAndConditions.item51')}</li>
              <li>{t('termsAndConditions.item52')}</li>
            </ul>
            {isFree !== 'YES' && <li>{t('termsAndConditions.item6')}</li>}
          </ul>
          {t('termsAndConditions.description2')}:{' '}
          <div
            className="columns gapped-xxs"
            style={{ display: 'inline-flex' }}
          >
            <Link href={t('termsAndConditions.link')} target="_blank">
              <Text>{t('termsAndConditions.linkText')}</Text>
            </Link>
            <OpenInNewIcon />
          </div>
          <br />
          <p>
            <b>{t('termsAndConditions.description3')}</b>
          </p>
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
      <H3>{translateCommon('privacyStatement.title')}</H3>
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
