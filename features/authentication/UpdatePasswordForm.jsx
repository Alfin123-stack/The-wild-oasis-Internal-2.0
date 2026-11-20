"use client";

import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";

import useUpdateUser from "./useUpdateUser";

function UpdatePasswordForm() {
  const { register, handleSubmit, formState, getValues, reset } = useForm();
  const { errors } = formState;

  const { updateUser, isPending } = useUpdateUser();

  function onSubmit({ currentPassword, password }) {
    updateUser({ currentPassword, password }, { onSuccess: () => reset() });
  }

  return (
    <Form type="reguler" onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Current password" error={errors?.currentPassword?.message}>
        <Input
          type="password"
          id="currentPassword"
          autoComplete="current-password"
          disabled={isPending}
          {...register("currentPassword", {
            required: "This field is required",
          })}
        />
      </FormRow>

      <FormRow
        label="New password (min 8 characters)"
        error={errors?.password?.message}>
        <Input
          type="password"
          id="password"
          autoComplete="new-password"
          disabled={isPending}
          {...register("password", {
            required: "This field is required",
            minLength: {
              value: 8,
              message: "Password needs a minimum of 8 characters",
            },
          })}
        />
      </FormRow>

      <FormRow
        label="Confirm new password"
        error={errors?.passwordConfirm?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          id="passwordConfirm"
          disabled={isPending}
          {...register("passwordConfirm", {
            required: "This field is required",
            validate: (value) =>
              getValues().password === value || "Passwords need to match",
          })}
        />
      </FormRow>
      <FormRow>
        <Button type="reset" variation="secondary">
          Cancel
        </Button>
        <Button disabled={isPending}>Save password</Button>
      </FormRow>
    </Form>
  );
}

export default UpdatePasswordForm;
