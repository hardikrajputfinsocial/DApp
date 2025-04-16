import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import futuresReducer from "./slices/futuresSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    futures: futuresReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
