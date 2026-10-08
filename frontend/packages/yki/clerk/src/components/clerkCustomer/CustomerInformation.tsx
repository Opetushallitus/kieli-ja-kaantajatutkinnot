import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { CustomButton } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { EditCustomerInformationModal } from 'components/clerkCustomer/EditCustomerInformationModal';
import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { CustomerPerson } from 'interfaces/clerkCustomer';
import { RouteType } from 'interfaces/user';
import { Label } from 'ophTheme/Text';
import { resetCustomerContactUpdateStatus } from 'redux/reducers/clerkCustomerDetails';
import { loadNationalities } from 'redux/reducers/nationalities';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';
import { nationalitiesSelector } from 'redux/selectors/nationalities';

export const CustomerInformation = ({
  person,
  route,
}: {
  person: CustomerPerson | undefined;
  route: RouteType;
}) => {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const appLanguage = getCurrentLang();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });
  const { showToast } = useToast();
  const { nationalities, status } = useAppSelector(nationalitiesSelector);
  const { updateStatus } = useAppSelector(clerkCustomerDetailsSelector);
  const params = useParams();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (updateStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('details.toasts.updateSuccess'),
      });
      dispatch(resetCustomerContactUpdateStatus());
    } else if (updateStatus === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.updateError'),
      });
      dispatch(resetCustomerContactUpdateStatus());
    }
  }, [dispatch, showToast, t, updateStatus]);

  if (!person) return <></>;

  return (
    <>
      <div className="rows gapped customer-details">
        <div className="customer-details__fields">
          <Label>{t('details.fields.ssn')}</Label>
          <div>{person.ssn}</div>
          <Label>{t('details.fields.oid')}</Label>
          <div>{person.oid}</div>
          <Label>{t('details.fields.nationality')}</Label>
          <div>
            {
              nationalities.find(
                ({ code, language }) =>
                  code == person.nationalityCode && language == appLanguage,
              )?.name
            }
          </div>
          <Label>{t('details.fields.phoneNumber')}</Label>
          <div>{person.phoneNumber}</div>
          <Label>{t('details.fields.streetAddress')}</Label>
          <div>
            {[person.streetAddress, person.zip, person.postOffice]
              .filter((v) => !!v)
              .join(', ')}
          </div>
          <Label>{t('details.fields.email')}</Label>
          <div>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </div>
        </div>
      </div>
      <div className="rows gapped-xs">
        <CustomButton
          className="align-self-start"
          variant="outlined"
          onClick={() => setIsEditModalOpen(true)}
        >
          {t('details.buttons.editContact')}
        </CustomButton>
      </div>
      <EditCustomerInformationModal
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        person={person}
        route={route}
        organizerOid={params.oid ?? ''}
      />
    </>
  );
};
