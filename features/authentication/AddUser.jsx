"use client";

import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import SignupForm from "./SignupForm";

function AddUser() {
  return (
    <Modal>
      <Modal.Open opens="add-user">
        <Button variation="accent">+ Add user</Button>
      </Modal.Open>
      <Modal.Window names="add-user">
        <SignupForm />
      </Modal.Window>
    </Modal>
  );
}

export default AddUser;
