import { createStore } from "redux";

// Initial state
const initialState = {
  pageTitle: "Default Title",
};

// Reducer function
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_PAGE_TITLE":
      return { ...state, pageTitle: action.payload };
    default:
      return state;
  }
};

// Create store
const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
