export type SelectionProps = {
  selection: Set<string>;
  setSelection?: (
    newSelection: Set<string> | ((oldSelection: Set<string>) => Set<string>),
  ) => void;
};
