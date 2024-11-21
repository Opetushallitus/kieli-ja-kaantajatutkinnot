import {
  Box,
  Paper,
  SelectChangeEvent,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { PublicExaminer } from 'interfaces/publicExaminer';
import { resetPublicEnrollmentContact } from 'redux/reducers/publicEnrollmentContact';
import { setPublicExaminerLanguageFilter } from 'redux/reducers/publicExaminer';
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

const DesktopExaminerRow = ({
  id,
  name,
  language,
  municipalities,
  examDates,
}: PublicExaminer) => {
  // TODO Rendering for mobile users
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const appLanguage = getCurrentLang();

  const handleOnClick = () => {
    dispatch(resetPublicEnrollmentContact());
    navigate(
      AppRoutes.PublicEnrollmentContactContactDetails.replace(
        ':examinerId',
        id.toString(),
      ),
    );
  };

  return (
    <TableRow sx={{ verticalAlign: 'text-top' }}>
      <TableCell>
        <Text>{name}</Text>
      </TableCell>
      <TableCell>
        <Text>{t('examLanguage.' + language)}</Text>
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
        <Text>
          {examDates.length > 0
            ? examDates.map((v, i) => (
                <Fragment key={i}>
                  {i > 0 ? <br /> : undefined}
                  {DateUtils.formatOptionalDate(v.examDate)}
                </Fragment>
              ))
            : t('row.byRequest')}
        </Text>
      </TableCell>
      <TableCell>
        <CustomButton
          color={Color.Secondary}
          variant={Variant.Outlined}
          onClick={handleOnClick}
        >
          {t('row.contact')}
        </CustomButton>
      </TableCell>
    </TableRow>
  );
};

const getRowDetails = ({
  id,
  name,
  language,
  municipalities,
  examDates,
}: PublicExaminer) => {
  return (
    <DesktopExaminerRow
      name={name}
      language={language}
      municipalities={municipalities}
      examDates={examDates}
      id={id}
    />
  );
};

export const PublicExaminerListing = () => {
  const { languageFilter, status } = useAppSelector(publicExaminerSelector);
  const filteredExaminers = useAppSelector(selectFilteredPublicExaminers);
  const dispatch = useAppDispatch();

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(
      setPublicExaminerLanguageFilter(event.target.value as ExamLanguage),
    );
  };

  const translateCommon = useCommonTranslation();

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
      return (
        <Paper elevation={3} className="public-examiner-listing">
          <div className="columns">
            <div className="grow">
              <H2>Ota yhteyttä tutkinnon vastaanottajiin</H2>
            </div>
          </div>
          <LanguageFilter
            value={languageFilter}
            onChange={handleLanguageFilterChange}
          />
          <CustomTable
            className="table-layout-auto"
            data={filteredExaminers}
            getRowDetails={getRowDetails}
            header={<PublicExaminerListingHeader />}
          />
        </Paper>
      );
  }
};
