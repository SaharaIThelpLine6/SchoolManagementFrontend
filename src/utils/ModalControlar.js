import store from "../store/store"
import { openModal, closeModal } from "../features/modal/modalSlice";

export const showModal = (title, modalType, id, data=null) => {
  store.dispatch(openModal({ title, modalType, id, data }));
};

export const hideModal = () => {
  store.dispatch(closeModal());
};
