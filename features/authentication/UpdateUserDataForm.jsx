"use client";

import { useState } from "react";

import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";

import { FormSkeleton } from "../../ui/Skeleton";
import useUser from "./useUser";
import useUpdateUser from "./useUpdateUser";

function UpdateUserDataForm() {
  const { user } = useUser();
  // tunggu data user siap supaya nilai awal form benar
  if (!user) return <FormSkeleton fields={3} />;
  return <UserDataForm user={user} />;
}

function UserDataForm({ user }) {
  const { email, fullName: currentFullName } = user;

  const [fullName, setFullName] = useState(currentFullName);
  const [avatar, setAvatar] = useState(null);

  const { isPending, updateUser } = useUpdateUser();

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName && !avatar) return;
    updateUser(
      { fullName, avatar },
      {
        onSettled: () => {
          setAvatar(null);
          e.target.reset();
        },
      }
    ); // reset avatar after successful update
  }

  return (
    <Form
      type="reguler"
      onSubmit={handleSubmit}
      onReset={() => {
        setFullName(currentFullName);
        setAvatar(null);
      }}
    >
      <FormRow label="Email address">
        <Input id="account-email" aria-label="Email address" value={email} disabled />
      </FormRow>
      <FormRow label="Full name">
        <Input
          disabled={isPending}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          id="fullName"
        />
      </FormRow>
      <FormRow label="Avatar image">
        <FileInput
          disabled={isPending}
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
        />
      </FormRow>
      <FormRow>
        <Button type="reset" variation="secondary">
          Cancel
        </Button>
        <Button disabled={isPending}>Save profile</Button>
      </FormRow>
    </Form>
  );
}

export default UpdateUserDataForm;
