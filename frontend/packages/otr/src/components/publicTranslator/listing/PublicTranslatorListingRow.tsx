import { Checkbox, TableCell, TableRow } from '@mui/material';
import { H2, H3, Text } from 'shared/components';
import { Color, Severity } from 'shared/enums';

import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { SearchFilter } from 'enums/app';
import { useWindowProperties } from 'hooks/useWindowProperties';
import { PublicTranslator } from 'interfaces/publicTranslator';
import { showNotifierToast } from 'redux/actions/notifier';
import {
  addPublicTranslatorFilterError,
  addSelectedTranslator,
  removeSelectedTranslator,
} from 'redux/actions/publicTranslator';
import {
  publicTranslatorsSelector,
  selectFilteredPublicSelectedIds,
} from 'redux/selectors/publicTranslator';
import { NotifierUtils } from 'utils/notifier';

export const PublicTranslatorListingRow = ({
  translator,
}: {
  translator: PublicTranslator;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr',
  });

  // Redux
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const filteredSelectedIds = useAppSelector(selectFilteredPublicSelectedIds);
  const selected = filteredSelectedIds.includes(translator.id);

  const { fromLang, toLang } = filters;
  const { firstName, lastName, languages, regions } = translator;

  const { isPhone } = useWindowProperties();
  const translateLanguage = useKoodistoLanguagesTranslation();

  const checkboxAriaLabel = selected
    ? t('component.table.accessibility.checkboxSelectedAriaLabel')
    : t('component.table.accessibility.checkboxUnselectedAriaLabel');

  const handleRowClick = () => {
    const langFields = [SearchFilter.FromLang, SearchFilter.ToLang];

    // Dispatch an error if the language pairs are not defined
    langFields.forEach((field) => {
      if (!filters[field] && !filters.errors?.includes(field))
        dispatch(addPublicTranslatorFilterError(field));
    });

    if (!fromLang || !toLang) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Error,
        t(
          'component.publicTranslatorFilters.toasts.contactRequestNeedsLanguagePairs'
        )
      );
      dispatch(showNotifierToast(toast));
    } else {
      if (selected) {
        dispatch(removeSelectedTranslator(translator.id));
      } else {
        dispatch(addSelectedTranslator(translator.id));
      }
    }
  };

  const getRegionsDescription = (regions: Array<string>) => {
    if (regions.length > 0) {
      return regions.join(', ');
    }

    return t('component.publicInterpreterListing.wholeFinland');
  };

  const renderPhoneTableCells = () => (
    <TableCell>
      <div className="rows gapped">
        <H2>{`${lastName} ${firstName}`}</H2>
        <div className="columns gapped space-between">
          <div className="rows gapped">
            <div>
              <H3>{t('pages.translator.languagePairs')}</H3>
              {languages.map(({ from, to }, k) => (
                <Text key={k}>
                  {translateLanguage(from)}
                  {` - `}
                  {translateLanguage(to)}
                </Text>
              ))}
            </div>
            <div>
              <H3>{t('pages.translator.town')}</H3>
              <Text>{getRegionsDescription(regions)}</Text>
            </div>
          </div>
          <Checkbox
            className="public-translator-listing__checkbox"
            checked={selected}
            color={Color.Secondary}
            inputProps={{
              'aria-label': checkboxAriaLabel,
            }}
          />
        </div>
      </div>
    </TableCell>
  );

  const renderDesktopTableCells = () => (
    <>
      <TableCell>
        <Text>{`${lastName} ${firstName}`}</Text>
      </TableCell>
      <TableCell>
        {languages.map(({ from, to }, k) => (
          <Text key={k}>
            {translateLanguage(from)}
            {` - `}
            {translateLanguage(to)}
          </Text>
        ))}
      </TableCell>
      <TableCell>
        <Text>{getRegionsDescription(regions)}</Text>
      </TableCell>
    </>
  );

  return (
    <TableRow
      data-testid={`public-translators__id-${translator.id}-row`}
      selected={selected}
      onClick={handleRowClick}
    >
      {isPhone ? renderPhoneTableCells() : renderDesktopTableCells()}
    </TableRow>
  );
};
