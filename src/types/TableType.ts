export type SortDirection = "asc" | "desc";
export type SortKey = keyof File | null;

export type SortConfig = {
  key: SortKey;
  direction: SortDirection;
};
