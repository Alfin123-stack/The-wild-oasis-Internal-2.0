"use client";

/* eslint-disable react/prop-types */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";
import { HiOutlineSparkles } from "react-icons/hi2";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Heading from "../../ui/Heading";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import SpinnerMini from "../../ui/SpinnerMini";
import { draftMessage, getAiStatus } from "../../services/apiExtra";

const Box = styled.div`
  width: 56rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  & label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 1.3rem; color: var(--color-grey-600); }
  & select { min-height: var(--control-h); border: 1px solid var(--color-input-border); border-radius: var(--radius-inputs); padding: 0 1.2rem; background: var(--color-grey-0); color: var(--color-grey-800); }
  & small { color: var(--color-grey-500); font-size: var(--text-caption); }
`;
const Row = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

function DraftForm({ booking, onClose }) {
  const [kind, setKind] = useState("confirmation");
  const [language, setLanguage] = useState("English");
  const [note, setNote] = useState("");
  const [text, setText] = useState("");
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => draftMessage({ bookingId: booking.id, kind, language, note: note || undefined }),
    onSuccess: (r) => setText(r.text),
  });
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy. Select the text and copy it.");
    }
  }
  return (
    <Box>
      <Heading as="h2">Draft a message</Heading>
      <label>Type
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="confirmation">Booking confirmation</option>
          <option value="reminder">Check-in reminder</option>
          <option value="apology">Apology</option>
        </select>
      </label>
      <label>Language<Input value={language} onChange={(e) => setLanguage(e.target.value)} maxLength={30} /></label>
      <label>Anything to add (optional)<Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Late arrival is fine" /></label>
      {error && <p role="alert" style={{ color: "var(--status-alert-fg)" }}>{error.message}</p>}
      {text && <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} aria-label="Draft message" />}
      <small>Only the first name, dates and cabin name are sent to the AI. Read the draft, edit it, and send it yourself.</small>
      <Row>
        <Button variation="secondary" onClick={() => onClose?.()}>Close</Button>
        {text && <Button variation="secondary" onClick={copy}>Copy</Button>}
        <Button onClick={() => mutate()} disabled={isPending}>{isPending ? <SpinnerMini /> : text ? "Write again" : "Write draft"}</Button>
      </Row>
    </Box>
  );
}

function DraftMessage({ booking }) {
  const { data } = useQuery({ queryKey: ["ai-status"], queryFn: getAiStatus });
  if (!data?.enabled || booking.status === "cancelled") return null;
  return (
    <Modal>
      <Modal.Open opens="draft">
        <Button variation="secondary" size="large"><HiOutlineSparkles /> Draft message</Button>
      </Modal.Open>
      <Modal.Window names="draft"><DraftForm booking={booking} /></Modal.Window>
    </Modal>
  );
}

export default DraftMessage;
