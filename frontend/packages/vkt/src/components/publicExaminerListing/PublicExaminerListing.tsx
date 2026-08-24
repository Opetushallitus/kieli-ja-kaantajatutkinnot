import {
  Box,
  Divider,
  Paper,
  SelectChangeEvent,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  CustomCircularProgress,
  CustomTable,
  H2,
  Text,
} from 'shared/components';
import { APIResponseStatus, AppLanguage, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { LanguageFilter } from 'components/common/LanguageFilter';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { Municipality } from 'interfaces/municipality';
import { PublicExaminer } from 'interfaces/publicExaminer';
import { resetPublicEnrollmentContactStates } from 'redux/reducers/publicEnrollmentContact';
import { setPublicExaminerLanguageFilter } from 'redux/reducers/publicExaminer';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';
import {
  publicExaminerSelector,
  selectFilteredPublicExaminers,
} from 'redux/selectors/publicExaminer';

const PublicExaminerListingHeader = () => {
  const { isPhone } = useWindowProperties();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing.header',
  });

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>{t('examiner')}</TableCell>
          <TableCell>{t('language')}</TableCell>
          <TableCell>{t('municipality')}</TableCell>
          <TableCell>{t('examDates')}</TableCell>
          <TableCell>{t('actions')}</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};

const ExaminerRowExamDates = ({
  examDates,
}: Pick<PublicExaminer, 'examDates'>) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  // TODO Handle case where registration period for exam is closed

  return (
    <Text>
      {examDates.length > 0
        ? examDates.map(({ examDate, isFull }, i) => (
            <Fragment key={i}>
              {i > 0 ? <br aria-hidden={true} /> : undefined}
              {isFull ? (
                <>
                  <s>{DateUtils.formatOptionalDate(examDate)}</s>{' '}
                  {t('row.full')}
                </>
              ) : (
                DateUtils.formatOptionalDate(examDate)
              )}
            </Fragment>
          ))
        : t('row.byRequest')}
    </Text>
  );
};

const DesktopPublicExaminerRow = ({
  examiner,
}: {
  examiner: PublicExaminer;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  const navigate = useNavigate();
  const appLanguage = getCurrentLang();
  const dispatch = useAppDispatch();

  const { id, name, language, municipalities, examDates } = examiner;
  const handleOnClick = () => {
    dispatch(resetPublicEnrollmentContactStates());
    navigate(
      AppRoutes.PublicEnrollmentContactContactDetails.replace(
        ':examinerId',
        id.toString(),
      ),
    );
  };

  const { contactedExaminers } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const alreadyContacted = contactedExaminers.find(
    (contacted) => id === contacted.id,
  );

  return (
    <TableRow sx={{ verticalAlign: 'text-top' }}>
      <TableCell>
        <Text>{name}</Text>
      </TableCell>
      <TableCell>
        <Text>
          {language === ExamLanguage.ALL ? (
            <>
              {t('examLanguage.FI')}
              <br aria-hidden={true} />
              {t('examLanguage.SV')}
            </>
          ) : (
            t('examLanguage.' + language)
          )}
        </Text>
      </TableCell>
      <TableCell>
        <Text>
          {municipalities.length > 0
            ? municipalities
                .map(({ fi, sv }) =>
                  appLanguage === AppLanguage.Swedish ? sv : fi,
                )
                .join(', ')
            : ''}
        </Text>
      </TableCell>
      <TableCell>
        <ExaminerRowExamDates examDates={examDates} />
      </TableCell>
      <TableCell>
        {alreadyContacted ? (
          <Text>{t('row.alreadyContacted')}</Text>
        ) : (
          <CustomButton
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={handleOnClick}
          >
            {t('row.contact')}
          </CustomButton>
        )}
      </TableCell>
    </TableRow>
  );
};

const MobilePublicExaminerRow = ({
  examiner,
}: {
  examiner: PublicExaminer;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  const navigate = useNavigate();
  const appLanguage = getCurrentLang();

  const { id, name, language, municipalities, examDates } = examiner;
  const handleOnClick = () => {
    navigate(
      AppRoutes.PublicEnrollmentContactContactDetails.replace(
        ':examinerId',
        id.toString(),
      ),
    );
  };

  const { contactedExaminers } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const alreadyContacted = contactedExaminers.find(
    (contacted) => id === contacted.id,
  );

  return (
    <TableRow sx={{ verticalAlign: 'text-top' }}>
      <TableCell>
        <div className="rows grow gapped-xs">
          <div className="rows">
            <Text>
              <b>{t('header.examiner')}</b>
            </Text>
            <Typography component="p" variant="h2">
              {name}
            </Typography>
          </div>
          <div className="rows">
            <Text>
              <b>{t('header.language')}</b>
            </Text>
            <Text>
              {language === ExamLanguage.ALL ? (
                <>
                  {t('examLanguage.FI')}
                  <br aria-hidden={true} />
                  {t('examLanguage.SV')}
                </>
              ) : (
                t('examLanguage.' + language)
              )}
            </Text>
          </div>
          <div className="rows">
            <Text>
              <b>{t('header.municipality')}</b>
            </Text>
            <Text>
              {municipalities.map(({ fi, sv }, i) => {
                const municipalityText =
                  appLanguage === AppLanguage.Swedish ? sv : fi;

                return (
                  <Fragment key={`examiner-${id}-municipality-${i}`}>
                    {i > 0 ? <br aria-hidden={true} /> : undefined}
                    {municipalityText}
                  </Fragment>
                );
              })}
            </Text>
          </div>
          <div className="rows">
            <Text>
              <b>{t('header.examDates')}</b>
            </Text>
            <ExaminerRowExamDates examDates={examDates} />
          </div>
          {alreadyContacted ? (
            <Text>{t('row.alreadyContacted')}</Text>
          ) : (
            <CustomButton
              color={Color.Secondary}
              variant={Variant.Outlined}
              onClick={handleOnClick}
            >
              {t('row.contact')}
            </CustomButton>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const sortExaminers = (examiners: Array<PublicExaminer>) => {
  if (!examiners) {
    return [];
  }

  const appLanguage = getCurrentLang();
  const translatedMunicipality = (municipalities: Array<Municipality>) => {
    if (!municipalities) {
      return '';
    }

    return appLanguage === AppLanguage.Swedish
      ? municipalities[0].sv
      : municipalities[0].fi;
  };

  return examiners.toSorted((e1, e2) => {
    const municipalityText1 = translatedMunicipality(e1.municipalities);
    const municipalityText2 = translatedMunicipality(e2.municipalities);

    return municipalityText1.localeCompare(municipalityText2);
  });
};

const PublicExaminerRow = ({ examiner }: { examiner: PublicExaminer }) => {
  const { isPhone } = useWindowProperties();

  if (isPhone) {
    return <MobilePublicExaminerRow examiner={examiner} />;
  } else {
    return <DesktopPublicExaminerRow examiner={examiner} />;
  }
};

const getRowDetails = (examiner: PublicExaminer) => {
  return <PublicExaminerRow examiner={examiner} />;
};

const MobilePublicExaminerListing = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  const { languageFilter } = useAppSelector(publicExaminerSelector);
  const filteredExaminers = useAppSelector(selectFilteredPublicExaminers);
  const sortedExaminers = sortExaminers(filteredExaminers);
  const dispatch = useAppDispatch();

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(
      setPublicExaminerLanguageFilter(event.target.value as ExamLanguage),
    );
  };

  return (
    <div className="public-examiner-listing">
      <H2>{t('title')}</H2>
      <LanguageFilter
        value={languageFilter}
        onChange={handleLanguageFilterChange}
      />
      <Divider />
      <CustomTable
        className="table-layout-fixed"
        data={sortedExaminers}
        getRowDetails={getRowDetails}
        header={<PublicExaminerListingHeader />}
      />
    </div>
  );
};

const DesktopPublicExaminerListing = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  const { languageFilter } = useAppSelector(publicExaminerSelector);
  const filteredExaminers = useAppSelector(selectFilteredPublicExaminers);
  const sortedExaminers = sortExaminers(filteredExaminers);
  const dispatch = useAppDispatch();

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(
      setPublicExaminerLanguageFilter(event.target.value as ExamLanguage),
    );
  };

  return (
    <Paper elevation={3} className="public-examiner-listing">
      <H2>{t('title')}</H2>
      <LanguageFilter
        value={languageFilter}
        onChange={handleLanguageFilterChange}
      />
      <CustomTable
        className="table-layout-fixed"
        data={sortedExaminers}
        getRowDetails={getRowDetails}
        header={<PublicExaminerListingHeader />}
      />
    </Paper>
  );
};

export const PublicExaminerListing = () => {
  const { status } = useAppSelector(publicExaminerSelector);
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

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
          <H2>{translateCommon('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      if (isPhone) {
        return <MobilePublicExaminerListing />;
      } else {
        return <DesktopPublicExaminerListing />;
      }
  }
};
