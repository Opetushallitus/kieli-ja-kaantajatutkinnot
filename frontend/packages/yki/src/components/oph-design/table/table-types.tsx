export type KeysMatching<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];

export type ListTableColumn<R extends Row> = {
  // Sarakkeen otsikko
  title?: string;
  // Sarakkeen avain. Käytetään Reactin key-attribuuttina sekä järjestettäessä kentän tunnisteena. Järjestettäessä tulee siis olla polku Row-olioon.
  key: string;
  // Funktio, joka renderöi solun sisällön.
  render: (props: R) => React.ReactNode;
  // Tavallisen (ei-otsikkosolu) tyylimäärittelyt
  style?: React.CSSProperties;
  // Onko taulukko järjestettävissä sarakkeen arvojen mukaan?
  sortable?: boolean;
};

export type Row<K extends string = string> = Record<K, unknown>;
