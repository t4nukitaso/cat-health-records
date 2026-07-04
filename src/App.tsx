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
  query,
  where,
  getDocs,
} from "firebase/firestore";

import HomeScreen from "./components/HomeScreen";

import CalendarScreen from "./components/CalendarScreen";

import DayDetailScreen from "./components/DayDetailScreen";

import "./App.css";

import type {
  RecordItem,
  DailyNote,
} from "./types";

import { db } from "./firebase";

function App() {
  const [records, setRecords] =
    useState<RecordItem[]>([]);

  const [dailyNotes, setDailyNotes] =
    useState<DailyNote[]>([]);

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

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(db, "dailyNotes"),
        (snapshot) => {
          const loadedNotes =
            snapshot.docs.map((d) => {
              return {
                firebaseId: d.id,
                ...d.data(),
              };
            }) as DailyNote[];

          setDailyNotes(
            loadedNotes
          );
        }
      );

    return () => unsubscribe();
  }, []);

  async function addRecord(
    record: RecordItem
  ) {
    console.log("Attempting to add record:", record);
    try {
      const docRef = await addDoc(
        collection(db, "records"),
        record
      );
      console.log("Record added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding record:", error);
    }
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

  async function saveDailyNote(
    date: string,
    note: string
  ) {
    const q = query(
      collection(db, "dailyNotes"),
      where("date", "==", date)
    );

    const snapshot =
      await getDocs(q);

    if (
      snapshot.docs.length > 0
    ) {
      const existingDoc =
        snapshot.docs[0];

      await updateDoc(
        doc(
          db,
          "dailyNotes",
          existingDoc.id
        ),
        {
          note,
        }
      );
    } else {
      await addDoc(
        collection(
          db,
          "dailyNotes"
        ),
        {
          date,
          note,
        }
      );
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              records={records}
              dailyNotes={
                dailyNotes
              }
              addRecord={addRecord}
              deleteRecord={
                deleteRecord
              }
              saveDailyNote={
                saveDailyNote
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
              dailyNotes={
                dailyNotes
              }
              addRecord={addRecord}
              deleteRecord={
                deleteRecord
              }
              editRecord={
                editRecord
              }
              saveDailyNote={
                saveDailyNote
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
