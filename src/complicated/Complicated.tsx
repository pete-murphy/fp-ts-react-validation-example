import React, { ReactNode, useState } from "react"
import { some, toNullable } from "fp-ts/lib/Option"
import { Lens } from "monocle-ts"
import { pipe } from "fp-ts/lib/pipeable"
import { sequenceS } from "fp-ts/lib/Apply"
import "styled-components/macro"

import { Form, focus, form, map } from "src/lib/Form"
import { validated, nonEmpty, mustEqual } from "src/lib/Validator"
import { eqString } from "fp-ts/lib/Eq"
import { Label, Form as StyledForm, Main } from "src/simple/Simple.styles"
import { css } from "styled-components"

type PersonForm = {
  name: string
  email: string
  confirmEmail: string
}

const mkPersonLens = Lens.fromProp<PersonForm>()
const nameLens = mkPersonLens("name")
const emailLens = mkPersonLens("email")
const confirmEmailLens = mkPersonLens("confirmEmail")

const textInput = (label: string): Form<string, string> => input => ({
  ui: handleChange => (
    <Label>
      <span>{label}</span>
      <input onChange={e => handleChange(e.target.value)} />
    </Label>
  ),
  result: some(input),
})

const personForm: Form<PersonForm, ReactNode> = pipe(
  sequenceS(form)({
    name: pipe(textInput("Name"), validated(nonEmpty("Name")), focus(nameLens)),
    email: pipe(
      textInput("Email"),
      validated(nonEmpty("Email")),
      focus(emailLens),
    ),
    confirmEmail: pipe(
      textInput("Confirm email"),
      validated(mustEqual(eqString)("foo", "Emails must be equal")),
      focus(confirmEmailLens),
    ),
  }),
  map(({ name, email }) => (
    <p>
      {name} has email address: {email}
    </p>
  )),
)

export function Complicated() {
  const [person, setPerson] = useState<PersonForm>({
    name: "",
    email: "",
    confirmEmail: "",
  })
  return (
    <Main>
      <h1
        css={css`
          color: tomato;
        `}
      >
        Currently broken{" "}
        <span role="img" aria-label="sad face">
          ☹️
        </span>
      </h1>
      <StyledForm>
        <div>{personForm(person).ui(setPerson)}</div>
        <div>{pipe(personForm(person).result, toNullable)}</div>
      </StyledForm>
    </Main>
  )
}
