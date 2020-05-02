import React, { useState, ChangeEventHandler } from "react"
import { Option, none, some, fold as foldOption } from "fp-ts/lib/Option"
import { fold as foldEither } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"

import {
  Main,
  Form,
  Row,
  Label,
  Button,
  SuccessContainer,
  ErrorContainer,
} from "src/simple/Simple.styles"
import { FormValidationState } from "src/simple/Simple.types"
import { validateForm } from "src/simple/validateForm"

export function Simple() {
  const [email, handleEmailChange] = useInput("")
  const [password, handlePasswordChange] = useInput("")
  const [formValidationState, setFormValidationState] = useState<
    Option<FormValidationState>
  >(none)
  return (
    <Main>
      <h1>Signup form</h1>
      <Form
        onSubmit={e => {
          e.preventDefault()
          setFormValidationState(
            pipe(
              validateForm({
                email,
                password,
              }),
              some,
            ),
          )
        }}
      >
        <Row>
          <Label>
            <span>Email</span>
            <input value={email} onChange={handleEmailChange} />
          </Label>
        </Row>
        <Row>
          <Label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="off"
            />
          </Label>
        </Row>
        <Row>
          <Button>Submit</Button>
        </Row>
        <Row>
          {pipe(
            formValidationState,
            foldOption(
              () => null,
              foldEither(
                errors => (
                  <ErrorContainer>
                    <h2>Error</h2>
                    <ul>
                      {errors.map(e => (
                        <li>{e}</li>
                      ))}
                    </ul>
                  </ErrorContainer>
                ),
                validForm => (
                  <SuccessContainer>
                    <h2>Success!</h2>
                    <p>Registered with email {validForm.email}!</p>
                  </SuccessContainer>
                ),
              ),
            ),
          )}
        </Row>
      </Form>
    </Main>
  )
}

function useInput(
  initialValue: string,
): [string, ChangeEventHandler<HTMLInputElement>] {
  const [value, setValue] = useState(initialValue)
  const changeHandler: ChangeEventHandler<HTMLInputElement> = e => {
    setValue(e.currentTarget.value)
  }
  return [value, changeHandler]
}
