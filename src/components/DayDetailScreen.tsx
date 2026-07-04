import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import type {
  DailyNote,
  RecordItem,
} from "../types";

type Props = {
  records: RecordItem[];

  dailyNotes: DailyNote[];

  addRecord: (
    record: RecordItem
  ) => Promise<void>;

  deleteRecord: (
    firebaseId: string
  ) => Promise<void>;

  editRecord: (
    firebaseId: string,
    data: Partial<RecordItem>
  ) => Promise<void>;

  saveDailyNote: (
    date: string,
    note: string
  ) => Promise<void>;
};

function DayDetailScreen({
  records,
  dailyNotes,
  addRecord,
  deleteRecord,
  editRecord,
  saveDailyNote,
}: Props) {
  const { date } =
    useParams();

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [editTime, setEditTime] =
    useState("");

  const [currentNoteText, setCurrentNoteText] =
    useState("");

  const [isEditingNote, setIsEditingNote] =
    useState(false);

  const [showFoodSelect, setShowFoodSelect] =
    useState(false);

  const [showSnackSelect, setShowSnackSelect] =
    useState(false);

  const [selectedSnack, setSelectedSnack] =
    useState("ちゅーる");

  const [selectedSnackAmount, setSelectedSnackAmount] =
    useState<number | null>(null);

  const [customSnackName, setCustomSnackName] =
    useState("");

  useEffect(() => {
    const noteForDate =
      dailyNotes.find(
        (note) =>
          note.date === date
      );

    setCurrentNoteText(
      noteForDate?.note || ""
    );
  }, [dailyNotes, date]);

  function formatLocalDate(
    date: Date
  ) {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const targetRecords =
    useMemo(() => {
      return records
        .filter((record) => {
          return (
            formatLocalDate(
              new Date(
                record.createdAt
              )
            ) === date
          );
        })
        .sort(
          (a, b) =>
            new Date(
              a.createdAt
            ).getTime() -
            new Date(
              b.createdAt
            ).getTime()
        );
    }, [records, date]);

  const foodTotal =
    targetRecords
      .filter(
        (r) =>
          r.type === "food"
      )
      .reduce(
        (sum, r) =>
          sum +
          (r.amount || 0),
        0
      );

  const snackTotal =
    targetRecords
      .filter(
        (r) =>
          r.type === "snack"
      )
      .reduce(
        (sum, r) =>
          sum +
          (r.amount || 0),
        0
      );

  const poopCount =
    targetRecords.filter(
      (r) =>
        r.type === "poop"
    ).length;

  const latestWeight =
    targetRecords.find(
      (r) =>
        r.type === "weight"
    );

  function startEdit(
    record: RecordItem
  ) {
    setEditingId(record.id);

    if (
      record.type === "weight"
    ) {
      setEditAmount(
        String(
          record.weight || ""
        )
      );
    } else {
      setEditAmount(
        String(
          record.amount || ""
        )
      );
    }

    const recordDate =
      new Date(
        record.createdAt
      );

    const hours = String(
      recordDate.getHours()
    ).padStart(2, "0");

    const minutes = String(
      recordDate.getMinutes()
    ).padStart(2, "0");

    setEditTime(
      `${hours}:${minutes}`
    );
  }

  async function saveEdit(
    record: RecordItem
  ) {
    if (!record.firebaseId)
      return;

    const updatedData: Partial<RecordItem> =
      {};

    if (record.type === "weight") {
      updatedData.weight =
        Number(editAmount);
    } else if (
      record.type === "food" ||
      record.type === "snack"
    ) {
      updatedData.amount =
        Number(editAmount);
    }

    const [
      year,
      month,
      day,
    ] = date!
      .split("-")
      .map(Number);

    const [
      hours,
      minutes,
    ] = editTime
      .split(":")
      .map(Number);

    const newCreatedAt =
      new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
      ).toISOString();

    updatedData.createdAt =
      newCreatedAt;

    await editRecord(
      record.firebaseId,
      updatedData
    );

    setEditingId(null);

    setEditAmount("");

    setEditTime("");
  }

  function createRecordId() {
    return Date.now();
  }

  function createSelectedDateISO() {
    const now = new Date();

    const [
      year,
      month,
      day,
    ] = date!
      .split("-")
      .map(Number);

    return new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes()
    ).toISOString();
  }

  async function addFood(
    amount: number
  ) {
    try {
      await addRecord({
        id: createRecordId(),
        type: "food",
        amount,
        createdAt:
          createSelectedDateISO(),
      });

      setShowFoodSelect(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function addSnack() {
    try {
      if (selectedSnackAmount === null) {
        alert("数量を選択してください");
        return;
      }

      if (
        selectedSnack === "その他" &&
        !customSnackName.trim()
      ) {
        alert(
          "おやつ名を入力してください"
        );
        return;
      }

      await addRecord({
        id: createRecordId(),
        type: "snack",
        amount: selectedSnackAmount,
        snackType: selectedSnack,
        customSnackName:
          selectedSnack === "その他"
            ? customSnackName.trim()
            : "",
        createdAt:
          createSelectedDateISO(),
      });

      setSelectedSnack("ちゅーる");
      setSelectedSnackAmount(null);
      setCustomSnackName("");
      setShowSnackSelect(false);
    } catch (error) {
      console.error(
        "おやつ保存エラー",
        error
      );
    }
  }

  async function addPoop() {
    try {
      await addRecord({
        id: createRecordId(),
        type: "poop",
        createdAt:
          createSelectedDateISO(),
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-sm rounded-[36px] bg-white p-5 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/calendar"
            className="rounded-2xl bg-gray-200 px-4 py-2 active:scale-95"
          >
            戻る
          </Link>

          <h1 className="text-lg font-bold">
            {date}
          </h1>

          <div className="w-[70px]" />
        </div>

        <div className="rounded-3xl bg-gray-100 p-5 shadow-sm">
          <div className="space-y-3">
            <p className="text-lg font-bold">
              🥩 ごはん：
              {foodTotal}
            </p>

            <p className="text-lg font-bold">
              🍦 おやつ：
              {snackTotal}
            </p>

            <p className="text-lg font-bold">
              💩 うんち：
              {poopCount}回
            </p>

            <p className="text-lg font-bold">
              ⚖️ 体重：
              {latestWeight?.weight ??
                "--"}
              kg
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-gray-100 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              メモ📝
            </h2>

            <button
              onClick={() =>
                setIsEditingNote(
                  !isEditingNote
                )
              }
              className="rounded-2xl bg-gray-200 px-4 py-2 active:scale-95"
            >
              {isEditingNote
                ? "閉じる"
                : "編集"}
            </button>
          </div>

          {isEditingNote ? (
            <div className="space-y-3">
              <textarea
                className="h-32 w-full resize-none rounded-2xl border p-3"
                value={
                  currentNoteText
                }
                onChange={(e) =>
                  setCurrentNoteText(
                    e.target.value
                  )
                }
              />

              <button
                onClick={async () => {
                  await saveDailyNote(
                    date!,
                    currentNoteText
                  );

                  setIsEditingNote(
                    false
                  );
                }}
                className="w-full rounded-2xl bg-blue-500 py-3 text-white active:scale-95"
              >
                メモ保存
              </button>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700">
              {currentNoteText ||
                "メモはありません"}
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              setShowFoodSelect(
                !showFoodSelect
              );
              setShowSnackSelect(false);
            }}
            className="rounded-2xl bg-blue-500 p-4 text-white shadow-md active:scale-95"
          >
            ごはん
          </button>

          <button
            onClick={() => {
              setShowSnackSelect(
                !showSnackSelect
              );
              setShowFoodSelect(false);
            }}
            className="rounded-2xl bg-pink-500 p-4 text-white shadow-md active:scale-95"
          >
            おやつ
          </button>

          <button
            onClick={addPoop}
            className="rounded-2xl bg-green-500 p-4 text-white shadow-md active:scale-95"
          >
            うんち
          </button>
        </div>

        {showFoodSelect && (
          <div className="mt-4 rounded-3xl bg-gray-100 p-4">
            <h2 className="font-bold">
              ごはん量選択
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[0.5, 1, 1.5, 2].map(
                (amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      addFood(amount)
                    }
                    className="rounded-2xl bg-blue-500 p-4 text-white active:scale-95"
                  >
                    {amount}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {showSnackSelect && (
          <div className="mt-4 rounded-3xl bg-gray-100 p-4">
            <h2 className="font-bold">
              おやつ選択
            </h2>

            <div className="mt-4 space-y-2">
              {[
                "ちゅーる",
                "ぽんちゅーる",
                "その他",
              ].map((snack) => (
                <button
                  key={snack}
                  onClick={() =>
                    setSelectedSnack(
                      snack
                    )
                  }
                  className={`w-full rounded-2xl p-4 text-white active:scale-95 ${
                    selectedSnack === snack
                      ? "bg-pink-600"
                      : "bg-pink-400"
                  }`}
                >
                  {snack}
                </button>
              ))}
            </div>

            {selectedSnack === "その他" && (
              <input
                type="text"
                placeholder="おやつ名入力"
                value={customSnackName}
                onChange={(e) =>
                  setCustomSnackName(
                    e.target.value
                  )
                }
                className="mt-4 w-full rounded-2xl border p-4"
              />
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[0.5, 1].map((amount) => (
                <button
                  key={amount}
                  onClick={() =>
                    setSelectedSnackAmount(
                      amount
                    )
                  }
                  className={`rounded-2xl p-4 text-white active:scale-95 ${
                    selectedSnackAmount ===
                    amount
                      ? "bg-pink-600"
                      : "bg-pink-400"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            <button
              onClick={addSnack}
              className="mt-4 w-full rounded-2xl bg-pink-500 p-4 text-white active:scale-95"
            >
              記録
            </button>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {targetRecords.map(
            (record) => {
              const time =
                new Date(
                  record.createdAt
                ).toLocaleTimeString(
                  "ja-JP",
                  {
                    hour:
                      "2-digit",
                    minute:
                      "2-digit",
                  }
                );

              return (
                <div
                  key={record.id}
                  className="rounded-3xl bg-gray-100 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">
                        {record.type ===
                          "food" &&
                          `🥩 ごはん ${record.amount}`}

                        {record.type ===
                          "snack" &&
                          `🍦 ${
                            record.snackType ===
                            "その他"
                              ? record.customSnackName
                              : record.snackType
                          } ${
                            record.amount
                          }`}

                        {record.type ===
                          "poop" &&
                          "💩 うんち"}

                        {record.type ===
                          "weight" &&
                          `⚖️ ${record.weight}kg`}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {time}
                      </p>
                    </div>

                    {record.firebaseId && (
                      <button
                        onClick={() =>
                          deleteRecord(
                            record.firebaseId!
                          )
                        }
                        className="rounded-2xl bg-red-500 px-4 py-2 text-white active:scale-95"
                      >
                        削除
                      </button>
                    )}
                  </div>

                  {(record.type ===
                    "food" ||
                    record.type ===
                      "snack" ||
                    record.type ===
                      "poop" ||
                    record.type ===
                      "weight") && (
                    <div className="mt-4">
                      {editingId ===
                      record.id ? (
                        <div className="space-y-3">
                          {record.type !==
                            "poop" && (
                            <input
                              type="number"
                              step="0.1"
                              value={
                                editAmount
                              }
                              onChange={(
                                e
                              ) =>
                                setEditAmount(
                                  e.target
                                    .value
                                )
                              }
                              className="w-full rounded-2xl border p-3"
                            />
                          )}

                          <input
                            type="time"
                            value={
                              editTime
                            }
                            onChange={(
                              e
                            ) =>
                              setEditTime(
                                e.target
                                  .value
                              )
                            }
                            className="w-full rounded-2xl border p-3"
                          />

                          <button
                            onClick={() =>
                              saveEdit(
                                record
                              )
                            }
                            className="w-full rounded-2xl bg-blue-500 py-3 text-white active:scale-95"
                          >
                            保存
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit(
                              record
                            )
                          }
                          className="mt-3 rounded-2xl bg-gray-200 px-4 py-2 active:scale-95"
                        >
                          編集
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default DayDetailScreen;
