"use client";

import { useState } from "react";
import styled from "styled-components";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import FormRowVertical from "../../ui/FormRowVertical";
import useLogin from "./useLogin";
import SpinnerMini from "../../ui/SpinnerMini";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const PasswordWrap = styled.div`
  position: relative;

  & input { padding-right: 4.4rem; }
  & button {
    position: absolute;
    right: 0.6rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0.6rem;
  }
  & svg { width: 2rem; height: 2rem; color: var(--color-grey-500); }
`;

const Alert = styled.p`
  padding: 1rem 1.4rem;
  border: 1px solid var(--color-danger-border);
  background-color: var(--status-alert-bg);
  color: var(--status-alert-fg);
  border-radius: var(--radius-inputs);
  font-size: 1.3rem;
`;

function LoginForm() {
  const { isPending, login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    login(
      { email, password },
      {
        onError: (err) => {
          setError(err?.message || "Email or password is incorrect");
          setPassword("");
        },
      }
    );
  }

  return (
    <StyledForm onSubmit={handleSubmit} noValidate>
      {error && <Alert role="alert">{error}</Alert>}
      <FormRowVertical label="Email address">
        <Input
          disabled={isPending}
          type="email"
          id="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormRowVertical>
      <FormRowVertical label="Password">
        <PasswordWrap>
          <Input
            disabled={isPending}
            type={show ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
          </button>
        </PasswordWrap>
      </FormRowVertical>
      <div style={{ paddingTop: "1rem" }}>
        <Button disabled={isPending} size="large" style={{ width: "100%" }}>
          {isPending ? <SpinnerMini /> : "Sign in"}
        </Button>
      </div>
    </StyledForm>
  );
}

export default LoginForm;
