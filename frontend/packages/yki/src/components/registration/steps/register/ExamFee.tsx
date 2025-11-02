import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { H2, H3, Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { setPublicFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';
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
  | 'higherEducationDegree'
  | 'higherEducationStudies'
  | 'uneligible';

const UserEducationSelection = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails.examFee',
  });
  const dispatch = useAppDispatch();
  const { showErrors } = useAppSelector(registrationSelector);
  const [countryOfStudies, setCountryOfStudies] = useState<
    CountryOfStudies | undefined
  >(undefined);
  const [educationDetails, setEducationDetails] = useState<
    EducationDetails | undefined
  >(undefined);

  const isError = showErrors && countryOfStudies === undefined;
  const isEligibleForFreeRegistration =
    (countryOfStudies === 'finland' || countryOfStudies === 'abroad') &&
    (educationDetails === 'matriculationExam' ||
      educationDetails === 'higherEducationDegree' ||
      educationDetails === 'higherEducationStudies');
  useEffect(() => {
    if (isEligibleForFreeRegistration) {
      const educationType =
        educationDetails === 'matriculationExam'
          ? 'MatriculationExam'
          : educationDetails === 'higherEducationDegree'
          ? 'HigherEducationDegree'
          : 'HigherEducationStudies';
      dispatch(
        setPublicFreeRegistration({
          isFree: 'YES',
          basis: {
            source: 'USER',
            countryOfStudies,
            educationType,
          },
        }),
      );
    } else {
      const isFeeRequired =
        countryOfStudies === 'uneligible' || educationDetails === 'uneligible';
      dispatch(
        setPublicFreeRegistration({
          isFree: isFeeRequired ? 'NO' : 'UNDECIDED',
          basis: undefined,
        }),
      );
    }
    if (countryOfStudies === 'finland')
      switch (educationDetails) {
        case 'matriculationExam':
        case 'higherEducationDegree':
        case 'higherEducationStudies':
          dispatch(setPublicFreeRegistration({ isFree: 'YES' }));
          break;
        case 'uneligible':
          dispatch(setPublicFreeRegistration({ isFree: 'NO' }));
          break;
      }
    switch (countryOfStudies) {
      case 'uneligible':
        dispatch(setPublicFreeRegistration({ isFree: 'NO' }));
    }
  }, [
    dispatch,
    isEligibleForFreeRegistration,
    educationDetails,
    countryOfStudies,
  ]);

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
        <FormControl error={isError}>
          <RadioGroup
            onChange={(event) =>
              setCountryOfStudies(event.target.value as CountryOfStudies)
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
      {(countryOfStudies === 'abroad' || countryOfStudies === 'finland') && (
        <fieldset className="registration-details__radio-group">
          <legend>
            <Text>
              <b>{t('userSelection.educationDetails.prompt')} *</b>
            </Text>
          </legend>
          <FormControl error={isError}>
            <RadioGroup
              onChange={(event) =>
                setEducationDetails(event.target.value as EducationDetails)
              }
            >
              <FormControlLabel
                className="radio-group-label"
                value="matriculationExam"
                control={<Radio />}
                label={t('userSelection.educationDetails.matriculationExam')}
                sx={ErrorLabelStyles}
              />
              <FormControlLabel
                className="radio-group-label"
                value="higherEducationDegree"
                control={<Radio />}
                label={t(
                  'userSelection.educationDetails.higherEducationDegree',
                )}
                sx={ErrorLabelStyles}
              />
              <FormControlLabel
                className="radio-group-label"
                value="higherEducationStudies"
                control={<Radio />}
                label={t(
                  'userSelection.educationDetails.higherEducationStudies',
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
      {isEligibleForFreeRegistration && (
        <>
          <H3>{t('userSelection.randomChecksPerformed.heading')}</H3>
          <Text>
            {t('userSelection.randomChecksPerformed.part1')}
            {t('userSelection.randomChecksPerformed.part2')}
          </Text>
          <Text>
            {t('userSelection.randomChecksPerformed.part3')}
            {t('userSelection.randomChecksPerformed.part4')}
            {t('userSelection.randomChecksPerformed.part5')}
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
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const examLanguage = examSession.language_code as
    | ExamLanguage.FIN
    | ExamLanguage.SWE;
  const { basis, attemptsUsed } = useAppSelector(
    publicFreeRegistrationSelector,
  );

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
  const usedAttemptsForLanguage =
    (attemptsUsed && attemptsUsed[examLanguage]) || 0;
  const attemptsLeft = attemptsOffered - usedAttemptsForLanguage;

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
          <Text>{t('paymentRequired')}</Text>
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
