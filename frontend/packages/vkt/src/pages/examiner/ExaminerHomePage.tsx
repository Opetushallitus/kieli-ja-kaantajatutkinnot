import { Box, Divider, Grid, Paper } from '@mui/material';
import { FC, Fragment, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButtonLink, H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ExaminerExamEventListing } from 'components/examinerExamEvent/listing/ExaminerExamEventListing';
import {
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadExaminerDetails } from 'redux/reducers/examinerDetails';
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

  const { examEvents } = examiner;

  return (
    <div className="examiner-homepage__public-information rows gapped-xl">
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
          {examEvents.length === 0 ? (
            t('labels.undefined')
          ) : (
            <>
              {examEvents.map(({ date, maxParticipants }, i) => {
                const newline = examEvents.length > 1 && i > 0;
                // TODO Fix isFull calculation
                const isFull = !!maxParticipants;

                return (
                  <Fragment key={i}>
                    {newline && <br />}
                    {isFull && (
                      <>
                        <s>{DateUtils.formatOptionalDate(date)}</s>&nbsp;
                        {t('labels.full')}
                      </>
                    )}
                    {!isFull && DateUtils.formatOptionalDate(date)}
                  </Fragment>
                );
              })}
            </>
          )}
        </Text>
      </div>
    </div>
  );
};

const ContactRequests = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerOverview.contactRequests',
  });
  // TODO Get contact requests from redux state & render them
  const contactRequests = [];

  return (
    <div className="examiner-homepage__contact-requests rows gapped-xl">
      <H2>{t('heading')}</H2>
      <Divider />
      {contactRequests.length === 0 && (
        <Text className="empty-results">{t('labels.noContactRequests')}</Text>
      )}
    </div>
  );
};

const ExaminerOverview = () => {
  return (
    <Paper elevation={3} className="examiner-homepage__overview">
      <div className="rows gapped-xl">
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

  return (
    <Box className="examiner-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-homepage__grid-container"
      >
        <Grid item>
          <H1>{t('heading')}</H1>
        </Grid>
        <Grid item>{examiner && <ExaminerOverview />}</Grid>
      </Grid>
    </Box>
  );
};
