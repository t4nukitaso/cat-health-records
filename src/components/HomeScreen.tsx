import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import type {
  DailyNote,
  RecordItem,
} from "../types";

import {
  getRelativeTime,
  isToday,
  createNowISO,
} from "../utils";

function createRecordId() {
  return Date.now();
}

type Props = {
  records: RecordItem[];

  dailyNotes: DailyNote[];

  addRecord: (
    record: RecordItem
  ) => Promise<void>;

  deleteRecord: (
    firebaseId: string
  ) => Promise<void>;

  saveDailyNote: (
    date: string,
    note: string
  ) => Promise<void>;
};

function HomeScreen({
  records,
  dailyNotes,
  addRecord,
  deleteRecord,
  saveDailyNote,
}: Props) {
  const [showFoodSelect, setShowFoodSelect] =
    useState(false);

  const [showSnackSelect, setShowSnackSelect] =
    useState(false);

  const [showWeightInput, setShowWeightInput] =
    useState(false);

  const [selectedSnack, setSelectedSnack] =
    useState("ちゅーる");

  const [selectedSnackAmount, setSelectedSnackAmount] = useState<number | null>(null);

  const [customSnackName, setCustomSnackName] =
    useState("");

  const [weightInput, setWeightInput] =
    useState("");

  const [noteInput, setNoteInput] =
    useState("");

  const [showNoteInput, setShowNoteInput] =
    useState(false);

  const [currentEditingNote, setCurrentEditingNote] =
    useState("");

  

  function getTodayDate() {
    const now = new Date();

    const year =
      now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const today =
      getTodayDate();

    const existingNote =
      dailyNotes.find(
        (note) =>
          note.date === today
      );

    setNoteInput(
      existingNote?.note || ""
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentEditingNote(existingNote?.note || "");
  }, [dailyNotes, getTodayDate]);

  

  const todayRecords = records.filter((r) =>
    isToday(r.createdAt)
  );

  const foodTotal = useMemo(() => {
    return todayRecords
      .filter((r) => r.type === "food")
      .reduce(
        (sum, r) =>
          sum + (r.amount || 0),
        0
      );
  }, [todayRecords]);

  async function addFood(
    amount: number
  ) {
    try {
      await addRecord({
        id: createRecordId(),
        type: "food",
        amount,
        createdAt: createNowISO(),
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

      const newRecord: RecordItem = {
        id: createRecordId(),

        type: "snack",
        amount: selectedSnackAmount,
        snackType: selectedSnack,

        customSnackName:
          selectedSnack === "その他"
            ? customSnackName.trim()
            : "",

        createdAt: createNowISO(),
      };

      console.log(
        "snack record",
        newRecord
      );

      await addRecord(newRecord);

      setSelectedSnack("ちゅーる");

      setCustomSnackName("");

      setSelectedSnackAmount(null);

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
        createdAt: createNowISO(),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function addWeight() {
    try {
      if (!weightInput) {
        alert("体重を入力してください");
        return;
      }
      const weight = parseFloat(weightInput);
      if (isNaN(weight) || weight <= 0) {
        alert("有効な体重を入力してください");
        return;
      }
      await addRecord({
        id: createRecordId(),
        type: "weight",
        weight: weight,
        createdAt: createNowISO(),
      });
      setWeightInput("");
      setShowWeightInput(false);
    } catch (error) {
      console.error("体重保存エラー", error);
    }
  }

  const snackTotal = useMemo(() => {
    return todayRecords
      .filter((r) => r.type === "snack")
      .reduce(
        (sum, r) =>
          sum + (r.amount || 0),
        0
      );
  }, [todayRecords]);

  const poopCount = useMemo(() => {
    return todayRecords.filter(
      (r) => r.type === "poop"
    ).length;
  }, [todayRecords]);

  const latestWeight = records.find(
    (r) => r.type === "weight"
  );

  const lastFood = records.find(
    (r) => r.type === "food"
  );

  const lastPoop = records.find(
    (r) => r.type === "poop"
  );

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="mx-auto max-w-md rounded-[40px] bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <Link
            to="/calendar"
            className="rounded-3xl bg-gray-200 px-6 py-4 text-lg font-bold active:scale-95"
          >
            カレンダー
          </Link>

          <h1 className="text-6xl">🐈</h1>

          <div className="w-[120px]" />
        </div>

        <p className="mt-5 text-center text-base text-gray-500">
          {new Date().toLocaleString(
            "ja-JP"
          )}
        </p>

        <div className="mt-7 rounded-3xl bg-gray-100 p-6">
          <div className="space-y-4">
            <p className="text-xl font-bold">
              今日のごはん🥩：
              {foodTotal}
            </p>

            <p className="text-xl font-bold">
              今日のおやつ🍦：
              {snackTotal}
            </p>

            <p className="text-xl font-bold">
              今日のうんち💩：
              {poopCount}回
            </p>

            <p className="text-xl font-bold">
              今日の体重⚖️：
              {latestWeight?.weight ??
                "--"}
              kg
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xl font-bold">
              今日のメモ📝：
            </p>
            {!showNoteInput ? (
              <div className="memo-display" onClick={() => {
                setShowNoteInput(true);
                setCurrentEditingNote(noteInput);
              }}>
                {noteInput || 'メモを追加'}
              </div>
            ) : (
              <div className="memo-input-overlay">
                <div className="memo-input-modal">
                  <textarea
                    value={currentEditingNote}
                    onChange={(e) => setCurrentEditingNote(e.target.value)}
                    placeholder="今日の様子や気になることを記録"
                    className="memo-textarea-modal"
                  />
                  <div className="memo-modal-actions">
                    <button
                      onClick={() => {
                        setShowNoteInput(false);
                        setCurrentEditingNote(noteInput); // Revert changes
                      }}
                      className="memo-modal-button cancel"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={async () => {
                        await saveDailyNote(getTodayDate(), currentEditingNote);
                        setNoteInput(currentEditingNote); // Update displayed note
                        setShowNoteInput(false);
                      }}
                      className="memo-modal-button save"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2 text-base text-gray-500">
            <p>
              最後のごはん🥩：
              {lastFood
                ? getRelativeTime(
                    lastFood.createdAt
                  )
                : "記録なし"}
            </p>

            <p>
              最後のうんち💩：
              {lastPoop
                ? getRelativeTime(
                    lastPoop.createdAt
                  )
                : "記録なし"}
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setShowFoodSelect(
                !showFoodSelect
              );

              setShowSnackSelect(false);

              setShowWeightInput(false);
            }}
            className="rounded-3xl bg-blue-500 p-7 text-2xl font-bold text-white shadow-lg active:scale-95"
          >
            ごはん
          </button>

          <button
            onClick={() => {
              setShowSnackSelect(
                !showSnackSelect
              );

              setShowFoodSelect(false);

              setShowWeightInput(false);
            }}
            className="rounded-3xl bg-pink-500 p-7 text-2xl font-bold text-white shadow-lg active:scale-95"
          >
            おやつ
          </button>

          <button
            onClick={addPoop}
            className="rounded-3xl bg-green-500 p-7 text-2xl font-bold text-white shadow-lg active:scale-95"
          >
            うんち
          </button>

          <button
            onClick={() => {
              setShowWeightInput(
                !showWeightInput
              );

              setShowFoodSelect(false);

              setShowSnackSelect(false);
            }}
            className="rounded-3xl bg-yellow-500 p-7 text-2xl font-bold text-white shadow-lg active:scale-95"
          >
            体重
          </button>
        </div>

        {showFoodSelect && (
          <div className="mt-5 rounded-3xl bg-gray-100 p-5">
            <h2 className="text-xl font-bold">
              ごはん量選択
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[0.5, 1, 1.5, 2].map(
                (amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      addFood(amount)
                    }
                    className="rounded-3xl bg-blue-500 p-7 text-3xl font-bold text-white shadow-md active:scale-95"
                  >
                    {amount}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {showSnackSelect && (
          <div className="mt-5 rounded-3xl bg-gray-100 p-5">
            <h2 className="text-xl font-bold">
              おやつ数量選択
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[0.5, 1].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedSnackAmount(amount)}
                  className={`rounded-3xl p-7 text-3xl font-bold text-white shadow-md active:scale-95 ${
                    selectedSnackAmount === amount
                      ? "bg-pink-700"
                      : "bg-pink-400"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            {selectedSnackAmount !== null && (
              <>
                <h2 className="mt-5 text-xl font-bold">
                  おやつ種類選択
                </h2>
                <div className="mt-5 space-y-3">
                  {["ちゅーる", "ぽんちゅーる", "その他"].map((snack) => (
                    <button
                      key={snack}
                      onClick={() => setSelectedSnack(snack)}
                      className={`w-full rounded-3xl p-6 text-2xl font-bold text-white shadow-md active:scale-95 ${
                        selectedSnack === snack ? "bg-pink-700" : "bg-pink-400"
                      }`}
                    >
                      {snack}
                    </button>
                  ))}
                </div>

                {selectedSnack === "その他" && (
                  <input
                    type="text"
                    value={customSnackName}
                    onChange={(e) => setCustomSnackName(e.target.value)}
                    placeholder="おやつ名を入力"
                    className="mt-3 w-full rounded-3xl border p-5 text-xl"
                  />
                )}

                <button
                  onClick={addSnack}
                  className="mt-5 w-full rounded-3xl bg-pink-500 p-5 text-xl font-bold text-white shadow-md active:scale-95"
                  disabled={
                    selectedSnackAmount === null ||
                    (selectedSnack === "その他" && !customSnackName.trim())
                  }
                >
                  記録
                </button>
              </>
            )}
          </div>
        )}

        {showWeightInput && (
          <div className="mt-5 rounded-3xl bg-gray-100 p-5">
            <h2 className="text-xl font-bold">
              体重入力
            </h2>

            <div className="mt-5 flex gap-3">
              <input
                type="number"
                step="0.1"
                placeholder="例: 4.2"
                value={weightInput}
                onChange={(e) =>
                  setWeightInput(
                    e.target.value
                  )
                }
                className="w-full rounded-3xl border p-5 text-xl"
              />

              <button
                onClick={addWeight}
                className="rounded-3xl bg-yellow-500 px-6 text-lg font-bold text-white shadow-md active:scale-95"
              >
                記録
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 rounded-3xl bg-gray-100 p-5">
          <h2 className="text-xl font-bold">
            今日の記録
          </h2>

          <div className="space-y-4">
            {todayRecords.length ===
              0 && (
              <div className="rounded-3xl bg-gray-100 p-5 text-center text-gray-500">
                まだ記録がありません
              </div>
            )}

            {todayRecords.map(
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
                    <div className="flex items-center justify-between gap-3">
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

                        <p className="mt-2 text-base text-gray-500">
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
                          className="rounded-2xl bg-red-500 px-5 py-3 text-base font-bold text-white shadow-md active:scale-95"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;