import store from "../store/store"
import { openModal, closeModal } from "../features/modal/modalSlice";

export const showModal = (title, modalType, id) => {
  store.dispatch(openModal({ title, modalType, id }));
};

export const hideModal = () => {
  store.dispatch(closeModal());
};
