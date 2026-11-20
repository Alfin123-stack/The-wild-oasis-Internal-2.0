"use client";

import styled from "styled-components";
import Table from "../../ui/Table";
import Tag from "../../ui/Tag";
import { RowsSkeleton } from "../../ui/Skeleton";
import useUsers from "./useUsers";
import useUser from "./useUser";
import Button from "../../ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUserAdmin } from "../../services/apiExtra";
import { fmtUTC } from "../../utils/dates";

const Who = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;

  & img {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--color-grey-200);
  }
  & b { display: block; font-weight: 600; }
  & span { font-size: var(--text-caption); color: var(--color-grey-500); overflow-wrap: anywhere; }
`;

function UserActions({ u, isSelf }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (patch) => updateUserAdmin(u.id, patch),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(e.message),
  });
  if (isSelf) return <span style={{ fontSize: "1.2rem", color: "var(--color-grey-500)" }}>This is you</span>;
  const active = u.isActive !== false;
  return (
    <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
      <Button size="small" variation="secondary" disabled={isPending} onClick={() => mutate({ role: u.role === "admin" ? "staff" : "admin" })}>
        {u.role === "admin" ? "Make staff" : "Make admin"}
      </Button>
      <Button size="small" variation={active ? "danger" : "secondary"} disabled={isPending} onClick={() => mutate({ isActive: !active })}>
        {active ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
}

function UserList() {
  const { isPending, users, error } = useUsers();
  const { user: me } = useUser();
  if (isPending) return <RowsSkeleton rows={4} />;
  if (error) return <p style={{ color: "var(--status-alert-fg)" }}>Failed to load users: {error.message}</p>;

  return (
    <Table columns="2.4fr 1fr 1.2fr 2.2fr">
      <Table.Header>
        <div>Member</div>
        <div>Role</div>
        <div>Added</div>
        <div></div>
      </Table.Header>
      <Table.Body
        data={users || []}
        render={(u) => (
          <Table.Row key={u.id} areas={'"who role" "added act"'}>
            <Who data-area="who">
              <img src={u.avatar || "/default-user.jpg"} alt="" />
              <div>
                <b>{u.fullName}</b>
                <span>{u.email}</span>
              </div>
            </Who>
            <div data-area="role" data-end>
              <Tag type={u.role === "admin" ? "indigo" : "silver"}>{u.role}</Tag>
              {u.isActive === false && <Tag type="red">inactive</Tag>}
            </div>
            <span data-area="added" data-end style={{ fontSize: "1.3rem", color: "var(--color-grey-500)" }}>{u.createdAt ? fmtUTC(u.createdAt) : "—"}</span>
            <div data-area="act" data-end><UserActions u={u} isSelf={me?.id === u.id} /></div>
          </Table.Row>
        )}
      />
    </Table>
  );
}

export default UserList;
