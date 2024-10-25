import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  H1,
  H2,
  LabeledMultipleCheckboxDropdown,
  LabeledTextField,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  InputAutoComplete,
  TextFieldTypes,
  TextFieldVariant,
} from 'shared/enums';

import { useKoodistoMunicipalitiesTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useMunicipalityOptions } from 'hooks/useKoodistoMunicipalities';
import { loadExaminerDetails } from 'redux/reducers/examinerDetails';
import { loadExaminerDetailsInit } from 'redux/reducers/examinerDetailsInit';
import { clerkUserSelector } from 'redux/selectors/clerkUser';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { examinerDetailsInitSelector } from 'redux/selectors/examinerDetailsInit';

const InitializeExaminerDetails = () => {
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const { initData } = useAppSelector(examinerDetailsInitSelector);
  const municipalityOptions = useMunicipalityOptions();
  const municipalityToOption = (municipality: string) => ({
    value: municipality,
    label: translateMunicipality(municipality),
  });
  const [municipalities, setMunicipalities] = useState<Array<string>>([]);

  return (
    <Paper elevation={3} className="examiner-details-page__details-view">
      <div className="rows gapped-xl">
        <H2>Henkilötiedot</H2>
        <Text>Tiedoista vain nimet näkyvät julkisessa listauksessa.</Text>
        <div className="grid-2-columns gapped-xl half-max-width">
          <div className="rows">
            <Text>
              <b>Sukunimi:</b>
            </Text>
            <Text>{initData?.lastName}</Text>
          </div>
          <div className="rows">
            <Text>
              <b>Etunimi:</b>
            </Text>
            <Text>{initData?.lastName}</Text>
          </div>
          <LabeledTextField
            id="examiner-details__email-address"
            label="Sähköpostiosoite *"
            type={TextFieldTypes.Email}
            autoComplete={`work ${InputAutoComplete.Email}`}
          />
          <LabeledTextField
            id="examiner-details__phone-number"
            label="Puhelinnumero *"
            type={TextFieldTypes.PhoneNumber}
            autoComplete={`work ${InputAutoComplete.PhoneNumber}`}
          />
        </div>
        <Divider />
        <H2>Tutkinnon perustiedot</H2>
        <Text>Nämä tiedot näkyvät julkisessa listauksessa.</Text>
        <div className="rows examiner-details-page__exam-languages">
          <fieldset>
            <legend>
              <Text>
                <b>Tutkinnon kieli *</b>
              </Text>
            </legend>
            <FormGroup className="margin-left-sm" row={true}>
              <FormControlLabel control={<Checkbox />} label="suomi" />
              <FormControlLabel control={<Checkbox />} label="ruotsi" />
            </FormGroup>
          </fieldset>
        </div>
        <div className="half-max-width examiner-details-page__municipalities">
          <LabeledMultipleCheckboxDropdown
            id="examiner-details__municipalities"
            label="Tutkintopaikka/Tutkintopaikat *"
            helperText=""
            showInputLabel={false}
            showError={false}
            variant={TextFieldVariant.Outlined}
            values={municipalityOptions}
            value={municipalities.map(municipalityToOption)}
            onChange={(_, options) => {
              setMunicipalities(options.map((v) => v.value));
            }}
          />
        </div>
      </div>
    </Paper>
  );
};

export const ExaminerDetailsPage = () => {
  const dispatch = useAppDispatch();
  const {
    oid,
    status: examinerDetailsStatus,
    initialized,
  } = useAppSelector(examinerDetailsSelector);
  const { status: initStatus } = useAppSelector(examinerDetailsInitSelector);
  useEffect(() => {
    if (examinerDetailsStatus === APIResponseStatus.NotStarted && oid) {
      dispatch(loadExaminerDetails(oid));
    }
  }, [dispatch, examinerDetailsStatus, oid]);

  useEffect(() => {
    if (
      initialized === false &&
      initStatus === APIResponseStatus.NotStarted &&
      oid
    ) {
      dispatch(loadExaminerDetailsInit(oid));
    }
  });

  return (
    <Box className="examiner-details-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-details-page__grid-container"
      >
        <Grid item>
          <H1>Omat tiedot</H1>
        </Grid>
        <Grid item>
          {initialized === false && <InitializeExaminerDetails />}
        </Grid>
      </Grid>
    </Box>
  );
};

export const ExaminerHomePage: FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const clerkUser = useAppSelector(clerkUserSelector);
  const { oid, status, examiner, initialized } = useAppSelector(
    examinerDetailsSelector,
  );
  useEffect(() => {
    if (
      oid &&
      (status === APIResponseStatus.NotStarted ||
        (status === APIResponseStatus.Success && oid !== examiner?.oid))
    ) {
      dispatch(loadExaminerDetails(oid));
    }
  }, [dispatch, status, oid, examiner?.oid]);

  // If examiner data is not initialized, redirect user to initialize the data
  useEffect(() => {
    if (initialized === false && oid) {
      navigate(AppRoutes.ExaminerDetailsPage.replace(/:oid/, oid));
    }
  }, [initialized, navigate, clerkUser.isExaminer, oid]);

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <Grid item>
          <H1>Hyvän ja tyydyttävän taidon kielitutkinnot</H1>
        </Grid>
      </Grid>
    </Box>
  );
};
