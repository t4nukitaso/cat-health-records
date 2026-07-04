export type RecordItem = {
  id: number;

  firebaseId?: string;

  type:
    | "food"
    | "snack"
    | "poop"
    | "weight";

  amount?: number;

  snackType?: string;

  customSnackName?: string;

  weight?: number;

  createdAt: string;

  memo?: string;
};

export type DailyNote = {
  firebaseId?: string;

  date: string;

  note: string;
};