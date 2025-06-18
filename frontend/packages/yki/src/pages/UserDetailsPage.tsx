import AlarmOutlinedIcon from '@mui/icons-material/AlarmOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoFilledIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import { Grid, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
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

import { CancelRegistrationModal } from 'components/userDetails/CancelRegistrationModal';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';
import {
  loadPersonDetails,
  setRegistrationToCancel,
} from 'redux/reducers/userDetails';
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
  setIsCancelModalOpen: (open: boolean) => void;
}

const InfoBox = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="user-details-page__info-box columns gapped-xs">
      <InfoFilledIcon className="user-details-page__icon--info align-self-start" />
      {children}
    </div>
  );
};

const RegistrationState = ({
  registration,
}: {
  registration: PersonRegistrations;
}) => {
  const { state, kind, liftedFromQueueAt } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.state',
  });

  // TODO Queued registrations should be handled as a sort of pseudo-state here as well!
  // TODO Registrations that are STARTED should maybe not be listed at all?

  const isEnrolled =
    state === RegistrationStates.Completed ||
    (state === RegistrationStates.Submitted &&
      kind === RegistrationKind.Admission &&
      !liftedFromQueueAt);

  const isQueued =
    state === RegistrationStates.Submitted &&
    (kind === RegistrationKind.Queue || liftedFromQueueAt);

  const isCancelled = [
    RegistrationStates.Cancelled,
    RegistrationStates.Expired,
    RegistrationStates.PaidAndCancelled,
  ].includes(state);

  return (
    <div>
      <Text className="bold">{t('label')}</Text>
      <div className="columns gapped-xxs">
        {isEnrolled && (
          <>
            <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
            <Text>{t('enrolled')}</Text>
          </>
        )}
        {isQueued && (
          <>
            <AlarmOutlinedIcon className="user-details-page__icon--alert" />
            <Text>{t('queued')}</Text>
          </>
        )}
        {isCancelled && (
          <>
            <NotInterestedIcon className="user-details-page__icon--cancel" />
            <Text>{t('cancelled')}</Text>
          </>
        )}
      </div>
    </div>
  );
};

const ExamPayment = ({
  registration,
}: {
  registration: PersonRegistrations;
}) => {
  const { paidAt, expiresAt, examFee } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.examPayment',
  });

  return (
    <div>
      <Text className="bold">{t('label')}</Text>
      <div className="columns gapped-xxs">
        {paidAt && (
          <>
            <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
            <Text>
              {t('paidAt', {
                date: DateUtils.formatOptionalDate(paidAt, 'l'),
              })}
            </Text>
          </>
        )}
        {!paidAt && (
          <>
            <WarningOutlinedIcon className="user-details-page__icon--alert" />{' '}
            <Text>
              {t('expiresAt', {
                examFee,
                date: DateUtils.formatOptionalDate(expiresAt, 'l'),
              })}
            </Text>
          </>
        )}
      </div>
    </div>
  );
};

const Registrations: FC<RegistrationsProps> = ({
  filteredRegistrations,
  setIsCancelModalOpen,
}) => {
  const lang = getCurrentLang();
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations',
  });
  const dispatch = useAppDispatch();

  const handleCancelRegistration = (registration: PersonRegistrations) => {
    dispatch(setRegistrationToCancel(registration));
    setIsCancelModalOpen(true);
  };

  return filteredRegistrations.map((r) => {
    const location = ExamSessionUtils.getLocationInfo(r, lang);
    const liftedFromQueue = !!r.liftedFromQueueAt;
    const displayExpiryNotification =
      r.state === RegistrationStates.Submitted &&
      r.kind !== RegistrationKind.Queue;

    return (
      <Paper
        key={`registration-${r.examSessionId}-${r.id}`}
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
        {displayExpiryNotification && !liftedFromQueue && (
          <InfoBox>
            <Text>
              {t('notPaidNotification.part1')} {t('notPaidNotification.part2')}{' '}
              {t('notPaidNotification.part3')}
            </Text>
          </InfoBox>
        )}
        {displayExpiryNotification && liftedFromQueue && (
          <InfoBox>
            <Text>
              {t('liftedFromQueueNotification.part1')}{' '}
              <b>
                {t('liftedFromQueueNotification.part2', {
                  date: DateUtils.formatOptionalDate(r.expiresAt, 'l'),
                })}
              </b>{' '}
              {t('liftedFromQueueNotification.part3')}{' '}
            </Text>
          </InfoBox>
        )}
        <RegistrationState registration={r} />
        {(r.state === RegistrationStates.Completed ||
          r.state === RegistrationStates.Submitted) &&
          r.kind === RegistrationKind.Admission && (
            <ExamPayment registration={r} />
          )}
        <div>
          <Text className="bold">{translateCommon('examDate')}</Text>
          <Text>{DateUtils.formatOptionalDate(r.examDate, 'l')}</Text>
        </div>
        <div>
          <Text className="bold">{translateCommon('institution')}</Text>
          <Text>
            {location.street_address}, {location.post_office}
          </Text>
        </div>
        {!isCancelled(r) && (
          <div className="rows gapped">
            <div className="columns gapped">
              {r.state === RegistrationStates.Submitted &&
                r.kind === RegistrationKind.Admission && (
                  <CustomButtonLink
                    className="fit-content-max-width"
                    color={Color.Secondary}
                    variant={Variant.Contained}
                    disabled={!r.isCancellable}
                    to={AppRoutes.ConfirmRegistration.replace(
                      /:registrationId/,
                      `${r.id}`,
                    )}
                  >
                    {t('actions.confirm')}
                  </CustomButtonLink>
                )}
              <CustomButton
                className="fit-content-max-width"
                color={Color.Secondary}
                variant={Variant.Outlined}
                disabled={!r.isCancellable}
                onClick={() => handleCancelRegistration(r)}
              >
                {t('actions.cancel')}
              </CustomButton>
              {r.state === RegistrationStates.Completed && (
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
                  {t('actions.relocate')}
                </CustomButtonLink>
              )}
            </div>
            {r.isTransfered && (
              <div className="columns gapped-xs">
                <InfoOutlinedIcon />
                <Text>
                  {t('alreadyTransferredNotification.part1')}{' '}
                  {t('alreadyTransferredNotification.part2')}
                </Text>
              </div>
            )}
          </div>
        )}
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

  const editingContactDetailsAllowed = false;

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
          {editingContactDetailsAllowed && (
            <div className="columns">
              <CustomButtonLink
                variant={Variant.Text}
                color={Color.Secondary}
                to={''}
                fullWidth={false}
                startIcon={<EditOutlinedIcon />}
                className="text-transform-none user-details-page__edit-btn"
              >
                {t('modify')}
              </CustomButtonLink>
            </div>
          )}
        </div>
      </Paper>
    </div>
  );
};

const NotLoggedIn = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage',
  });

  return (
    <Box className="user-details-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="user-details-page__grid-container"
      >
        <Grid className="user-details-page__grid-container__item-header">
          <H1 data-testid="user-details-page__title-heading">
            {t('notLoggedIn.title')}
          </H1>
          <HeaderSeparator />
          <div className="rows gapped">
            <Text>
              <Trans t={t} i18nKey="notLoggedIn.loginRequired" />
            </Text>
            <div className="columns">
              <CustomButton
                size="large"
                variant={Variant.Contained}
                color={Color.Secondary}
                href={`${APIEndpoints.Authenticate}?toUserPortal=true`}
                className="user-details-page__login-btn"
              >
                {t('notLoggedIn.loginThroughSuomiFi')}
              </CustomButton>
            </div>
            <Text>{t('notLoggedIn.actionsAvailable')}</Text>
          </div>
          <Typography className="margin-top-sm" variant="body1" component="ul">
            {['point1', 'point2', 'point3', 'point4'].map((point, i) => (
              <li key={i}>{t(`introduction.bulletPoints.${point}`)}</li>
            ))}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export const UserDetailsPage: FC = () => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage',
  });

  const dispatch = useAppDispatch();
  const { status, personDetails, registrationToCancel } =
    useAppSelector(userDetailsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadPersonDetails());
    }
  }, [dispatch, status]);

  if (status === APIResponseStatus.Error) {
    return <NotLoggedIn />;
  }

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
        <Grid className="user-details-page__grid-container__item-header">
          <H1 data-testid="user-details-page__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <Text>{t('introduction.info')}</Text>
          <Typography className="margin-top-sm" variant="body1" component="ul">
            {['point1', 'point2', 'point3', 'point4'].map((point, i) => (
              <li key={i}>{t(`introduction.bulletPoints.${point}`)}</li>
            ))}
          </Typography>
        </Grid>
        <Grid className="user-details-page__grid-container__item-info">
          {registrationToCancel && (
            <CancelRegistrationModal
              registrationToCancel={registrationToCancel}
              modalOpen={isCancelModalOpen}
              setModalOpen={setIsCancelModalOpen}
            />
          )}
          <ContactDetails />
          {upcomingRegistrations.length > 0 && (
            <div className="margin-top-xxl rows gapped-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                {t('registrations.header.upcoming')}
              </H2>
              <Registrations
                filteredRegistrations={upcomingRegistrations}
                setIsCancelModalOpen={setIsCancelModalOpen}
              />
            </div>
          )}
          {pastRegistrations.length > 0 && (
            <div className="margin-top-xxl rows gapped-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                {t('registrations.header.past')}
              </H2>
              <Registrations
                filteredRegistrations={pastRegistrations}
                setIsCancelModalOpen={setIsCancelModalOpen}
              />
            </div>
          )}
          {canceledRegistrations.length > 0 && (
            <div className="margin-top-xxl rows gapped-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                {t('registrations.header.cancelled')}
              </H2>
              <Registrations
                filteredRegistrations={canceledRegistrations}
                setIsCancelModalOpen={setIsCancelModalOpen}
              />
            </div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
