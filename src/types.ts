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
};