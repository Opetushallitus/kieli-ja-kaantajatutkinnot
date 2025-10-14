import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import {
  Container,
  Grid,
  Paper,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CustomButton,
  CustomTable,
  H1,
  H2,
  HeaderSeparator,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { TransferRegistrationTarget } from 'interfaces/transferRegistration';
import {
  loadTransferRegistrationDetails,
  resetTransferRegistrationState,
  transferRegistration,
} from 'redux/reducers/transferRegistration';
import { transferRegistrationSelector } from 'redux/selectors/transferRegistration';
import { ExamSessionUtils } from 'utils/examSession';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferRegistrationPage',
  });

  return (
    <Grid className="transfer-registration-page__grid-container__item-header">
      <H1>{t('title')}</H1>
      <HeaderSeparator />
      <Text>{t('introduction.info')}</Text>
      <ul>
        <Text>
          <li>{t('introduction.criteria.item1')}</li>
          <li>{t('introduction.criteria.item2')}</li>
        </Text>
      </ul>
    </Grid>
  );
};

const CurrentRegistrationDetails = () => {
  const { transferRegistrationDetails } = useAppSelector(
    transferRegistrationSelector,
  );

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferRegistrationPage.currentRegistrationDetails',
  });
  const translateCommon = useCommonTranslation();

  if (!transferRegistrationDetails) {
    return null;
  }

  const location = ExamSessionUtils.getLocationInfo(
    transferRegistrationDetails,
    getCurrentLang(),
  );

  return (
    <Grid className="transfer-registration-page__grid-container__item-header">
      <div className="rows gapped">
        <H2>{t('heading')}</H2>
        <Paper
          elevation={3}
          className="transfer-registration-page__current-registration-details"
        >
          <Text>
            <b>{`${translateCommon('examSession')}: `}</b>
            {ExamSessionUtils.languageAndLevelText(transferRegistrationDetails)}
          </Text>
          <Text>
            <b>{`${translateCommon('examDate')}: `}</b>
            {DateUtils.formatOptionalDate(
              transferRegistrationDetails.session_date,
              'l',
            )}
          </Text>
          <Text>
            <b>{`${translateCommon('institution')}: `}</b>
            {`${location.name}, ${
              location.street_address
            }, ${ExamSessionUtils.getMunicipality(location)}`}
          </Text>
        </Paper>
      </div>
    </Grid>
  );
};

const TransferTargetsTableHeading = () => {
  const translateCommon = useCommonTranslation();

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{translateCommon('examination')}</TableCell>
        <TableCell>{translateCommon('examDate')}</TableCell>
        <TableCell>{translateCommon('institution')}</TableCell>
        <TableCell>{translateCommon('placesAvailable')}</TableCell>
        <TableCell>{translateCommon('actions')}</TableCell>
      </TableRow>
    </TableHead>
  );
};

const RelocateButton = ({ target }: { target: TransferRegistrationTarget }) => {
  const { transferRegistrationDetails } = useAppSelector(
    transferRegistrationSelector,
  );
  const dispatch = useAppDispatch();
  const { isPhone } = useWindowProperties();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.transferRegistration',
  });
  const translateCommon = useCommonTranslation();
  const { showDialog } = useDialog();

  if (!transferRegistrationDetails) {
    return null;
  }

  const relocate = () => {
    dispatch(
      transferRegistration({
        registration_id: transferRegistrationDetails.id,
        to_exam_session_id: target.id,
      }),
    );
  };
  const displayConfirmationDialog = () => {
    const lang = getCurrentLang();
    const locationInfo = ExamSessionUtils.getLocationInfo(target, lang);
    showDialog({
      title: t('title'),
      severity: Severity.Info,
      content: (
        <div className="rows gapped">
          <Text>{t('confirmTransfer')}</Text>
          <Text>
            <b>{translateCommon('examination')}:</b>{' '}
            {ExamSessionUtils.languageAndLevelText(target)}
            <br />
            <b>{translateCommon('examDate')}:</b>{' '}
            {DateUtils.formatOptionalDate(target.session_date, 'l')}
            <br />
            <b>{translateCommon('institution')}:</b> {locationInfo.name},{' '}
            {locationInfo.street_address},{' '}
            {ExamSessionUtils.getMunicipality(locationInfo)}
            <br />{' '}
          </Text>
          <Text>
            <b>{t('description')}</b>
          </Text>
        </div>
      ),
      actions: [
        {
          title: t('actions.confirm'),
          variant: Variant.Outlined,
          action: relocate,
        },
        {
          title: t('actions.cancel'),
          variant: Variant.Contained,
        },
      ],
    });
  };

  return (
    <CustomButton
      color={Color.Secondary}
      variant={Variant.Outlined}
      fullWidth={target && isPhone}
      onClick={displayConfirmationDialog}
    >
      {t('select')}
    </CustomButton>
  );
};

const TransferTargetPhoneCells = ({
  target,
}: {
  target: TransferRegistrationTarget;
}) => {
  const lang = getCurrentLang();
  const locationInfo = ExamSessionUtils.getLocationInfo(target, lang);
  const availablePlaces = Math.max(
    target.max_participants - target.participants,
    0,
  );
  const translateCommon = useCommonTranslation();

  return (
    <TableCell>
      <Text>
        <b>{translateCommon('examination')}:</b>{' '}
        {ExamSessionUtils.languageAndLevelText(target)}
        <br />
        <b>{translateCommon('examDate')}:</b>{' '}
        {DateUtils.formatOptionalDate(target.session_date, 'l')}
        <br />
        <b>{translateCommon('institution')}:</b> {locationInfo.name},{' '}
        {locationInfo.street_address},{' '}
        {ExamSessionUtils.getMunicipality(locationInfo)}
        <br />
        <b>{translateCommon('placesAvailable')}:</b> {availablePlaces}
        <br />
      </Text>
      <RelocateButton target={target} />
    </TableCell>
  );
};

const TransferTargetDesktopCells = ({
  target,
}: {
  target: TransferRegistrationTarget;
}) => {
  const lang = getCurrentLang();
  const locationInfo = ExamSessionUtils.getLocationInfo(target, lang);
  const availablePlaces = Math.max(
    target.max_participants - target.participants,
    0,
  );

  return (
    <>
      <TableCell>
        <Text>{ExamSessionUtils.languageAndLevelText(target)}</Text>
      </TableCell>
      <TableCell>
        <Text>{DateUtils.formatOptionalDate(target.session_date, 'l')}</Text>
      </TableCell>
      <TableCell>
        <Text>
          {locationInfo.name}, {locationInfo.street_address}
          <br />
          {ExamSessionUtils.getMunicipality(locationInfo)}
        </Text>
      </TableCell>
      <TableCell>{availablePlaces}</TableCell>
      <TableCell>
        <RelocateButton target={target} />
      </TableCell>
    </>
  );
};

const TransferTargetTableRow = ({
  target,
}: {
  target: TransferRegistrationTarget;
}) => {
  const { isPhone } = useWindowProperties();

  return (
    <TableRow>
      {isPhone ? (
        <TransferTargetPhoneCells target={target} />
      ) : (
        <TransferTargetDesktopCells target={target} />
      )}
    </TableRow>
  );
};

const getTransferTargetDetails = (target: TransferRegistrationTarget) => {
  return <TransferTargetTableRow target={target} />;
};

const TransferTargetsTable = () => {
  const { isPhone } = useWindowProperties();
  const { transferRegistrationDetails } = useAppSelector(
    transferRegistrationSelector,
  );

  if (!transferRegistrationDetails) {
    return null;
  }

  return (
    <CustomTable
      className=""
      header={isPhone ? undefined : <TransferTargetsTableHeading />}
      data={transferRegistrationDetails.targets}
      getRowDetails={getTransferTargetDetails}
    ></CustomTable>
  );
};

const SelectNewExamDate = () => {
  const { transferRegistrationDetails } = useAppSelector(
    transferRegistrationSelector,
  );
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferRegistrationPage.selectNewExamDate',
  });

  if (!transferRegistrationDetails) {
    return null;
  }

  const transferTargets = transferRegistrationDetails.is_transferable
    ? transferRegistrationDetails.targets
    : [];

  return (
    <Grid className="transfer-registration-page__grid-container__item-header">
      {transferTargets.length === 0 && (
        <div className="rows gapped">
          <H2>{t('heading')}</H2>{' '}
          <Container className="transfer-registration-page__info-box">
            <div className="columns gapped-sm">
              <InfoOutlineIcon color={Color.Secondary} />

              <Text>
                {t('noCandidatesFound', {
                  email: transferRegistrationDetails.contact_email,
                })}
              </Text>
            </div>
          </Container>
        </div>
      )}
      {transferTargets.length > 0 && (
        <div className="rows gapped">
          <H2>{`${t('heading')} (${transferTargets.length})`}</H2>{' '}
          <TransferTargetsTable />
        </div>
      )}
    </Grid>
  );
};

export const TransferRegistrationPage = () => {
  const dispatch = useAppDispatch();
  const { loadDetailsStatus, transferStatus } = useAppSelector(
    transferRegistrationSelector,
  );

  // React Router
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      loadDetailsStatus === APIResponseStatus.NotStarted &&
      params.registrationId
    ) {
      dispatch(loadTransferRegistrationDetails(+params.registrationId));
    }
  }, [dispatch, params.registrationId, loadDetailsStatus]);

  useEffect(() => {
    if (transferStatus === APIResponseStatus.Success) {
      navigate(
        AppRoutes.TransferRegistrationSuccess.replace(
          /:registrationId/,
          `${params.registrationId}`,
        ),
      );
      dispatch(resetTransferRegistrationState());
    }
  }, [transferStatus, navigate, dispatch, params.registrationId]);

  const loading =
    loadDetailsStatus === APIResponseStatus.InProgress ||
    transferStatus === APIResponseStatus.InProgress;

  return (
    <Box className="transfer-registration-page">
      <LoadingProgressIndicator isLoading={loading}>
        <Grid
          container
          rowSpacing={4}
          direction="column"
          className="transfer-registration-page__grid-container"
        >
          <Header />
          <CurrentRegistrationDetails />
          <SelectNewExamDate />
        </Grid>
      </LoadingProgressIndicator>
    </Box>
  );
};
