import { Checkbox, TableCell, TableRow } from '@mui/material';
import { useCallback } from 'react';
import { H2, H3, Text } from 'shared/components';
import { Color, Severity } from 'shared/enums';
import { useToast, useWindowProperties } from 'shared/hooks';

import {
  useAppTranslation,
  useKoodistoCountriesTranslation,
  useKoodistoLanguagesTranslation,
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
}: {
  translator: PublicTranslator;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr',
  });

  // Redux
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(publicTranslatorsSelector);
  const filteredSelectedIds = useAppSelector(selectFilteredPublicSelectedIds);
  const selected = filteredSelectedIds.includes(translator.id);

  const { fromLang, toLang } = filters;
  const { firstName, lastName, languagePairs, town, country } = translator;

  const { showToast } = useToast();

  const { isPhone } = useWindowProperties();
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCountry = useKoodistoCountriesTranslation();

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

  const getLanguagePairs = useCallback(() => {
    return languagePairs.map(({ from, to }, k) => {
      const className =
        fromLang && toLang && fromLang === from && toLang === to
          ? 'padding-unset bold'
          : '';

      return (
        <Text className={className} key={k}>
          {`${translateLanguage(from)} - ${translateLanguage(to)}`}
        </Text>
      );
    });
  }, [languagePairs, fromLang, toLang, translateLanguage]);

  const getTownDescription = (town?: string, country?: string) => {
    if (town && country) {
      return `${town} (${translateCountry(country)})`;
    } else if (town) {
      return town;
    } else if (country) {
      return translateCountry(country);
    }

    return '-';
  };

  const renderPhoneTableCells = () => (
    <TableCell>
      <div className="rows gapped">
        <H2>{`${lastName} ${firstName}`}</H2>
        <div className="columns gapped space-between">
          <div className="rows gapped">
            <div>
              <H3>{t('pages.translator.languagePairs')}</H3>
              {getLanguagePairs()}
            </div>
            <div>
              <H3>{t('pages.translator.town')}</H3>
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
      <TableCell>{getLanguagePairs()}</TableCell>
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
