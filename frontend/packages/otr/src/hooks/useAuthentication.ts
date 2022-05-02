// import { useEffect } from 'react';

// import { useAppDispatch, useAppSelector } from 'configs/redux';
// import { APIResponseStatus } from 'enums/api';
// import { AppRoutes } from 'enums/app';
// import { loadClerkUser } from 'redux/actions/clerkUser';
// import { clerkUserSelector } from 'redux/selectors/clerkUser';

// export const useAuthentication = () => {
//   // Redux
//   const dispatch = useAppDispatch();
//   const clerkUser = useAppSelector(clerkUserSelector);

//   useEffect(() => {
//     const activeURL = window.location.href;
//     const clerkURL = AppRoutes.ClerkHomePage;

//     if (clerkUser.status === APIResponseStatus.NotStarted) {
//       if (activeURL.includes(clerkURL)) {
//         dispatch(loadClerkUser);
//       }
//     }
//   }, [clerkUser.status, dispatch]);

//   return [clerkUser.isAuthenticated, clerkUser];
// };
