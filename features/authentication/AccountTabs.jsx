"use client";

import { useState } from "react";
import styled from "styled-components";
import Tabs from "../../ui/Tabs";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import SpinnerMini from "../../ui/SpinnerMini";
import UpdateUserDataForm from "./UpdateUserDataForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import useLogout from "./useLogout";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  max-width: 96rem;
`;

const Session = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;

  & p { color: var(--color-grey-500); font-size: 1.3rem; }
`;

function AccountTabs() {
  const [tab, setTab] = useState("profile");
  const { logout, isPending } = useLogout();
  return (
    <Wrap>
      <Tabs
        label="Account sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "profile", label: "Profile" },
          { value: "security", label: "Security" },
        ]}
      />
      {tab === "profile" && <UpdateUserDataForm />}
      {tab === "security" && <UpdatePasswordForm />}
      <Card title="Session">
        <Session>
          <p>Sign out of the dashboard on this device.</p>
          <Button variation="secondary" disabled={isPending} onClick={() => logout()}>
            {isPending ? <SpinnerMini /> : "Sign out"}
          </Button>
        </Session>
      </Card>
    </Wrap>
  );
}

export default AccountTabs;
