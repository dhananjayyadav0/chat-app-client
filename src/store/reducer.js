// rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import tokenSlice from "./tokenSlice";
import userDetailsSlice from "./userDetails";
import formReducer from "./formSlice";

const rootReducer = combineReducers({
  token: tokenSlice,
  form: formReducer,

  userDetails: userDetailsSlice,
});

export default rootReducer;
