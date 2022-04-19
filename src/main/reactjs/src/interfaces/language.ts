export interface LanguagePairsDict {
  from: Array<string>;
  to: Array<string>;
}

export interface PublicLanguagePair {
  from: string;
  to: string;
}

export interface ClerkLanguagePair extends PublicLanguagePair {
  permissionToPublish: boolean;
}
