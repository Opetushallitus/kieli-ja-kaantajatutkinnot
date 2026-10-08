import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  CustomButtonLink,
  CustomCircularProgress,
  CustomModal,
  H2,
  H3,
  ManagedPaginatedTable,
  Pagination,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicExamSessionCard } from 'components/registration/examSession/PublicExamSessionCard';
import { PublicExamSessionListingHeader } from 'components/registration/examSession/PublicExamSessionListingHeader';
import { PublicExamSessionListingRow } from 'components/registration/examSession/PublicExamSessionListingRow';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import {
  PartialExamType,
  PublicRegistrationInitErrorState,
} from 'interfaces/publicRegistration';
import {
  initRegistration,
  resetPublicRegistration,
} from 'redux/reducers/registration';
import { examSessionsSelector } from 'redux/selectors/examSessions';
import { registrationSelector } from 'redux/selectors/registration';
import { TableUtils } from 'utils/table';

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
  partialExamType,
}: {
  examSessionId: number;
  partialExamType: PartialExamType;
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
                {error === PublicRegistrationInitError.ExamSessionPartialFull &&
                  t('registerToPartialExamsSeparately')}
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
              )}${`?registrationId=${otherExamSessionRegistration?.registration_id}`}`}
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
                    examSessionId,
                    registrationKind: RegistrationKind.Queue,
                    partialExamType,
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

export const NewYkiPublicExamSessionsTable = ({
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

  const paginatedSessions = examSessions.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
  );

  // Pagination on top and bottom of the card listing
  return (
    <>
      <Pagination
        count={examSessions.length}
        page={page}
        handlePageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        handleRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        rowsPerPageLabel={translateCommon(
          'component.table.pagination.rowsPerPage',
        )}
        labelDisplayedRows={({ from, to, count }) => (
          <DisplayedRowsLabel from={from} to={to} count={count} />
        )}
        backIconButtonProps={TableUtils.getPaginationBackButtonProps()}
        nextIconButtonProps={TableUtils.getPaginationNextButtonProps()}
      />
      <div className="exam-session-cards">
        {paginatedSessions.map((examSession) => (
          <PublicExamSessionCard
            key={examSession.id}
            examSession={examSession}
          />
        ))}
      </div>
      <Pagination
        count={examSessions.length}
        page={page}
        handlePageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        handleRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        rowsPerPageLabel={translateCommon(
          'component.table.pagination.rowsPerPage',
        )}
        labelDisplayedRows={({ from, to, count }) => (
          <DisplayedRowsLabel from={from} to={to} count={count} />
        )}
        backIconButtonProps={TableUtils.getPaginationBackButtonProps()}
        nextIconButtonProps={TableUtils.getPaginationNextButtonProps()}
      />
    </>
  );
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

const getRowDetails = (examSession: ExamSession) => {
  return <PublicExamSessionListingRow examSession={examSession} />;
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
  }, [page, rowsPerPage, status]);

  useEffect(() => {
    if (
      initRegistration.status === APIResponseStatus.Success &&
      initRegistration.examSessionId
    ) {
      navigate({
        pathname: AppRoutes.ExamSession.replace(
          /:examSessionId$/,
          `${initRegistration.examSessionId}`,
        ),
        search: initRegistration.registrationId
          ? `?registrationId=${initRegistration.registrationId}`
          : '',
      });
    }
  }, [
    navigate,
    initRegistration.status,
    initRegistration.examSessionId,
    initRegistration.registrationId,
  ]);

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
          {isRegistrationInitError &&
            initRegistration.examSessionId &&
            initRegistration.partialExamType && (
              <RegistrationInitErrorModal
                examSessionId={initRegistration.examSessionId}
                partialExamType={initRegistration.partialExamType}
              />
            )}
          <div ref={listingHeaderRef} style={{ marginBottom: '2rem' }}>
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
            <NewYkiPublicExamSessionsTable
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
