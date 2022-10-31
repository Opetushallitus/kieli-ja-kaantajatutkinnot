import { AutocompleteValue, ComboBox, H3 } from 'shared/components';
import { TextFieldVariant } from 'shared/enums';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { TranslatorEmailStatusEnum } from 'enums/clerkTranslator';
import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';
import {
  addClerkTranslatorFilter,
  setPage,
} from 'redux/reducers/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorEmailFilter = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorFilters',
  });
  const translateCommon = useCommonTranslation();
  const { filters } = useAppSelector(clerkTranslatorsSelector);
  const dispatch = useAppDispatch();

  const handleFilterChange =
    (filter: keyof ClerkTranslatorFilter) =>
    ({}, value: AutocompleteValue) => {
      dispatch(addClerkTranslatorFilter({ [filter]: value?.value }));
      dispatch(setPage(0));
    };

  const getEmailStateSelectValues = () =>
    Object.values(TranslatorEmailStatusEnum).map((v) => ({
      value: v,
      label: translateCommon(v),
    }));

  const getEmailStateValue = () =>
    filters.emailStatus
      ? {
          value: filters.emailStatus,
          label: translateCommon(filters.emailStatus),
        }
      : null;

  return (
    <div className="clerk-translator-email-filter gapped">
      <div className="rows gapped-xs">
        <H3>{t('emailState.title')}</H3>
        <ComboBox
          autoHighlight
          data-testid="clerk-translator-filters__email-basis"
          label={t('emailState.placeholder')}
          values={getEmailStateSelectValues()}
          value={getEmailStateValue()}
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('emailStatus')}
        />
      </div>
    </div>
  );
};
