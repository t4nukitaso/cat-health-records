import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";

import { Link, useNavigate } from "react-router-dom";

import type { RecordItem } from "../types";

import "./Calendar.css";

type Props = {
  records: RecordItem[];
};

function CalendarScreen({
  records,
}: Props) {
  const navigate = useNavigate();

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

  function getRecordsByDate(date: Date) {
    const targetDate =
      formatLocalDate(date);

    return records.filter((record) => {
      const recordDate =
        formatLocalDate(
          new Date(record.createdAt)
        );

      return (
        recordDate === targetDate
      );
    });
  }

  function getFoodTotal(date: Date) {
    return getRecordsByDate(date)
      .filter((r) => r.type === "food")
      .reduce(
        (sum, r) =>
          sum + (r.amount || 0),
        0
      );
  }

  function getSnackTotal(date: Date) {
    return getRecordsByDate(date)
      .filter((r) => r.type === "snack")
      .reduce(
        (sum, r) =>
          sum + (r.amount || 0),
        0
      );
  }

  function getPoopCount(date: Date) {
    return getRecordsByDate(date).filter(
      (r) => r.type === "poop"
    ).length;
  }

  function getLatestWeight(date: Date) {
    const weightRecords =
      getRecordsByDate(date)
        .filter(
          (r) => r.type === "weight"
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

    if (weightRecords.length === 0) {
      return null;
    }

    return weightRecords[0].weight;
  }

  function isToday(date: Date) {
    const now = new Date();

    return (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-sm rounded-[36px] bg-white p-5 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="rounded-2xl bg-gray-200 px-4 py-2 active:scale-95"
          >
            戻る
          </Link>

          <h1 className="text-2xl font-bold">
            カレンダー
          </h1>

          <div className="w-[70px]" />
        </div>

        <Calendar
          locale="ja-JP"
          prevLabel="←"
          nextLabel="→"
          prev2Label={null}
          next2Label={null}
          className="iphone-calendar"
          navigationLabel={({ date }) => (
            <span className="text-lg font-bold">
              {date.getFullYear()}年{" "}
              {date.getMonth() + 1}月
            </span>
          )}
          tileClassName={({
            date,
            view,
          }) => {
            if (view !== "month") {
              return "";
            }

            const food =
              getFoodTotal(date);

            const snack =
              getSnackTotal(date);

            const poop =
              getPoopCount(date);

            const weight =
              getLatestWeight(date);

            if (isToday(date)) {
              return "today-tile";
            }

            if (
              food > 0 ||
              snack > 0 ||
              poop > 0 ||
              weight !== null
            ) {
              return "record-tile";
            }

            return "";
          }}
          tileContent={({
            date,
            view,
          }) => {
            if (view !== "month") {
              return null;
            }

            const food =
              getFoodTotal(date);

            const snack =
              getSnackTotal(date);

            const poop =
              getPoopCount(date);

            const weight =
              getLatestWeight(date);

            return (
              <div className="mt-1 flex flex-col items-center gap-[1px]">
                {food > 0 && (
                  <div className="text-[10px] font-bold">
                    🥩 {food}
                  </div>
                )}

                {snack > 0 && (
                  <div className="text-[10px] font-bold">
                    🍦 {snack}
                  </div>
                )}

                {poop > 0 && (
                  <div className="text-[10px] font-bold">
                    💩 {poop}
                  </div>
                )}

                {weight !== null && (
                  <div className="text-[10px] font-bold">
                    ⚖️ {weight}kg
                  </div>
                )}
              </div>
            );
          }}
          onClickDay={(value) => {
            navigate(
              `/day/${formatLocalDate(
                value
              )}`
            );
          }}
        />
      </div>
    </div>
  );
}

export default CalendarScreen;