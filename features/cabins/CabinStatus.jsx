"use client";

/* eslint-disable react/prop-types */
import StatusBadge from "../../ui/StatusBadge";

const MAP = {
  occupied: { tone: "inhouse", label: "Occupied" },
  departing: { tone: "unconfirmed", label: "Departing today" },
  arriving: { tone: "arriving", label: "Arriving today" },
  vacant: { tone: "ok", label: "Vacant" },
};

function CabinStatus({ status }) {
  const m = MAP[status] || MAP.vacant;
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
}

export default CabinStatus;
