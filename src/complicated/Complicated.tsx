import React, { ReactNode, useState } from "react"
import { some } from "fp-ts/lib/Option"
import { Lens } from "monocle-ts"
import { pipe } from "fp-ts/lib/pipeable"
import { sequenceS } from "fp-ts/lib/Apply"

import { Form, focus, form, map } from "src/lib/Form"

type Person = {
  name: string
  email: string
}

const mkPersonLens = Lens.fromProp<Person>()
const nameLens = mkPersonLens("name")
const emailLens = mkPersonLens("email")

const textInput = (label: string): Form<string, string> => input => ({
  ui: handleChange => (
    <label>
      {label}
      <input onChange={e => handleChange(e.target.value)} />
    </label>
  ),
  result: some(input),
})

const personForm: Form<Person, ReactNode> = pipe(
  sequenceS(form)({
    name: focus(nameLens)(textInput("Name")),
    email: focus(emailLens)(textInput("Email")),
  }),
  map(({ name, email }) => (
    <p>
      {name} has email address: {email}
    </p>
  )),
)

export function Complicated() {
  const [person, setPerson] = useState<Person>({ name: "", email: "" })
  return <>{personForm(person).ui(setPerson)}</>
}
