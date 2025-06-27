import { useState } from 'react';

import { ClerkRegisterListing } from 'components/clerkRegister/listing/ClerkRegisterListing';

export const ClerkRegister = () => {
  const [page, setPage] = useState(0);

  return <ClerkRegisterListing page={page} setPage={setPage} />;
};
