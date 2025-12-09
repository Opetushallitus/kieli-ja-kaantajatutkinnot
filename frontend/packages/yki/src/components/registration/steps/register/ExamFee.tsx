import InfoFilledIcon from '@mui/icons-material/Info';
import {
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { H2, H3, Text } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RegistrationKind } from 'enums/app';
import { setUserDeclaredFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import { publicEducationSelector } from 'redux/selectors/publicEducation';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';

const ErrorLabelStyles = {
  '&.Mui-error .MuiFormControlLabel-label': {
    color: 'error.main',
  },
};

type CountryOfStudies = 'finland' | 'abroad' | 'uneligible';
type EducationDetails =
  | 'matriculationExam'
  | 'higherEducationConcluded'
  | 'higherEducationEnrolled'
  | 'uneligible';

const UserEducationSelection = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails.examFee',
  });
  const dispatch = useAppDispatch();
  const { showErrors } = useAppSelector(registrationSelector);
  const { isFree, attemptsUsed } = useAppSelector(
    publicFreeRegistrationSelector,
  );
  const attemptsLeft = 3 - (attemptsUsed || 0);
  const [countryOfEducation, setCountryOfEducation] = useState<
    CountryOfStudies | undefined
  >(undefined);
  const [educationDetails, setEducationDetails] = useState<
    EducationDetails | undefined
  >(undefined);

  useEffect(() => {
    dispatch(
      setUserDeclaredFreeRegistration({
        countryOfEducation,
        educationDetails,
      }),
    );
  }, [dispatch, countryOfEducation, educationDetails]);

  return (
    <>
      <Text>
        {t('noSuitableEducationFound')}{' '}
        {t('userSelection.declareEducationOrPay')}{' '}
        {t('userSelection.selectOne')}
      </Text>
      <fieldset className="registration-details__radio-group">
        <legend>
          <Text>
            <b>{t('userSelection.countryOfStudies.prompt')} *</b>
          </Text>
        </legend>
        <FormControl error={showErrors && !countryOfEducation}>
          <RadioGroup
            onChange={(event) =>
              setCountryOfEducation(event.target.value as CountryOfStudies)
            }
          >
            <FormControlLabel
              className="radio-group-label"
              value="finland"
              control={<Radio />}
              label={t('userSelection.countryOfStudies.finland')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value="abroad"
              control={<Radio />}
              label={t('userSelection.countryOfStudies.abroad')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value="uneligible"
              control={<Radio />}
              label={t('userSelection.countryOfStudies.uneligible')}
              sx={ErrorLabelStyles}
            />
          </RadioGroup>
        </FormControl>
      </fieldset>
      {(countryOfEducation === 'abroad' ||
        countryOfEducation === 'finland') && (
        <fieldset className="registration-details__radio-group">
          <legend>
            <Text>
              <b>{t('userSelection.educationDetails.prompt')} *</b>
            </Text>
          </legend>
          <FormControl error={showErrors && !educationDetails}>
            <RadioGroup
              onChange={(event) =>
                setEducationDetails(event.target.value as EducationDetails)
              }
            >
              <FormControlLabel
                className="radio-group-label"
                value="matriculationExam"
                control={<Radio />}
                label={
                  countryOfEducation === 'finland'
                    ? t('userSelection.educationDetails.matriculationExam')
                    : t(
                        'userSelection.educationDetails.comparableMatriculationExam',
                      )
                }
                sx={ErrorLabelStyles}
              />
              <FormControlLabel
                className="radio-group-label"
                value="higherEducationConcluded"
                control={<Radio />}
                label={t(
                  'userSelection.educationDetails.higherEducationConcluded',
                )}
                sx={ErrorLabelStyles}
              />
              <FormControlLabel
                className="radio-group-label"
                value="higherEducationEnrolled"
                control={<Radio />}
                label={t(
                  'userSelection.educationDetails.higherEducationEnrolled',
                )}
                sx={ErrorLabelStyles}
              />
              <FormControlLabel
                className="radio-group-label"
                value="uneligible"
                control={<Radio />}
                label={t('userSelection.educationDetails.uneligible')}
                sx={ErrorLabelStyles}
              />
            </RadioGroup>
          </FormControl>
        </fieldset>
      )}
      {isFree === 'YES' && (
        <>
          <Container className="public-registration__info-box columns gapped-sm">
            <InfoFilledIcon color={Color.Secondary} />
            <Text>
              {t('freeAttemptsOfferedYKI')}{' '}
              <Trans
                t={t}
                i18nKey="freeAttemptsLeft"
                values={{ amount: attemptsLeft }}
              />
            </Text>
          </Container>
          <H3>{t('userSelection.randomChecksPerformed.heading')}</H3>
          <Text>{t('userSelection.randomChecksPerformed.part1')}</Text>
          <Text>
            {t('userSelection.randomChecksPerformed.part2')}
            <br />
            {t('userSelection.randomChecksPerformed.part3')}
          </Text>
        </>
      )}
    </>
  );
};

export const ExamFee = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails.examFee',
  });

  const { status } = useAppSelector(publicEducationSelector);
  const { basis, attemptsUsed } = useAppSelector(
    publicFreeRegistrationSelector,
  );
  const { registrationKind } =
    useAppSelector(registrationSelector).initRegistration;

  const isLoading = status === APIResponseStatus.InProgress;
  const hasKoskiEducation = basis && basis.source === 'KOSKI';
  // TODO More accurate translations for found education? Should translate active and concluded university degrees differently?
  const koskiEducationTranslationKey =
    hasKoskiEducation &&
    ['MatriculationExam', 'ComparableMatriculation'].includes(
      basis.educationType,
    )
      ? 'matriculationExam'
      : 'higherEducation';
  const attemptsOffered = 3;
  const attemptsLeft = attemptsOffered - (attemptsUsed || 0);

  if (isLoading) {
    return (
      <>
        <H2 className="public-registration__grid__form-container__exam-fee">
          {t('title')}
        </H2>
        <Text>
          {t('loading.checkingEligibility')} {t('loading.pleaseWait')}
        </Text>
      </>
    );
  }

  return (
    <>
      <H2 className="public-registration__grid__form-container__exam-fee">
        {t('title')}
      </H2>
      {attemptsLeft === 0 && (
        <>
          <Text>
            {t('freeAttemptsOffered')} {t('freeAttemptsExhausted')}
          </Text>
          {registrationKind === RegistrationKind.Admission && (
            <Text>{t('paymentRequired')}</Text>
          )}
          {registrationKind === RegistrationKind.Queue && (
            <Text>{t('paymentRequiredIfLiftedFromQueue')}</Text>
          )}
        </>
      )}
      {attemptsLeft > 0 && hasKoskiEducation && (
        <>
          <Text>
            {t('noFeeRequired')} {t('suitableEducationFound')}:{' '}
            <b>{t(`education.${koskiEducationTranslationKey}`)}</b>
          </Text>
          <Text>
            {t('freeAttemptsOffered')}{' '}
            <Trans
              t={t}
              i18nKey="freeAttemptsLeft"
              values={{ amount: attemptsLeft }}
            />
          </Text>
        </>
      )}
      {attemptsLeft > 0 && !hasKoskiEducation && <UserEducationSelection />}
    </>
  );
};
