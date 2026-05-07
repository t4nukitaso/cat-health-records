import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RecordType = "food" | "snack" | "poop";

type SnackType =
  | "ちゅーる"
  | "ぽんちゅーる"
  | "その他";

type RecordItem = {
  id: number;
  type: RecordType;
  amount?: number;
  snackType?: string;
  customSnackName?: string;
  createdAt: string;
};

function App() {
  const [records, setRecords] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem("cat-records");

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  const [showFoodSelect, setShowFoodSelect] =
    useState(false);

  const [showSnackSelect, setShowSnackSelect] =
    useState(false);

  const [selectedSnack, setSelectedSnack] =
    useState<SnackType>("ちゅーる");

  const [customSnackName, setCustomSnackName] =
    useState("");

  const touchStartX = useRef(0);

  function getNowISOString() {
    return new Date().toISOString();
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString(
      "ja-JP",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function isToday(dateString: string) {
    const target = new Date(dateString);

    const now = new Date();

    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    );
  }

  function getRelativeTime(dateString: string) {
    const diff =
      Date.now() - new Date(dateString).getTime();

    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 60) {
      return `${minutes}分前`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}時間前`;
    }

    const days = Math.floor(hours / 24);

    return `${days}日前`;
  }

  function addFood(amount: number) {
    const newRecord: RecordItem = {
      id: Date.now(),
      type: "food",
      amount,
      createdAt: getNowISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);

    setShowFoodSelect(false);
  }

  function addSnack(amount: number) {
    const newRecord: RecordItem = {
      id: Date.now(),
      type: "snack",
      amount,
      snackType: selectedSnack,
      customSnackName:
        selectedSnack === "その他"
          ? customSnackName
          : undefined,
      createdAt: getNowISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);

    setShowSnackSelect(false);

    setCustomSnackName("");
  }

  function addPoop() {
    const newRecord: RecordItem = {
      id: Date.now(),
      type: "poop",
      createdAt: getNowISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
  }

  function undoLastRecord() {
    setRecords((prev) => prev.slice(1));
  }

  function deleteRecord(id: number) {
    setRecords((prev) =>
      prev.filter((record) => record.id !== id)
    );
  }

  const todayRecords = useMemo(() => {
    return records.filter((record) =>
      isToday(record.createdAt)
    );
  }, [records]);

  const foodTotal = useMemo(() => {
    return todayRecords
      .filter((r) => r.type === "food")
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [todayRecords]);

  const poopCount = useMemo(() => {
    return todayRecords.filter(
      (r) => r.type === "poop"
    ).length;
  }, [todayRecords]);

  const snackTotal = useMemo(() => {
    return todayRecords
      .filter((r) => r.type === "snack")
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [todayRecords]);

  const lastFood = records.find(
    (r) => r.type === "food"
  );

  const lastPoop = records.find(
    (r) => r.type === "poop"
  );

  const groupedRecords = useMemo(() => {
    const groups: Record<string, RecordItem[]> = {};

    records.forEach((record) => {
      const date = new Date(
        record.createdAt
      ).toLocaleDateString("ja-JP");

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(record);
    });

    return groups;
  }, [records]);

  useEffect(() => {
    localStorage.setItem(
      "cat-records",
      JSON.stringify(records)
    );
  }, [records]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <h1 className="text-5xl">🐈</h1>

          <p className="mt-2 text-sm text-gray-500">
            {new Date().toLocaleString("ja-JP")}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-gray-100 p-4">
          <div className="space-y-2">
            <p className="text-lg">
              今日のごはん：{foodTotal}
            </p>

            <p className="text-lg">
              今日のおやつ：{snackTotal}
            </p>

            <p className="text-lg">
              今日のうんち：{poopCount}回
            </p>
          </div>

          <div className="mt-4 space-y-1 text-sm text-gray-500">
            <p>
              最後のごはん：
              {lastFood
                ? getRelativeTime(lastFood.createdAt)
                : "記録なし"}
            </p>

            <p>
              最後のうんち：
              {lastPoop
                ? getRelativeTime(lastPoop.createdAt)
                : "記録なし"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setShowFoodSelect(
                !showFoodSelect
              );

              setShowSnackSelect(false);
            }}
            className="rounded-2xl bg-blue-500 p-4 text-white shadow"
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
            className="rounded-2xl bg-pink-500 p-4 text-white shadow"
          >
            おやつ
          </button>

          <button
            onClick={addPoop}
            className="rounded-2xl bg-green-500 p-4 text-white shadow"
          >
            うんち
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={undoLastRecord}
            disabled={records.length === 0}
            className="w-full rounded-2xl bg-gray-200 p-4"
          >
            取り消し
          </button>
        </div>

        {showFoodSelect && (
          <div className="mt-4 rounded-3xl bg-gray-100 p-4">
            <h2 className="text-lg font-bold">
              ごはん量選択
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[0.5, 1, 1.5, 2].map((amount) => (
                <button
                  key={amount}
                  onClick={() => addFood(amount)}
                  className="rounded-2xl bg-blue-500 p-4 text-white"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {showSnackSelect && (
          <div className="mt-4 rounded-3xl bg-gray-100 p-4">
            <h2 className="text-lg font-bold">
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
                      snack as SnackType
                    )
                  }
                  className={`w-full rounded-2xl p-4 text-white ${
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
                  onClick={() => addSnack(amount)}
                  className="rounded-2xl bg-pink-500 p-4 text-white"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-bold">
            カレンダー / 記録一覧
          </h2>

          <div className="space-y-6">
            {Object.entries(groupedRecords).map(
              ([date, dayRecords]) => (
                <div key={date}>
                  <h3 className="mb-2 text-lg font-bold">
                    {date}
                  </h3>

                  <div className="space-y-2">
                    {dayRecords.map((record) => (
                      <div
                        key={record.id}
                        onTouchStart={(e) => {
                          touchStartX.current =
                            e.touches[0].clientX;
                        }}
                        onTouchEnd={(e) => {
                          const diff =
                            touchStartX.current -
                            e.changedTouches[0]
                              .clientX;

                          if (diff > 100) {
                            deleteRecord(
                              record.id
                            );
                          }
                        }}
                        className="flex items-center justify-between rounded-2xl bg-gray-100 p-3"
                      >
                        <div>
                          <p className="font-semibold">
                            {record.type ===
                              "food" &&
                              "🍚 ごはん"}

                            {record.type ===
                              "snack" &&
                              `🍭 ${
                                record.customSnackName ||
                                record.snackType
                              }`}

                            {record.type ===
                              "poop" &&
                              "💩 うんち"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {formatTime(
                              record.createdAt
                            )}

                            {record.amount
                              ? ` / ${record.amount}`
                              : ""}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            deleteRecord(
                              record.id
                            )
                          }
                          className="rounded-xl bg-red-500 px-3 py-2 text-white"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;