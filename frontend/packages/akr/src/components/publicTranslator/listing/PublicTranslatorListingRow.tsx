import { Checkbox, TableCell, TableRow, Typography } from '@mui/material';
import { Text } from 'shared/components';
import { Color, Severity } from 'shared/enums';
import { useToast, useWindowProperties } from 'shared/hooks';

import { PublicTranslatorListingRowLanguagePairs } from 'components/publicTranslator/listing/PublicTranslatorListingRowLanguagePairs';
import {
  isCurrentLangSv,
  useAppTranslation,
  useKoodistoCountriesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { SearchFilter } from 'enums/app';
import { PublicTranslator } from 'interfaces/publicTranslator';
import {
  addPublicTranslatorFilterError,
  deselectPublicTranslator,
  selectPublicTranslator,
} from 'redux/reducers/publicTranslator';
import {
  publicTranslatorsSelector,
  selectFilteredPublicSelectedIds,
} from 'redux/selectors/publicTranslator';

export const PublicTranslatorListingRow = ({
  translator,
  townToSv,
}: {
  translator: PublicTranslator;
  townToSv: Map<string, string>;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr',
  });
  const translateCountry = useKoodistoCountriesTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const filteredSelectedIds = useAppSelector(selectFilteredPublicSelectedIds);
  const selected = filteredSelectedIds.includes(translator.id);

  const { fromLang, toLang } = filters;
  const { firstName, lastName, languagePairs, town, country } = translator;

  const { showToast } = useToast();
  const { isPhone } = useWindowProperties();

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
      showToast({
        severity: Severity.Error,
        description: t(
          'component.publicTranslatorFilters.toasts.contactRequestNeedsLanguagePairs'
        ),
      });
    } else {
      if (selected) {
        dispatch(deselectPublicTranslator(translator.id));
      } else {
        dispatch(selectPublicTranslator(translator.id));
      }
    }
  };

  const getTownDescription = (town?: string, country?: string) => {
    if (town && country) {
      const t = isCurrentLangSv() ? townToSv.get(town) || town : town;

      return `${t} (${translateCountry(country)})`;
    } else if (town) {
      return isCurrentLangSv() ? townToSv.get(town) || town : town;
    } else if (country) {
      return translateCountry(country);
    }

    return '-';
  };

  const renderPhoneTableCells = () => (
    <TableCell>
      <div className="rows gapped">
        <Typography variant="h2" component="p">
          {`${lastName} ${firstName}`}
        </Typography>
        <div className="columns gapped space-between">
          <div className="rows gapped">
            <div>
              <Typography variant="h3" component="p">
                {t('pages.translator.languagePairs')}
              </Typography>
              <PublicTranslatorListingRowLanguagePairs
                fromLang={fromLang}
                toLang={toLang}
                languagePairs={languagePairs}
              />
            </div>
            <div>
              <Typography variant="h3" component="p">
                {t('pages.translator.town')}
              </Typography>
              <Text>{getTownDescription(town, country)}</Text>
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
      <TableCell padding="checkbox">
        <Checkbox
          className="public-translator-listing__checkbox"
          checked={selected}
          color={Color.Secondary}
          inputProps={{
            'aria-label': checkboxAriaLabel,
          }}
        />
      </TableCell>
      <TableCell>
        <Text>{`${lastName} ${firstName}`}</Text>
      </TableCell>
      <TableCell>
        <PublicTranslatorListingRowLanguagePairs
          fromLang={fromLang}
          toLang={toLang}
          languagePairs={languagePairs}
        />
      </TableCell>
      <TableCell>
        <Text>{getTownDescription(town, country)}</Text>
      </TableCell>
    </>
  );

  return (
    <TableRow
      className="cursor-pointer"
      data-testid={`public-translators__id-${translator.id}-row`}
      onClick={handleRowClick}
      selected={selected}
    >
      {isPhone ? renderPhoneTableCells() : renderDesktopTableCells()}
    </TableRow>
  );
};
