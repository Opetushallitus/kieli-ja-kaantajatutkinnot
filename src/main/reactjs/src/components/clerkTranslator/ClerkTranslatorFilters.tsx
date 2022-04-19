import { TextField, Button } from '@mui/material';

import { H3 } from 'components/elements/Text';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { Variant } from 'enums/app';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import {
  addClerkTranslatorFilter,
  resetClerkTranslatorFilters,
} from 'redux/actions/clerkTranslator';
import {
  clerkTranslatorsSelector,
  selectTranslatorsByAuthorisationStatus,
} from 'redux/selectors/clerkTranslator';

export const RegisterControls = () => {
  const { authorised, expiring, expired } = useAppSelector(
    selectTranslatorsByAuthorisationStatus
  );
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorFilters.authorisationStatus',
  });
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(clerkTranslatorsSelector);
  const filterByAuthorisationStatus = (status: AuthorisationStatus) => {
    dispatch(
      addClerkTranslatorFilter({ ...filters, authorisationStatus: status })
    );
  };
  const variantForStatus = (status: AuthorisationStatus) => {
    return status === filters.authorisationStatus
      ? Variant.Contained
      : Variant.Outlined;
  };

  const countsForStatuses = [
    { status: AuthorisationStatus.Authorised, count: authorised.length },
    { status: AuthorisationStatus.Expiring, count: expiring.length },
    { status: AuthorisationStatus.Expired, count: expired.length },
  ];

  return (
    <>
      {countsForStatuses.map(({ count, status }, i) => (
        <Button
          key={i}
          color="secondary"
          variant={variantForStatus(status)}
          onClick={() => filterByAuthorisationStatus(status)}
        >
          <div className="columns gapped">
            <div className="grow">{t(status)}</div>
            <div>{`(${count})`}</div>
          </div>
        </Button>
      ))}
    </>
  );
};

export const ListingFilters = () => {
  const dispatch = useAppDispatch();
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorFilters',
  });

  return (
    <div className="columns gapped">
      <div className="rows">
        <H3>{t('languagePair.title')}</H3>
        <div className="columns gapped">
          <TextField placeholder={t('languagePair.fromPlaceholder')} />
          <TextField placeholder={t('languagePair.toPlaceholder')} />
        </div>
      </div>
      <div className="rows">
        <H3>{t('name.title')}</H3>
        <TextField placeholder={t('name.placeholder')} />
      </div>
      <div className="rows">
        <H3>{t('town.title')}</H3>
        <TextField placeholder={t('town.placeholder')} />
      </div>
      <div className="grow" />
      <div className="rows">
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => dispatch(resetClerkTranslatorFilters)}
        >
          {t('buttons.empty')}
        </Button>
      </div>
    </div>
  );
};
