"use client";

/* eslint-disable react/prop-types */
import styled from "styled-components";
import { HiPencil, HiArchiveBox, HiArrowUturnLeft, HiSquare2Stack, HiTrash, HiOutlineUsers } from "react-icons/hi2";
import { formatCurrency } from "../../utils/helpers";
import CreateCabinForm from "./CreateCabinForm";
import CabinStatus from "./CabinStatus";
import useUser from "../authentication/useUser";
import useArchiveCabin from "./useArchiveCabin";
import useDeleteCabin from "./useDeleteCabin";
import useCreateCabin from "./useCreateCabin";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Menus from "../../ui/Menus";

const Card = styled.article`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;

  @media (hover: hover) { &:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); } }
`;

const Photo = styled.div`
  position: relative;
  aspect-ratio: 3 / 2;
  background-color: var(--color-grey-100);

  & img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const Chip = styled.div`
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
`;

const Body = styled.div`
  padding: clamp(1.4rem, 1rem + 0.8vw, 1.8rem) var(--card-pad) var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  & h3 { font-family: var(--font-serif); font-size: var(--text-heading); font-weight: 700; line-height: 1.15; }
`;

const Cap = styled.p`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);
  & svg { width: 1.6rem; height: 1.6rem; }
`;

const Desc = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-600);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Price = styled.div`
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);

  & b { font-family: var(--font-sans); font-weight: 600; font-size: var(--text-heading); color: var(--color-grey-800); }
  & s { color: var(--color-grey-500); }
  & em { font-style: normal; font-weight: 600; font-size: 1.1rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--status-ok-fg); margin-left: auto; }
`;

function CabinCard({ cabin, status }) {
  const { id, name, maxCapacity, regularPrice, discount, image, description, isArchived } = cabin;
  const { isAdmin } = useUser();
  const { archiveCabin, isArchiving } = useArchiveCabin();
  const { isPending, deleteCabin } = useDeleteCabin();
  const { addCabin, isAdding } = useCreateCabin();

  function handleDuplicateCabin() {
    addCabin({ name: name + " (copy)", maxCapacity, regularPrice, discount, image, description });
  }

  const net = regularPrice - discount;

  return (
    <Card>
      <Photo>
        {image && <img src={image} alt={`Cabin ${name}`} loading="lazy" />}
        <Chip>
          <CabinStatus status={status} />
        </Chip>
      </Photo>
      <Body>
        <Head>
          <div>
            <h3>{name}{isArchived && <small style={{ marginLeft: "0.8rem", color: "var(--color-grey-500)", fontWeight: 400 }}>(archived)</small>}</h3>
            <Cap>
              <HiOutlineUsers /> Up to {maxCapacity} guests
            </Cap>
          </div>
          {isAdmin && (<Menus>
            <Modal>
              <Menus.Menu>
                <Menus.Toggle id={id} />
                <Menus.List id={id}>
                  <Modal.Open opens="edit">
                    <Menus.Button disabled={isPending}>
                      <HiPencil /> Edit
                    </Menus.Button>
                  </Modal.Open>
                  <Menus.Button disabled={isAdding} onClick={handleDuplicateCabin}>
                    <HiSquare2Stack /> Duplicate
                  </Menus.Button>
                  <Modal.Open opens="delete">
                    <Menus.Button disabled={isPending}>
                      <HiTrash /> Delete
                    </Menus.Button>
                  </Modal.Open>
                  <Menus.Button disabled={isArchiving} onClick={() => archiveCabin({ id, archived: !isArchived })}>
                  {isArchived ? <><HiArrowUturnLeft /> Restore</> : <><HiArchiveBox /> Archive</>}
                </Menus.Button>
              </Menus.List>
                <Modal.Window names="edit">
                  <CreateCabinForm cabinToEdit={cabin} />
                </Modal.Window>
                <Modal.Window names="delete">
                  <ConfirmDelete resourceName="cabin" disabled={isPending} onConfirm={() => deleteCabin(id)} />
                </Modal.Window>
              </Menus.Menu>
            </Modal>
          </Menus>)}
        </Head>
        {description && <Desc>{description}</Desc>}
        <Price>
          <b>{formatCurrency(net)}</b>
          {discount > 0 && <s>{formatCurrency(regularPrice)}</s>}
          <span>/ night</span>
          {discount > 0 && <em>Save {formatCurrency(discount)}</em>}
        </Price>
      </Body>
    </Card>
  );
}

export default CabinCard;
