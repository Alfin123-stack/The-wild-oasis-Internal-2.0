"use client";

import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import useSignup from "./useSignup";
import SpinnerMini from "../../ui/SpinnerMini";
import Heading from "../../ui/Heading";

// Email regex: /\S+@\S+\.\S+/

function SignupForm({ onClose }) {
  const { isPending, signup } = useSignup();
  const { register, handleSubmit, reset, getValues, formState } = useForm();
  const { errors } = formState;

  function onSubmit({ fullName, email, password }) {
    signup(
      { fullName, email, password },
      {
        onSuccess: () => {
          reset();
          onClose?.();
        },
      }
    );
  }
  return (
    <Form onSubmit={handleSubmit(onSubmit)} type={onClose ? "modal" : "reguler"}>
      {onClose && (
        <div style={{ marginBottom: "2rem" }}>
          <Heading as="h2">Add user</Heading>
        </div>
      )}
      <FormRow
        label="Full name"
        error={errors?.fullName?.message}>
        <Input
          disabled={isPending}
          type="text"
          id="fullName"
          placeholder="e.g. Putri Anindya"
          autoComplete="off"
          maxLength={80}
          {...register("fullName", {
            required: "Please enter the staff member's full name",
            validate: (v) => v.trim().length > 1 || "Please enter the full name",
          })}
        />
      </FormRow>

      <FormRow label="Email address" error={errors?.email?.message}>
        <Input
          disabled={isPending}
          type="email"
          id="email"
          placeholder="name@yourhotel.com"
          autoComplete="off"
          {...register("email", {
            required: "Please enter an email address",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
        />
      </FormRow>

      <FormRow
        label="Password (min 8 characters)"
        error={errors?.password?.message}>
        <Input
          disabled={isPending}
          type="password"
          id="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          {...register("password", {
            required: "Please enter a password",
            minLength: {
              value: 8,
              message: "Password needs a minimum of 8 characters",
            },
          })}
        />
      </FormRow>

      <FormRow label="Repeat password" error={errors?.passwordConfirm?.message}>
        <Input
          disabled={isPending}
          type="password"
          id="passwordConfirm"
          placeholder="Type the same password again"
          autoComplete="new-password"
          {...register("passwordConfirm", {
            required: "Please type the password again",
            validate: (value) =>
              value === getValues().password ||
              "Passwords do not match",
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button disabled={isPending} variation="secondary" type="reset" onClick={() => onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isPending}>
          {isPending ? <SpinnerMini /> : "Create user"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default SignupForm;
