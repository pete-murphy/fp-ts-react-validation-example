import React, { ReactNode, useState } from "react"
import { some, toNullable } from "fp-ts/lib/Option"
import { Lens } from "monocle-ts"
import { pipe } from "fp-ts/lib/pipeable"
import { sequenceS } from "fp-ts/lib/Apply"
import { css } from "styled-components"
import "styled-components/macro"

import { Form, focus, form, map } from "src/lib/Form"
import { validated, nonEmpty } from "src/lib/Validator"
import { Label, Main } from "src/simple/Simple.styles"

type Person = {
  name: string
  email: string
}

const mkPersonLens = Lens.fromProp<Person>()
const nameLens = mkPersonLens("name")
const emailLens = mkPersonLens("email")

const textInput = (label: string): Form<string, string> => input => ({
  ui: handleChange => (
    <Label>
      <span>{label}</span>
      <input onChange={e => handleChange(e.target.value)} />
    </Label>
  ),
  result: some(input),
})

const personForm: Form<Person, ReactNode> = pipe(
  sequenceS(form)({
    name: pipe(textInput("Name"), validated(nonEmpty("Name")), focus(nameLens)),
    email: pipe(
      textInput("Email"),
      validated(nonEmpty("Email")),
      focus(emailLens),
    ),
  }),
  map(({ name, email }) => (
    <p>
      {name} has email address: {email}
    </p>
  )),
)

export function Complicated() {
  const [person, setPerson] = useState<Person>({
    name: "",
    email: "",
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
      <form
        css={css`
          padding: 0 2rem;
        `}
      >
        <div>{personForm(person).ui(setPerson)}</div>
        <div>{pipe(personForm(person).result, toNullable)}</div>
      </form>
    </Main>
  )
}
