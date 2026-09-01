import { Box, Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CustomButtonLink, H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { ExaminerExamDatesSummary } from 'components/examiner/ExaminerExamDatesSummary';
import { ExaminerContactRequestListing } from 'components/examinerExamEvent/listing/ExaminerContactRequestListing';
import { ExaminerExamEventListing } from 'components/examinerExamEvent/listing/ExaminerExamEventListing';
import {
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  loadExaminerDetails,
  resetExaminerDetailsToInitialState,
} from 'redux/reducers/examinerDetails';
import { clerkUserSelector } from 'redux/selectors/clerkUser';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { ExaminerUtils } from 'utils/examiner';

const PublicInformation = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerOverview.publicInformation',
  });
  const translateCommon = useCommonTranslation();
  const { examiner } = useAppSelector(examinerDetailsSelector);
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  if (!examiner) {
    return <></>;
  }

  return (
    <div className="examiner-homepage__public-information rows gapped-xl margin-top-lg margin-bottom-lg">
      <div className="columns gapped">
        <H2 className="grow">{t('heading')}</H2>
        <CustomButtonLink
          variant={Variant.Contained}
          color={Color.Secondary}
          to={AppRoutes.ExaminerDetailsPage.replace(/:oid/, examiner.oid)}
        >
          {t('labels.modify')}
        </CustomButtonLink>
      </div>
      <Divider />
      <div className="examiner-homepage__public-information--details-row columns space-between align-items-start">
        <Text>
          <b>{t('labels.examiner')}</b>
          <br />
          {`${examiner.firstName} ${examiner.lastName}`}
        </Text>
        <Text>
          <b>{t('labels.languages')}</b>
          <br />
          {ExaminerUtils.renderExamLanguages(examiner, translateCommon)}
        </Text>
        <Text>
          <b>{t('labels.examLocations')}</b>
          <br />
          {ExaminerUtils.renderExamLocations(examiner, translateMunicipality)}
        </Text>
        <Text>
          <b>{t('labels.examDates')}</b>
          <br />
          <ExaminerExamDatesSummary examiner={examiner} />
        </Text>
      </div>
    </div>
  );
};

const ContactRequests = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerOverview.contactRequests',
  });
  const { examiner } = useAppSelector(examinerDetailsSelector);

  return (
    <div className="examiner-homepage__contact-requests rows gapped-xl margin-top-sm margin-bottom-lg">
      <H2>{t('heading')}</H2>
      <Divider />
      {examiner?.contactRequests?.length === 0 ? (
        <Text className="empty-results">{t('labels.noContactRequests')}</Text>
      ) : (
        <ExaminerContactRequestListing />
      )}
    </div>
  );
};

const ExaminerOverview = () => {
  return (
    <Paper elevation={3} className="examiner-homepage__overview">
      <div className="rows gapped-xxxxl">
        <PublicInformation />
        <ContactRequests />
        <ExaminerExamEventListing />
      </div>
    </Paper>
  );
};

export const ExaminerHomePage: FC = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerHomepage',
  });
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

  // Clean up on unmount
  useEffect(
    () => () => {
      dispatch(resetExaminerDetailsToInitialState());
    },
    [dispatch],
  );

  return (
    <Box className="examiner-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-homepage__grid-container"
      >
        <Grid>
          <H1>{t('heading')}</H1>
        </Grid>
        <Grid>{examiner && <ExaminerOverview />}</Grid>
      </Grid>
    </Box>
  );
};
