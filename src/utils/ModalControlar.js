import store from "../store/store"
import { openModal, closeModal, openSideDrawer } from "../features/modal/modalSlice";

export const showModal = (title, modalType, id, meta = {}) => {
  store.dispatch(openModal({ title, modalType, id, meta }));
};

export const hideModal = () => {
  store.dispatch(closeModal());
};

export const showSideBarModal = (title, modalType, id) => {
  store.dispatch(openSideDrawer({ title, modalType, id }));
};
