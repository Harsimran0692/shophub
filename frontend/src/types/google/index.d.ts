// declare module 'google' {
//   interface GoogleAccounts {
//     id: {
//       initialize: (config: {
//         client_id: string;
//         callback: (response: { credential: string; select_by: string }) => void;
//       }) => void;
//       renderButton: (
//         element: HTMLElement,
//         options: {
//           theme?: string;
//           size?: string;
//           text?: string;
//           shape?: string;
//           width?: number;
//         }
//       ) => void;
//       prompt: () => void;
//       revoke: (email: string, callback: () => void) => void;
//     };
//   }

//   const google: GoogleAccounts;
//   export default google;
// }
