import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { APIResponseStatus } from 'shared/enums';

import { ClerkRegisterOrganizerDetails } from 'components/clerkRegister/ClerkRegisterOrganizerDetails';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';

export const ClerkOrganizerRegisterDetails: FC = () => {
  const { organizerRegistryStatus, organizerRegistry } = useAppSelector(
    clerkOrganizersSelector,
  );

  const dispatch = useAppDispatch();
  const params = useParams();

  const rows = organizerRegistry.map((organizer) => ({
    ...organizer.organizer,
    nimi: organizer?.organization?.nimi?.fi ?? '',
  }));

  const row = rows.find((organizer) => organizer.oid === params.oid);

  useEffect(() => {
    if (organizerRegistryStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizerRegistry());
    }
  }, [dispatch, organizerRegistryStatus]);

  if (!row) {
    return null;
  }

  return <ClerkRegisterOrganizerDetails row={row} />;
};
