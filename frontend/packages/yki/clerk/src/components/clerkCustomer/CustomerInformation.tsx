import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CustomButton } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { EditCustomerInformationModal } from 'components/clerkCustomer/EditCustomerInformationModal';
import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { CustomerPerson } from 'interfaces/clerkCustomer';
import { Label } from 'ophTheme/Text';
import { resetCustomerContactUpdateStatus } from 'redux/reducers/clerkCustomerDetails';
import { loadNationalities } from 'redux/reducers/nationalities';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';
import { nationalitiesSelector } from 'redux/selectors/nationalities';

export const CustomerInformation = ({
  person,
}: {
  person: CustomerPerson | undefined;
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
        <div className="columns gapped-xxl align-items-start">
          <div className="rows gapped-xs">
            <Label>{t('details.fields.ssn')}</Label>
            <Label>{t('details.fields.oid')}</Label>
            <Label>{t('details.fields.nationality')}</Label>
            <Label>{t('details.fields.phoneNumber')}</Label>
            <Label>{t('details.fields.streetAddress')}</Label>
            <Label>{t('details.fields.email')}</Label>
          </div>
          <div className="rows gapped-xs">
            <div>{person.ssn}</div>
            <div>{person.oid}</div>
            <div>
              {
                nationalities.find(
                  ({ code, language }) =>
                    code == person.nationalityCode && language == appLanguage,
                )?.name
              }
            </div>
            <div>{person.phoneNumber}</div>
            <div>
              {[person.streetAddress, person.zip, person.postOffice]
                .filter((v) => !!v)
                .join(', ')}
            </div>
            <div>
              <a href={`mailto:${person.email}`}>{person.email}</a>
            </div>
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
      />
    </>
  );
};
