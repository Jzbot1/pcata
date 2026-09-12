import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./features/userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Persist config setup
const persistConfig = {
  key: "user",
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

// Redux store setup karein
const store = configureStore({
  reducer: {
    user: persistedUserReducer, // Persisted reducer use karein
  },
});

// Persistor create karein
const persistor = persistStore(store);

export { store, persistor };