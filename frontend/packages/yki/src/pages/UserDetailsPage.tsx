import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { Grid, Paper, Typography } from '@mui/material';
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

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
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

const RegistrationState = ({
  registration,
}: {
  registration: PersonRegistrations;
}) => {
  const { state } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.state',
  });

  // TODO Queued registrations should be handled as a sort of pseudo-state here as well!
  // TODO Registrations that are STARTED should maybe not be listed at all?

  return (
    <div>
      <Text className="bold">{t('label')}</Text>
      <div className="columns gapped-xxs">
        {[RegistrationStates.Completed, RegistrationStates.Submitted].includes(
          state,
        ) && (
          <>
            <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
            <Text>{t('enrolled')}</Text>
          </>
        )}
        {[
          RegistrationStates.Cancelled,
          RegistrationStates.Expired,
          RegistrationStates.PaidAndCancelled,
        ].includes(state) && (
          <>
            <NotInterestedIcon className="user-details-page__icon--cancel" />
            <Text>{t('cancelled')}</Text>
          </>
        )}
      </div>
    </div>
  );
};

const Registrations: FC<RegistrationsProps> = ({ filteredRegistrations }) => {
  const lang = getCurrentLang();

  return filteredRegistrations.map((r) => {
    const canCancel = !isCancelled(r);
    const location = ExamSessionUtils.getLocationInfo(r, lang);

    return (
      <Paper
        key={`registration-${r.examSessionId}`}
        elevation={3}
        className="user-details-page__event"
      >
        <div className="user-details-page__info__section">
          <H3 sx={{ fontSize: '1.8rem', lineHeight: '2.6rem' }}>
            {ExamSessionUtils.languageAndLevelText({
              language_code: r.examLang,
              level_code: r.examLevel,
            })}
          </H3>
        </div>
        <RegistrationState registration={r} />
        <div>
          <Text className="bold">Testipäivä</Text>
          <Text>{DateUtils.formatOptionalDate(r.examDate, 'l')}</Text>
        </div>
        <div>
          <Text className="bold">Testipaikka</Text>
          <Text>
            {location.street_address}, {location.post_office}
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

const ContactDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.contactDetails',
  });
  const translateCommon = useCommonTranslation();
  const { personDetails } = useAppSelector(userDetailsSelector);

  if (!personDetails) {
    return <></>;
  }

  return (
    <div className="margin-top-xxl">
      <H2 className="user-details-page__info__section__heading-title">
        {t('heading')}
      </H2>
      <Paper elevation={3} className="user-details-page__info">
        <div className="user-details-page__info__section rows gapped">
          <Text>
            {t('description.part1')} {t('description.part2')}
          </Text>
          <div className="rows">
            <Text className="bold">
              {personDetails.firstName} {personDetails.lastName}
            </Text>
            <Text>
              <b>{translateCommon('address')}:</b>{' '}
              {`${personDetails.streetAddress}, ${personDetails.zip} ${personDetails.postOffice}`}
            </Text>
            <Text>
              <b>{translateCommon('email')}:</b> {personDetails.email}
            </Text>
            <Text>
              <b>{translateCommon('phoneNumber')}:</b>{' '}
              {personDetails.phoneNumber}
            </Text>
          </div>
          <div className="columns">
            <CustomButtonLink
              variant={Variant.Text}
              color={Color.Secondary}
              to={''}
              fullWidth={false}
              startIcon={<EditOutlinedIcon />}
              className="text-transform-none"
            >
              {t('modify')}
            </CustomButtonLink>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export const UserDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage',
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
          <Typography className="margin-top-sm" variant="body1" component="ul">
            {['point1', 'point2', 'point3', 'point4'].map((point, i) => (
              <li key={i}>{t(`introduction.bulletPoints.${point}`)}</li>
            ))}
          </Typography>
        </Grid>
        <Grid item className="user-details-page__grid-container__item-info">
          <ContactDetails />
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
