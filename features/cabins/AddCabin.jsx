"use client";

import Button from "../../ui/Button";
import CreateCabinForm from "./CreateCabinForm";
import Modal from "../../ui/Modal";
import useUser from "../authentication/useUser";

function AddCabin() {
  const { isAdmin } = useUser();
  if (!isAdmin) return null;
  return (
    <div>
      <Modal>
        <Modal.Open opens="form-cabin">
          <Button variation="accent">+ Add cabin</Button>
        </Modal.Open>
        <Modal.Window names="form-cabin">
          <CreateCabinForm />
        </Modal.Window>
      </Modal>
    </div>
  );
}

export default AddCabin;
