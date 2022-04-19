import {
  TableCell,
  Checkbox,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { Box } from '@mui/system';

import { H2, H3, Text } from 'components/elements/Text';
import { PaginatedTable } from 'components/tables/Table';
import { ProgressIndicator } from 'components/elements/ProgressIndicator';
import { PublicTranslator } from 'interfaces/translator';
import { APIResponseStatus } from 'enums/api';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import {
  addPublicTranslatorFilterError,
  addSelectedTranslator,
  removeSelectedTranslator,
} from 'redux/actions/publicTranslator';
import { publicTranslatorsSelector } from 'redux/selectors/publicTranslator';
import { UIStates, Severity, SearchFilter } from 'enums/app';
import { displayUIState } from 'redux/actions/navigation';
import { showNotifierToast } from 'redux/actions/notifier';
import { Utils } from 'utils/index';

const getRowDetails = (
  translator: PublicTranslator,
  selected: boolean,
  toggleSelected: () => void
) => {
  return (
    <ListingRow
      translator={translator}
      selected={selected}
      toggleSelected={toggleSelected}
    />
  );
};

const ListingRow = ({
  translator,
  selected,
  toggleSelected,
}: {
  translator: PublicTranslator;
  selected: boolean;
  toggleSelected: () => void;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.publicTranslatorFilters',
  });

  // Redux
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const { fromLang, toLang } = filters;
  const { firstName, lastName, languagePairs, town, country } = translator;
  const townInfo = `${town}${country ? `, ${country}` : ''}`;
  const translateLanguage = useKoodistoLanguagesTranslation();

  const handleRowClick = () => {
    const langFields = [SearchFilter.FromLang, SearchFilter.ToLang];

    // Dispatch an error if the langpairs are not defined
    langFields.forEach((field) => {
      if (!filters[field] && !filters.errors?.includes(field))
        dispatch(addPublicTranslatorFilterError(field));
    });

    if (!fromLang || !toLang) {
      const toast = Utils.createNotifierToast(
        Severity.Error,
        t('toasts.selectLanguagePair')
      );
      dispatch(showNotifierToast(toast));
    } else {
      toggleSelected();
    }
  };

  return (
    <TableRow
      data-testid={`public-translators__id-${translator.id}-row`}
      selected={selected}
      onClick={handleRowClick}
    >
      <TableCell padding="checkbox">
        <Checkbox
          className="translator-listing__checkbox"
          checked={selected}
          color="secondary"
        />
      </TableCell>
      <TableCell>
        <Text>{`${lastName} ${firstName}`}</Text>
      </TableCell>
      <TableCell>
        {languagePairs.map(({ from, to }, k) => (
          <Text key={k}>
            {translateLanguage(from)}
            {` - `}
            {translateLanguage(to)}
          </Text>
        ))}
      </TableCell>
      <TableCell>
        <Text>{townInfo}</Text>
      </TableCell>
    </TableRow>
  );
};

const ListingHeader = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akt.pages.translator' });

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        <TableCell>
          <H3>{t('name')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('languagePairs')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('town')}</H3>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const ContactRequestButton = () => {
  const { selectedTranslators } = useAppSelector(publicTranslatorsSelector);
  const { t } = useAppTranslation({ keyPrefix: 'akt.pages.homepage' });
  const dispatch = useAppDispatch();

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => dispatch(displayUIState(UIStates.ContactRequest))}
      disabled={selectedTranslators.length == 0}
      data-testid="public-translators__contact-request-btn"
    >
      {t('requestContact')}
    </Button>
  );
};

const SelectedTranslatorsHeading = () => {
  const { selectedTranslators: selectedIndices } = useAppSelector(
    publicTranslatorsSelector
  );

  const { t } = useAppTranslation({ keyPrefix: 'akt.component.table' });

  const selected = selectedIndices.length;

  return (
    <H2 data-testid="public-translators__selected-count-heading">
      {selected > 0 ? `${selected} ${t('selectedItems')}` : t('title')}
    </H2>
  );
};

export const PublicTranslatorListing = ({
  status,
  translators,
}: {
  status: APIResponseStatus;
  translators: Array<PublicTranslator>;
}) => {
  const { t } = useAppTranslation({ keyPrefix: 'akt' });
  const { selectedTranslators } = useAppSelector(publicTranslatorsSelector);

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <ProgressIndicator color="secondary" />;
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H3>{t('errors.loadingFailed')}</H3>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <div className="columns">
            <div className="grow">
              <SelectedTranslatorsHeading />
            </div>
            <ContactRequestButton />
          </div>
          <PaginatedTable
            className="translator-listing"
            selectedIndices={selectedTranslators}
            addSelectedIndex={addSelectedTranslator}
            removeSelectedIndex={removeSelectedTranslator}
            data={translators}
            header={<ListingHeader />}
            getRowDetails={getRowDetails}
            initialRowsPerPage={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </>
      );
  }
};
