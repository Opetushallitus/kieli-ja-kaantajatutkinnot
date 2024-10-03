import {
  Box,
  Paper,
  SelectChangeEvent,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Fragment } from 'react';
import {
  CustomButtonLink,
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
import { ExamLanguage } from 'enums/app';
import { PublicExaminer } from 'interfaces/publicExaminer';
import { setPublicExaminerLanguageFilter } from 'redux/reducers/publicExaminer';
import {
  publicExaminerSelector,
  selectFilteredPublicExaminers,
} from 'redux/selectors/publicExaminer';

const PublicExaminerListingHeader = () => {
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>Tutkinnon vastaanottaja</TableCell>
          <TableCell>Kieli</TableCell>
          <TableCell>Paikkakunta</TableCell>
          <TableCell>Tutkintopäivät</TableCell>
          <TableCell>Toiminnot</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};

const DesktopExaminerRow = ({
  name,
  language,
  municipalities,
  examDates,
}: Omit<PublicExaminer, 'id'>) => {
  // TODO Rendering for mobile users
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExaminerListing',
  });
  const appLanguage = getCurrentLang();

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
                  {DateUtils.formatOptionalDate(v)}
                </Fragment>
              ))
            : 'Ei määritelty'}
        </Text>
      </TableCell>
      <TableCell>
        <CustomButtonLink
          color={Color.Secondary}
          variant={Variant.Outlined}
          to={''}
        >
          Ota yhteyttä
        </CustomButtonLink>
      </TableCell>
    </TableRow>
  );
};

const getRowDetails = ({
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
