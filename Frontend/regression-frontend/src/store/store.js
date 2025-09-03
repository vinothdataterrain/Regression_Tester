import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api.js"
const combinedReducer = combineReducers({
  [api.reducerPath]: api.reducer,
});

// Root reducer with reset-on-logout behavior
const rootReducer = (state, action) => {
  if (action.type === "logout") {
    state = undefined; // reset everything on logout
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),

});
