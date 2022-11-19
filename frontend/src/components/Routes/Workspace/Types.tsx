export type CellRefs = React.MutableRefObject<(HTMLDivElement | null)[]>;
export type RefsFC = React.FC<React.PropsWithChildren<{ refs: CellRefs }>>;
