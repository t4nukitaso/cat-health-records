import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import HomeScreen from "./components/HomeScreen";

import CalendarScreen from "./components/CalendarScreen";

import DayDetailScreen from "./components/DayDetailScreen";

import type { RecordItem } from "./types";

import { db } from "./firebase";

function App() {
  const [records, setRecords] =
    useState<RecordItem[]>([]);

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(db, "records"),
        (snapshot) => {
          const loadedRecords =
            snapshot.docs.map((d) => {
              return {
                firebaseId: d.id,
                ...d.data(),
              };
            }) as RecordItem[];

          loadedRecords.sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          );

          setRecords(
            loadedRecords
          );
        }
      );

    return () => unsubscribe();
  }, []);

  async function addRecord(
    record: RecordItem
  ) {
    await addDoc(
      collection(db, "records"),
      record
    );
  }

  async function deleteRecord(
    firebaseId: string
  ) {
    await deleteDoc(
      doc(
        db,
        "records",
        firebaseId
      )
    );
  }

  async function editRecord(
    firebaseId: string,
    data: Partial<RecordItem>
  ) {
    await updateDoc(
      doc(
        db,
        "records",
        firebaseId
      ),
      data
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              records={records}
              addRecord={addRecord}
              deleteRecord={
                deleteRecord
              }
            />
          }
        />

        <Route
          path="/calendar"
          element={
            <CalendarScreen
              records={records}
            />
          }
        />

        <Route
          path="/day/:date"
          element={
            <DayDetailScreen
              records={records}
              deleteRecord={
                deleteRecord
              }
              editRecord={
                editRecord
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;