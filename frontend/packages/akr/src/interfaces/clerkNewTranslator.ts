import { ClerkTranslator } from 'interfaces/clerkTranslator';

export type ClerkNewTranslator = Omit<ClerkTranslator, 'id' | 'version'>;
