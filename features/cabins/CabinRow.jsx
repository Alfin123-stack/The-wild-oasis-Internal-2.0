"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import { formatCurrency } from "../../utils/helpers.js";
import CreateCabinForm from "./CreateCabinForm.jsx";
import CabinStatus from "./CabinStatus.jsx";
import useUser from "../authentication/useUser";
import useArchiveCabin from "./useArchiveCabin";
import useDeleteCabin from "./useDeleteCabin.js";
import { HiPencil, HiArchiveBox, HiArrowUturnLeft, HiSquare2Stack, HiTrash } from "react-icons/hi2";
import useCreateCabin from "./useCreateCabin.js";
import Modal from "../../ui/Modal.jsx";
import ConfirmDelete from "../../ui/ConfirmDelete.jsx";
import Table from "../../ui/Table.jsx";
import Menus from "../../ui/Menus.jsx";

const Img = styled.img`
  display: block;
  width: 7.2rem;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-grey-200);
`;

const Cabin = styled.div`
  font-family: var(--font-serif);
  font-size: var(--text-title);
  font-weight: 700;
`;

const Price = styled.div`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const Discount = styled.div`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--status-ok-fg);
`;

function CabinRow({ cabin, status }) {
  const { id, name, maxCapacity, regularPrice, discount, image, description, isArchived } = cabin;
  const { isAdmin } = useUser();
  const { archiveCabin, isArchiving } = useArchiveCabin();
  const { isPending, deleteCabin } = useDeleteCabin();
  const { addCabin, isAdding } = useCreateCabin();

  function handleDuplicateCabin() {
    addCabin({ name: name + " (copy)", maxCapacity, regularPrice, discount, image, description });
  }

  return (
    <Table.Row areas={'"img name menu" "img cap status" "img price disc"'} cardColumns="7.2rem minmax(0, 1fr) auto">
      {image ? (
        <Img data-area="img" src={image} alt={name} />
      ) : (
        <div data-area="img" aria-hidden style={{ width: "7.2rem", aspectRatio: "3 / 2", borderRadius: "var(--radius-sm)", background: "var(--color-grey-100)", border: "1px solid var(--color-grey-200)" }} />
      )}
      <Cabin data-area="name">{name}{isArchived && <small style={{ marginLeft: "0.8rem", color: "var(--color-grey-500)" }}>(archived)</small>}</Cabin>
      <p data-area="cap">Up to {maxCapacity} guests</p>
      <div data-area="status" data-end>
        <CabinStatus status={status} />
      </div>
      <Price data-area="price" data-label="Price">{formatCurrency(regularPrice)}</Price>
      <Discount data-area="disc" data-end data-label="Discount">{discount === 0 ? "—" : formatCurrency(discount)}</Discount>

      <div data-area="menu" data-end>
      {isAdmin && (<Menus>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={id} />
            <Menus.List id={id}>
              <Menus.Button disabled={isAdding} onClick={handleDuplicateCabin}>
                <HiSquare2Stack /> Duplicate
              </Menus.Button>
              <Modal.Open opens="edit">
                <Menus.Button disabled={isPending}>
                  <HiPencil /> Edit
                </Menus.Button>
              </Modal.Open>
              <Modal.Open opens="delete">
                <Menus.Button disabled={isPending}>
                  <HiTrash /> Delete
                </Menus.Button>
              </Modal.Open>
              <Menus.Button disabled={isArchiving} onClick={() => archiveCabin({ id, archived: !isArchived })}>
                  {isArchived ? <><HiArrowUturnLeft /> Restore</> : <><HiArchiveBox /> Archive</>}
                </Menus.Button>
              </Menus.List>
            <Modal.Window names="delete">
              <ConfirmDelete resourceName="cabin" disabled={isPending} onConfirm={() => deleteCabin(id)} />
            </Modal.Window>
            <Modal.Window names="edit">
              <CreateCabinForm cabinToEdit={cabin} />
            </Modal.Window>
          </Menus.Menu>
        </Modal>
      </Menus>)}
      </div>
    </Table.Row>
  );
}

export default CabinRow;
