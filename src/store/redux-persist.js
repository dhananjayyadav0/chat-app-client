import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const loginReducer = (
  state = { user: null, token: "", collapse: false, userType: null },
  action
) => {
  if (action.type === "login") {
    return {
      ...state,
      user: true,
      token: action.token,
      collapse: false,
    };
  } else if (action.type === "logout") {
    return {
      user: null,
      token: "",
      collapse: false,
      userType: null
    };
  } else if (action.type === "toggle") {
    return {
      ...state,
      collapse: action.value,
    };
  } else if (action.type === "userType") {
    return {
      ...state,
      userType: action.userType
    }
  } else {
    return state;
  }
};

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, loginReducer);

const dataStore = createStore(persistedReducer);

const persistor = persistStore(dataStore);

export { dataStore, persistor };
