import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import type { RecordItem } from "../types";

type Props = {
  records: RecordItem[];

  deleteRecord: (
    firebaseId: string
  ) => Promise<void>;

  editRecord: (
    firebaseId: string,
    data: Partial<RecordItem>
  ) => Promise<void>;
};

function DayDetailScreen({
  records,
  deleteRecord,
  editRecord,
}: Props) {
  const { date } = useParams();

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [swipedId, setSwipedId] =
    useState<number | null>(null);

  const touchStartX = useRef(0);

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

  const targetRecords = useMemo(() => {
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
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
  }, [records, date]);

  const foodTotal = targetRecords
    .filter((r) => r.type === "food")
    .reduce(
      (sum, r) =>
        sum + (r.amount || 0),
      0
    );

  const snackTotal = targetRecords
    .filter((r) => r.type === "snack")
    .reduce(
      (sum, r) =>
        sum + (r.amount || 0),
      0
    );

  const poopCount = targetRecords.filter(
    (r) => r.type === "poop"
  ).length;

  const latestWeight = targetRecords.find(
    (r) => r.type === "weight"
  );

  function startEdit(
    record: RecordItem
  ) {
    setEditingId(record.id);

    if (
      record.type === "weight"
    ) {
      setEditAmount(
        String(record.weight || "")
      );
    } else {
      setEditAmount(
        String(record.amount || "")
      );
    }
  }

  async function saveEdit(
    record: RecordItem
  ) {
    if (!record.firebaseId)
      return;

    if (
      record.type === "weight"
    ) {
      await editRecord(
        record.firebaseId,
        {
          weight:
            Number(editAmount),
        }
      );
    } else {
      await editRecord(
        record.firebaseId,
        {
          amount:
            Number(editAmount),
        }
      );
    }

    setEditingId(null);

    setEditAmount("");
  }

  function handleTouchStart(
    e: React.TouchEvent,
    id: number
  ) {
    touchStartX.current =
      e.touches[0].clientX;

    setSwipedId(null);
  }

  function handleTouchEnd(
    e: React.TouchEvent,
    id: number
  ) {
    const touchEndX =
      e.changedTouches[0].clientX;

    const diff =
      touchStartX.current -
      touchEndX;

    if (diff > 80) {
      setSwipedId(id);
    }

    if (diff < -80) {
      setSwipedId(null);
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

        <div className="mt-8 space-y-4">
          {targetRecords.length ===
            0 && (
            <div className="rounded-3xl bg-gray-100 p-5 text-center text-gray-500">
              記録なし
            </div>
          )}

          {targetRecords.map(
            (record) => {
              const time =
                new Date(
                  record.createdAt
                ).toLocaleTimeString(
                  "ja-JP",
                  {
                    hour: "2-digit",
                    minute:
                      "2-digit",
                  }
                );

              return (
                <div
                  key={record.id}
                  className="relative overflow-hidden rounded-3xl"
                >
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {record.firebaseId && (
                      <button
                        onClick={() =>
                          deleteRecord(
                            record.firebaseId!
                          )
                        }
                        className="h-full rounded-r-3xl bg-red-500 px-6 text-white"
                      >
                        削除
                      </button>
                    )}
                  </div>

                  <div
                    onTouchStart={(e) =>
                      handleTouchStart(
                        e,
                        record.id
                      )
                    }
                    onTouchEnd={(e) =>
                      handleTouchEnd(
                        e,
                        record.id
                      )
                    }
                    className={`relative rounded-3xl bg-gray-100 p-4 shadow-sm transition-all duration-300 ${
                      swipedId ===
                      record.id
                        ? "-translate-x-24"
                        : "translate-x-0"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-lg font-bold">
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

                        {editingId ===
                          record.id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="number"
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

                            <button
                              onClick={() =>
                                saveEdit(
                                  record
                                )
                              }
                              className="rounded-2xl bg-blue-500 px-4 text-white active:scale-95"
                            >
                              保存
                            </button>
                          </div>
                        )}
                      </div>

                      {(record.type ===
                        "food" ||
                        record.type ===
                          "snack" ||
                        record.type ===
                          "weight") && (
                        <button
                          onClick={() =>
                            startEdit(
                              record
                            )
                          }
                          className="rounded-2xl bg-blue-500 px-4 py-2 text-sm text-white active:scale-95"
                        >
                          編集
                        </button>
                      )}
                    </div>
                  </div>
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