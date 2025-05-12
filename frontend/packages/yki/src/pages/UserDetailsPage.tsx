import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { FC, useEffect } from 'react';
import {
  CustomButton,
  CustomButtonLink,
  H1,
  H2,
  H3,
  HeaderSeparator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';
import { loadPersonDetails } from 'redux/reducers/userDetails';
import { userDetailsSelector } from 'redux/selectors/userDetails';
import { ExamSessionUtils } from 'utils/examSession';

const cancelledStates = [
  RegistrationStates.Expired,
  RegistrationStates.Cancelled,
  RegistrationStates.PaidAndCancelled,
];

const isCancelled = (registration: PersonRegistrations) =>
  cancelledStates.includes(registration.state);

const filterByState = (
  registrations: Array<PersonRegistrations>,
  states: Array<RegistrationStates>,
) => {
  if (!registrations) {
    return [];
  }

  return registrations.filter((r) => states.includes(r.state));
};

const filterByDate = (
  registrations: Array<PersonRegistrations>,
  upcoming: boolean,
) => {
  if (!registrations) {
    return [];
  }

  return registrations.filter((r) =>
    upcoming ? dayjs().isBefore(r.examDate) : dayjs().isAfter(r.examDate),
  );
};

interface RegistrationsProps {
  filteredRegistrations: Array<PersonRegistrations>;
}

const Registrations: FC<RegistrationsProps> = ({ filteredRegistrations }) => {
  return filteredRegistrations.map((r) => {
    const canCancel = !isCancelled(r);

    return (
      <Paper
        key={`registration-${r.examSessionId}`}
        elevation={3}
        className="user-details-page__event"
      >
        <div className="user-details-page__info__section">
          <H3>
            {ExamSessionUtils.languageAndLevelText({
              language_code: r.examLang,
              level_code: r.examLevel,
            })}
          </H3>
        </div>
        <div>
          <Text className="bold">Testipäivä</Text>
          <Text>{DateUtils.formatOptionalDate(r.examDate, 'l')}</Text>
        </div>
        <div>
          <Text className="bold">Testipaikka</Text>
          <Text>
            {r.streetAddress}, {r.postOffice}
          </Text>
        </div>
        <div className="columns gapped">
          {canCancel && (
            <CustomButton
              className="fit-content-max-width"
              color={Color.Secondary}
              variant={Variant.Outlined}
            >
              Peru ilmoittautuminen
            </CustomButton>
          )}
          <CustomButtonLink
            className="fit-content-max-width"
            color={Color.Secondary}
            variant={Variant.Outlined}
            disabled={!r.isTransferable}
            to={AppRoutes.TransferEnrollment.replace(
              /:registrationId/,
              `${r.id}`,
            )}
          >
            Siirrä ilmoittautuminen
          </CustomButtonLink>
        </div>
      </Paper>
    );
  });
};

export const UserDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage',
  });

  const dispatch = useAppDispatch();
  const { status, personDetails } = useAppSelector(userDetailsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadPersonDetails());
    }
  }, [dispatch, status]);

  if (!personDetails) {
    return <></>;
  }

  const canceledRegistrations = filterByState(
    personDetails.registrations,
    cancelledStates,
  );
  const upcomingAndPastRegistrations = filterByState(
    personDetails.registrations,
    [
      RegistrationStates.Submitted,
      RegistrationStates.Completed,
      RegistrationStates.Started,
    ],
  );

  const upcomingRegistrations = filterByDate(
    upcomingAndPastRegistrations,
    true,
  );
  const pastRegistrations = filterByDate(upcomingAndPastRegistrations, false);

  return (
    <Box className="user-details-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="user-details-page__grid-container"
      >
        <Grid item className="user-details-page__grid-container__item-header">
          <H1 data-testid="user-details-page__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <Text>{t('introduction.info')}</Text>
          <br />
          <Text>{t('introduction.timeLimit')}</Text>
        </Grid>
        <Grid item className="user-details-page__grid-container__item-info">
          <div className="margin-top-xxl">
            <H2 className="user-details-page__info__section__heading-title">
              Yhteystietosi
            </H2>
            <Paper elevation={3} className="user-details-page__info">
              <div className="user-details-page__info__section">
                <Text>
                  Yhteystietoja käytetään tutkintotodistuksen lähettämiseen
                </Text>
                <Text className="bold">
                  {personDetails.firstName} {personDetails.lastName}
                </Text>
                <Text>
                  <b>Email:</b> {personDetails.email}
                </Text>
              </div>
            </Paper>
          </div>
          {upcomingRegistrations.length > 0 && (
            <div className="margin-top-xxl rows gapped-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                Tulevat kielitutkintojen testisi
              </H2>
              <Registrations filteredRegistrations={upcomingRegistrations} />
            </div>
          )}
          {pastRegistrations.length > 0 && (
            <div className="margin-top-xxl rows gapped-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                Menneet ja arvioidut
              </H2>
              <Registrations filteredRegistrations={pastRegistrations} />
            </div>
          )}
          {canceledRegistrations.length > 0 && (
            <div className="margin-top-xxl rows gapped-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                Peruutetut
              </H2>
              <Registrations filteredRegistrations={canceledRegistrations} />
            </div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
