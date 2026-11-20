"use client";

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";
import { HiPencil } from "react-icons/hi2";
import Table from "../../ui/Table";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Menus from "../../ui/Menus";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Heading from "../../ui/Heading";
import Empty from "../../ui/Empty";
import { RowsSkeleton } from "../../ui/Skeleton";
import { getGuests, updateGuest } from "../../services/apiExtra";

const Bar = styled.div`
  margin: 2rem 0;
  max-width: 44rem;
`;
const Name = styled.div`
  & b { display: block; font-weight: 600; }
  & span { font-size: var(--text-caption); color: var(--color-grey-500); overflow-wrap: anywhere; }
`;

function GuestForm({ guest, onClose }) {
  const queryClient = useQueryClient();
  const [v, setV] = useState({
    fullName: guest.fullName || "",
    email: guest.email || "",
    nationality: guest.nationality || "",
    phone: guest.phone || "",
    notes: guest.notes || "",
  });
  const { mutate, isPending } = useMutation({
    mutationFn: () => updateGuest(guest.id, v),
    onSuccess: () => {
      toast.success("Guest updated");
      queryClient.invalidateQueries();
      onClose?.();
    },
    onError: (e) => toast.error(e.message),
  });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <Form type="modal" onSubmit={(e) => { e.preventDefault(); mutate(); }}>
      <div style={{ marginBottom: "2rem" }}><Heading as="h2">Edit guest</Heading></div>
      <FormRow label="Full name"><Input value={v.fullName} onChange={set("fullName")} placeholder="e.g. Maria Gonzalez" maxLength={80} required disabled={isPending} /></FormRow>
      <FormRow label="Email"><Input type="email" value={v.email} onChange={set("email")} placeholder="name@example.com" required disabled={isPending} /></FormRow>
      <FormRow label="Nationality"><Input value={v.nationality} onChange={set("nationality")} placeholder="e.g. Indonesia" maxLength={60} disabled={isPending} /></FormRow>
      <FormRow label="Phone"><Input type="tel" value={v.phone} onChange={set("phone")} placeholder="e.g. +62 812 3456 7890" maxLength={40} disabled={isPending} /></FormRow>
      <FormRow label="Notes"><Textarea rows={4} maxLength={1000} placeholder="e.g. Prefers a quiet cabin, allergic to nuts" value={v.notes} onChange={set("notes")} disabled={isPending} /></FormRow>
      <FormRow>
        <Button type="button" variation="secondary" onClick={() => onClose?.()} disabled={isPending}>Cancel</Button>
        <Button disabled={isPending}>Save guest</Button>
      </FormRow>
    </Form>
  );
}

function GuestRow({ g }) {
  return (
    <Table.Row areas={'"who menu" "contact bookings"'}>
      <Name data-area="who">
        <b>{g.fullName}</b>
        <span>{g.email}</span>
      </Name>
      <span data-area="contact" data-label="Contact" style={{ fontSize: "1.3rem", color: "var(--color-grey-600)" }}>
        {[g.nationality, g.phone].filter(Boolean).join(" · ") || "—"}
      </span>
      <Link data-area="bookings" data-end href={`/bookings?q=${encodeURIComponent(g.email)}`} style={{ fontSize: "1.3rem" }}>
        {g.bookingCount} {g.bookingCount === 1 ? "booking" : "bookings"}
      </Link>
      <div data-area="menu" data-end>
        <Menus>
          <Modal>
            <Menus.Menu>
              <Menus.Toggle id={g.id} />
              <Menus.List id={g.id}>
                <Modal.Open opens="edit">
                  <Menus.Button><HiPencil /> Edit</Menus.Button>
                </Modal.Open>
              </Menus.List>
              <Modal.Window names="edit"><GuestForm guest={g} /></Modal.Window>
            </Menus.Menu>
          </Modal>
        </Menus>
      </div>
    </Table.Row>
  );
}

function GuestList() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data, isPending, error } = useQuery({ queryKey: ["guests", "list", dq], queryFn: () => getGuests(dq) });

  return (
    <>
      <Bar>
        <Input type="search" placeholder="Search name or email" aria-label="Search guests" value={q} onChange={(e) => setQ(e.target.value)} />
      </Bar>
      {isPending ? (
        <RowsSkeleton rows={5} />
      ) : error ? (
        <p style={{ color: "var(--status-alert-fg)" }}>Failed to load guests: {error.message}</p>
      ) : data.length === 0 ? (
        <Empty resource="guests" />
      ) : (
        <Menus>
          <Table columns="2fr 1.6fr 1fr 4rem">
            <Table.Header>
              <div>Guest</div>
              <div>Contact</div>
              <div>Bookings</div>
              <div></div>
            </Table.Header>
            <Table.Body data={data} render={(g) => <GuestRow key={g.id} g={g} />} />
          </Table>
        </Menus>
      )}
    </>
  );
}

export default GuestList;
