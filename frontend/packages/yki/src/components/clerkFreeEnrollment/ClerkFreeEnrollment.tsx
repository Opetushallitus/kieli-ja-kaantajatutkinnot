import { useState } from 'react';

import { ClerkFreeEnrollmentListing } from 'components/clerkFreeEnrollment/listing/ClerkFreeEnrollmentListing';

const FreeEnrollmentTabs = () => {
  return <div>Free Enrollment Tabs Placeholder</div>;
};

export const ClerkFreeEnrollment = () => {
  const [page, setPage] = useState(1);

  return (
    <div>
      <FreeEnrollmentTabs />
      <ClerkFreeEnrollmentListing page={page} setPage={setPage} />
    </div>
  );
};
