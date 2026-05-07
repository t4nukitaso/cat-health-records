import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import type { RecordItem } from "../types";

import {
  getRelativeTime,
  isToday,
} from "../utils";

type Props = {
  records: RecordItem[];

  addRecord: (
    record: RecordItem
  ) => Promise<void>;

  deleteRecord: (
    firebaseId: string
  ) => Promise<void>;
};

function HomeScreen({
  records,
  addRecord,
  deleteRecord,
}: Props) {
  const [showFoodSelect, setShowFoodSelect] =
    useState(false);

  const [showSnackSelect, setShowSnackSelect] =
    useState(false);

  const [showWeightInput, setShowWeightInput] =
    useState(false);

  const [selectedSnack, setSelectedSnack] =
    useState("ちゅーる");

  const [customSnackName, setCustomSnackName] =
    useState("");

  const [weightInput, setWeightInput] =
    useState("");

  function createNowISO() {
    return new Date().toISOString();
  }

  async function addFood(
    amount: number
  ) {
    await addRecord({
      id: Date.now(),
      type: "food",
      amount,
      createdAt: createNowISO(),
    });

    setShowFoodSelect(false);
  }

  async function addSnack(
    amount: number
  ) {
    await addRecord({
      id: Date.now(),
      type: "snack",
      amount,
      snackType: selectedSnack,
      customSnackName:
        selectedSnack === "その他"
          ? customSnackName
          : undefined,
      createdAt: createNowISO(),
    });

    setShowSnackSelect(false);

    setCustomSnackName("");
  }

  async function addPoop() {
    await addRecord({
      id: Date.now(),
      type: "poop",
      createdAt: createNowISO(),
    });
  }

  async function addWeight() {
    if (!weightInput) return;

    await addRecord({
      id: Date.now(),
      type: "weight",
      weight: Number(weightInput),
      createdAt: createNowISO(),
    });

    setWeightInput("");

    setShowWeightInput(false);
  }

  async function undoLastRecord() {
    if (
      records.length === 0 ||
      !records[0].firebaseId
    ) {
      return;
    }

    await deleteRecord(
      records[0].firebaseId
    );
  }

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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <Link
            to="/calendar"
            className="rounded-2xl bg-gray-200 px-4 py-2 active:scale-95"
          >
            カレンダー
          </Link>

          <h1 className="text-5xl">🐈</h1>

          <div className="w-[100px]" />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          {new Date().toLocaleString(
            "ja-JP"
          )}
        </p>

        <div className="mt-6 rounded-3xl bg-gray-100 p-5">
          <div className="space-y-3">
            <p className="text-lg font-bold">
              今日のごはん🥩：
              {foodTotal}
            </p>

            <p className="text-lg font-bold">
              今日のおやつ🍦：
              {snackTotal}
            </p>

            <p className="text-lg font-bold">
              今日のうんち💩：
              {poopCount}回
            </p>

            <p className="text-lg font-bold">
              今日の体重⚖️：
              {latestWeight?.weight ??
                "--"}
              kg
            </p>
          </div>

          <div className="mt-5 text-sm text-gray-500">
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

        <div className="mt-6 grid grid-cols-4 gap-2">
          <button
            onClick={() => {
              setShowFoodSelect(
                !showFoodSelect
              );

              setShowSnackSelect(false);

              setShowWeightInput(false);
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

              setShowWeightInput(false);
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

          <button
            onClick={() => {
              setShowWeightInput(
                !showWeightInput
              );

              setShowFoodSelect(false);

              setShowSnackSelect(false);
            }}
            className="rounded-2xl bg-yellow-500 p-4 text-white shadow-md active:scale-95"
          >
            体重
          </button>
        </div>

        <button
          onClick={undoLastRecord}
          className="mt-6 w-full rounded-2xl bg-gray-200 p-4 text-gray-700 active:scale-95"
        >
          取り消し
        </button>

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
                    addSnack(amount)
                  }
                  className="rounded-2xl bg-pink-500 p-4 text-white active:scale-95"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {showWeightInput && (
          <div className="mt-4 rounded-3xl bg-gray-100 p-4">
            <h2 className="font-bold">
              体重入力
            </h2>

            <div className="mt-4 flex gap-2">
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
                className="w-full rounded-2xl border p-4"
              />

              <button
                onClick={addWeight}
                className="rounded-2xl bg-yellow-500 px-5 text-white active:scale-95"
              >
                記録
              </button>
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold">
            今日の記録
          </h2>

          <div className="space-y-3">
            {todayRecords.length ===
              0 && (
              <div className="rounded-2xl bg-gray-100 p-4 text-center text-gray-500">
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
                    className="rounded-3xl bg-gray-100 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">
                          {record.type ===
                            "food" &&
                            `🥩 ごはん ${record.amount}`}

                          {record.type ===
                            "snack" &&
                            `🍦 ${
                              record.customSnackName ||
                              record.snackType
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
                          className="rounded-xl bg-red-500 px-3 py-2 text-sm text-white active:scale-95"
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