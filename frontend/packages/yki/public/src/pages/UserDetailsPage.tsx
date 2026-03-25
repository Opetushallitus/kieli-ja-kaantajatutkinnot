import AlarmOutlinedIcon from '@mui/icons-material/AlarmOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoFilledIcon from '@mui/icons-material/Info';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import SchoolIcon from '@mui/icons-material/School';
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
import {
  AppRoutes,
  EvaluationState,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';
//import { ExpiredLoginLinkPage } from 'pages/ExpiredLoginLinkPage';
import {
  loadPersonDetails,
  setRegistrationToCancel,
} from 'redux/reducers/userDetails';
import { sessionSelector } from 'redux/selectors/session';
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

  const now = dayjs();

  return registrations.filter((r) =>
    upcoming
      ? now.isBefore(r.examDate, 'day') || now.isSame(r.examDate, 'day')
      : now.isAfter(r.examDate, 'day'),
  );
};

const earliestExamDateFirstComparator = (
  a: PersonRegistrations,
  b: PersonRegistrations,
) => {
  const ed1 = a.examDate,
    ed2 = b.examDate;
  if (ed1.isBefore(ed2)) {
    return -1;
  } else if (ed2.isBefore(ed1)) {
    return 1;
  } else {
    return 0;
  }
};

const latestExamDateFirstComparator = (
  a: PersonRegistrations,
  b: PersonRegistrations,
) => {
  const ed1 = a.examDate,
    ed2 = b.examDate;
  if (ed1.isBefore(ed2)) {
    return -1;
  } else if (ed2.isBefore(ed1)) {
    return 1;
  } else {
    return 0;
  }
};

interface RegistrationsProps {
  filteredRegistrations: Array<PersonRegistrations>;
  setIsCancelModalOpen: (open: boolean) => void;
}

const EvaluationStateInfo = ({ state }: { state: EvaluationState }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.state',
  });

  switch (state) {
    case EvaluationState.EvaluationPending:
    case EvaluationState.ReviewPending:
    case EvaluationState.ReviewComplete:
      return (
        <>
          <AlarmOutlinedIcon className="user-details-page__icon--alert" />
          <Text>{t(state)}</Text>
        </>
      );
    case EvaluationState.EvaluationComplete:
    case EvaluationState.ReviewFinalized:
      return (
        <>
          <SchoolIcon className="user-details-page__icon--ok" />{' '}
          <Text>{t(state)}</Text>
        </>
      );
    case EvaluationState.Aborted:
    case EvaluationState.NoShow:
      return (
        <>
          <NotInterestedIcon className="user-details-page__icon--cancel" />
          <Text>{t(state)}</Text>
        </>
      );
    default:
      return <></>;
  }
};

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
  const { state, evaluationState, kind } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.state',
  });

  const hasEvaluation = !!evaluationState;

  const isEnrolled =
    state === RegistrationStates.Completed ||
    (state === RegistrationStates.Submitted &&
      kind === RegistrationKind.Admission);

  const isQueued =
    state === RegistrationStates.Submitted && kind === RegistrationKind.Queue;

  const positionInQueue = registration.positionInQueue || 1;

  const isCancelled = [
    RegistrationStates.Cancelled,
    RegistrationStates.Expired,
    RegistrationStates.PaidAndCancelled,
  ].includes(state);

  return (
    <div>
      <Text className="bold">{t('label')}</Text>
      <div className="columns gapped-xxs">
        {hasEvaluation && <EvaluationStateInfo state={evaluationState} />}
        {!hasEvaluation && isEnrolled && (
          <>
            <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
            <Text>{t('enrolled')}</Text>
          </>
        )}
        {isQueued && (
          <>
            <AlarmOutlinedIcon className="user-details-page__icon--alert" />
            <Text>{t('queued', { positionInQueue })}</Text>
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
  const { paidAt, expiresAt, examFee, isFreeRegistration } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.examPayment',
  });

  if (isFreeRegistration) {
    return (
      <div>
        <Text className="bold">{t('label')}</Text>
        <div className="columns gapped-xxs">
          <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
          <Text>{t('free')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Text className="bold">{t('label')}</Text>
      {paidAt && (
        <div className="columns gapped-xxs">
          <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
          <Text>
            {t('paidAt', {
              date: DateUtils.formatOptionalDate(paidAt, 'l'),
            })}
          </Text>
        </div>
      )}
      {!paidAt && (
        <div className="columns gapped-xxs">
          <WarningOutlinedIcon className="user-details-page__icon--alert align-self-start" />{' '}
          <div className="rows">
            <Text>
              {t('notPaid', {
                examFee,
              })}
            </Text>
            <Text className="user-details-page__text--alert">
              {t('expiresAt', {
                date: DateUtils.formatOptionalDate(expiresAt, 'l'),
              })}
            </Text>
          </div>
        </div>
      )}
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
        {r.kind === RegistrationKind.Queue && (
          <div>
            <Text className="bold">
              {translateCommon('registrationPeriod')}
            </Text>
            <Text>
              {DateUtils.formatOptionalDate(r.registrationStartDate, 'l')} —{' '}
              {DateUtils.formatOptionalDate(r.registrationEndDate, 'l')}
            </Text>
          </div>
        )}
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
            </div>
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
            <Text>
              <b>{translateCommon('name')}:</b> {personDetails.firstName}{' '}
              {personDetails.lastName}
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
              to={AppRoutes.ModifyContactDetails}
              fullWidth={false}
              startIcon={<EditOutlinedIcon />}
              className="text-transform-none user-details-page__edit-btn"
            >
              {t('modify')}
            </CustomButtonLink>
          </div>
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
            {['point1', 'point3', 'point4', 'point7'].map((point, i) => (
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
  const { loggedInSession } = useAppSelector(sessionSelector);
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

  const registrations = personDetails?.registrations || [];

  const canceledRegistrations = [
    ...filterByState(registrations, cancelledStates),
  ].sort(earliestExamDateFirstComparator);
  const upcomingAndPastRegistrations = filterByState(registrations, [
    RegistrationStates.Submitted,
    RegistrationStates.Completed,
    RegistrationStates.Started,
  ]);

  const upcomingRegistrations = [
    ...filterByDate(upcomingAndPastRegistrations, true),
  ].sort(latestExamDateFirstComparator);

  const pastRegistrations = [
    ...filterByDate(upcomingAndPastRegistrations, false),
  ].sort(earliestExamDateFirstComparator);

  const renderBulletpoints = () => {
    if (loggedInSession?.['auth-method'] === 'EMAIL') {
      if (
        upcomingRegistrations[0]?.positionInQueue ||
        upcomingRegistrations[0]?.liftedFromQueueAt
      ) {
        return ['point5', 'point6', 'point7'].map((point, i) => (
          <li key={i}>{t(`introduction.bulletPoints.${point}`)}</li>
        ));
      } else {
        return ['point4', 'point7'].map((point, i) => (
          <li key={i}>{t(`introduction.bulletPoints.${point}`)}</li>
        ));
      }
    }

    return ['point1', 'point3', 'point4', 'point7'].map((point, i) => (
      <li key={i}>{t(`introduction.bulletPoints.${point}`)}</li>
    ));
  };

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
            {renderBulletpoints()}
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
          <div
            className={`margin-top-xxl rows ${
              upcomingRegistrations.length > 0 ? 'gapped-xxl' : 'gapped'
            }`}
          >
            <H2 className="user-details-page__info__section__heading-title">
              {t('registrations.header.upcoming')}
            </H2>
            {upcomingRegistrations.length > 0 && (
              <Registrations
                filteredRegistrations={upcomingRegistrations}
                setIsCancelModalOpen={setIsCancelModalOpen}
              />
            )}
            {upcomingRegistrations.length == 0 && (
              <InfoBox>
                <Text>{t('registrations.upcoming.notFound')}</Text>
              </InfoBox>
            )}
          </div>
          <div
            className={`margin-top-xxl rows ${
              pastRegistrations.length > 0 ? 'gapped-xxl' : 'gapped'
            }`}
          >
            <H2 className="user-details-page__info__section__heading-title">
              {t('registrations.header.past')}
            </H2>
            {pastRegistrations.length > 0 && (
              <Registrations
                filteredRegistrations={pastRegistrations}
                setIsCancelModalOpen={setIsCancelModalOpen}
              />
            )}
            {pastRegistrations.length == 0 && (
              <InfoBox>
                <Text>{t('registrations.past.notFound')}</Text>
              </InfoBox>
            )}
          </div>

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
