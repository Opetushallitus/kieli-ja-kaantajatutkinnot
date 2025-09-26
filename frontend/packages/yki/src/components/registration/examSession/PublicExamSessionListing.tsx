import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CustomButton,
  CustomButtonLink,
  CustomCircularProgress,
  CustomModal,
  H2,
  H3,
  ManagedPaginatedTable,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicExamSessionListingHeader } from 'components/registration/examSession/PublicExamSessionListingHeader';
import { PublicExamSessionListingRow } from 'components/registration/examSession/PublicExamSessionListingRow';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { PublicRegistrationInitErrorState } from 'interfaces/publicRegistration';
import {
  initRegistration,
  resetPublicRegistration,
} from 'redux/reducers/registration';
import { examSessionsSelector } from 'redux/selectors/examSessions';
import { registrationSelector } from 'redux/selectors/registration';
import { TableUtils } from 'utils/table';

const getRowDetails = (examSession: ExamSession) => {
  return <PublicExamSessionListingRow examSession={examSession} />;
};

const DisplayedRowsLabel = ({
  from,
  to,
  count,
}: {
  from: number;
  to: number;
  count: number;
}) => {
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const fullLabelText = translateCommon(
    'component.table.pagination.displayedRowsAriaLabel',
    {
      from,
      to,
      count,
    },
  );

  if (isPhone) {
    return (
      <>
        <span className="display-none">{fullLabelText}</span>
        <span aria-hidden="true">
          {translateCommon('component.table.pagination.displayedRowsLabel', {
            from,
            to,
            count,
          })}
        </span>
      </>
    );
  } else {
    return fullLabelText;
  }
};

const RegistrationInitLoadingModal = () => {
  const { initRegistration } = useAppSelector(registrationSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.enrollModal',
  });

  return (
    <CustomModal
      data-testid="registration-loading-modal"
      className="registration-loading-modal"
      open={true}
      aria-labelledby="registration-loading-modal-description"
      aria-describedby="registration-loading-modal-description"
      onCloseModal={() => {}}
    >
      <div className="registration-loading-modal__content columns">
        <CustomCircularProgress color={Color.Secondary} />
        <Text id="registration-loading-modal-description">
          {initRegistration.registrationKind === RegistrationKind.Admission
            ? t('checkingOpenSeats')
            : t('reservingQueueSeat')}
        </Text>
      </div>
    </CustomModal>
  );
};

const OtherStartedRegistrationErrorModal = () => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'yki.component.registration.enrollModal.otherStartedRegistration',
  });

  return (
    <>
      <H2
        id="registration-error-modal-description"
        data-testid="registration-error-modal-description"
      >
        {t('title')}
      </H2>
      <Text>{t('part1')}</Text>
      <Text>{t('part2')}</Text>
      <Text>{t('part3')}</Text>
    </>
  );
};

const RegistrationInitErrorModal = ({
  examSessionId,
}: {
  examSessionId: number;
}) => {
  const dispatch = useAppDispatch();
  const { initRegistration: initRegistrationState } =
    useAppSelector(registrationSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.enrollModal',
  });
  const { error, otherExamSessionRegistration } =
    initRegistrationState.error as PublicRegistrationInitErrorState;

  const otherStartedRegistration =
    otherExamSessionRegistration &&
    otherExamSessionRegistration.state === RegistrationStates.Started;
  const alreadyRegistered =
    error === PublicRegistrationInitError.AlreadyRegistered;

  return (
    <CustomModal
      data-testid="registration-error-modal"
      className="registration-error-modal"
      open={true}
      aria-labelledby="registration-error-modal-description"
      aria-describedby="registration-error-modal-description"
      onCloseModal={() => {}}
    >
      <>
        <div className="rows gapped">
          {otherStartedRegistration && <OtherStartedRegistrationErrorModal />}
          {!otherStartedRegistration && alreadyRegistered && (
            <>
              <H2>{t('title')}</H2>
              <Text
                id="registration-error-modal-description"
                data-testid="registration-error-modal-description"
              >
                {t('alreadyRegistered.part1')}
              </Text>
              <Text>{t('alreadyRegistered.part2')}</Text>
            </>
          )}
          {!otherStartedRegistration && !alreadyRegistered && (
            <>
              <H2>{t('title')}</H2>
              <Text
                id="registration-error-modal-description"
                data-testid="registration-error-modal-description"
              >
                {error === PublicRegistrationInitError.ExamSessionFull &&
                  t('examIsFull')}
                {error === PublicRegistrationInitError.Past && t('examClosed')}
              </Text>
            </>
          )}
        </div>
        <div className="columns gapped flex-end">
          <CustomButton
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={() => {
              dispatch(resetPublicRegistration());
            }}
          >
            {t('close')}
          </CustomButton>
          {otherStartedRegistration && (
            <CustomButtonLink
              color={Color.Secondary}
              variant={Variant.Contained}
              to={`${AppRoutes.ExamSession.replace(
                /:examSessionId/,
                `${otherExamSessionRegistration?.id}`,
              )}`}
            >
              {t('otherStartedRegistration.backToRegistrationButton')}
            </CustomButtonLink>
          )}
          {error === PublicRegistrationInitError.ExamSessionFull && (
            <CustomButton
              color={Color.Secondary}
              variant={Variant.Contained}
              onClick={() => {
                dispatch(resetPublicRegistration());
                dispatch(
                  initRegistration({
                    examSessionId: examSessionId,
                    registrationKind: RegistrationKind.Queue,
                  }),
                );
              }}
            >
              {t('enrollToQueue')}
            </CustomButton>
          )}
        </div>
      </>
    </CustomModal>
  );
};

export const PublicExamSessionsTable = ({
  examSessions,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  rowsPerPageOptions,
}: {
  examSessions: Array<ExamSession>;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: Array<number>;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <ManagedPaginatedTable
      className="public-exam-session-listing table-layout-auto"
      data={examSessions}
      header={<PublicExamSessionListingHeader />}
      getRowDetails={getRowDetails}
      rowsPerPageOptions={rowsPerPageOptions}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageLabel={translateCommon(
        'component.table.pagination.rowsPerPage',
      )}
      labelDisplayedRows={({ from, to, count }) => (
        <DisplayedRowsLabel from={from} to={to} count={count} />
      )}
      backIconButtonProps={TableUtils.getPaginationBackButtonProps()}
      nextIconButtonProps={TableUtils.getPaginationNextButtonProps()}
      stickyHeader
    />
  );
};

export const PublicExamSessionListing = ({
  examSessions,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  rowsPerPageOptions,
}: {
  examSessions: Array<ExamSession>;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: Array<number>;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage.examSessionListing',
  });
  const translateCommon = useCommonTranslation();
  const navigate = useNavigate();
  const { status } = useAppSelector(examSessionsSelector);
  const { initRegistration } = useAppSelector(registrationSelector);

  const listingHeaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      listingHeaderRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
      });
    }
  }, [status]);

  useEffect(() => {
    if (
      initRegistration.status === APIResponseStatus.Success &&
      initRegistration.examSessionId
    ) {
      navigate(
        AppRoutes.ExamSession.replace(
          /:examSessionId$/,
          `${initRegistration.examSessionId}`,
        ),
      );
    }
  }, [navigate, initRegistration.status, initRegistration.examSessionId]);

  const isRegistrationLoading =
    initRegistration.status === APIResponseStatus.InProgress;
  const isRegistrationInitError =
    initRegistration.status === APIResponseStatus.Error;

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <CustomCircularProgress color={Color.Secondary} />;
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H3>{translateCommon('errors.loadingFailed')}</H3>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          {isRegistrationLoading && <RegistrationInitLoadingModal />}
          {isRegistrationInitError && initRegistration.examSessionId && (
            <RegistrationInitErrorModal
              examSessionId={initRegistration.examSessionId}
            />
          )}
          <div ref={listingHeaderRef}>
            <Typography
              variant="h2"
              component="h3"
              aria-label={translateCommon(
                'component.table.header.searchResultsAriaLabel',
                {
                  count: examSessions.length,
                },
              )}
              aria-live="assertive"
            >
              {translateCommon('component.table.header.searchResults', {
                count: examSessions.length,
              })}
            </Typography>
          </div>
          {examSessions.length > 0 ? (
            <PublicExamSessionsTable
              examSessions={examSessions}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
            />
          ) : (
            <Text className="margin-top-lg">{t('noResults')}</Text>
          )}
        </>
      );
  }
};
