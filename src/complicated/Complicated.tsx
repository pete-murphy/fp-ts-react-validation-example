import React, { ReactNode, useState } from "react"
import { some, toNullable, none } from "fp-ts/lib/Option"
import { Lens } from "monocle-ts"
import { pipe } from "fp-ts/lib/pipeable"
import { sequenceS, sequenceT } from "fp-ts/lib/Apply"
import {
  ReadonlyNonEmptyArray,
  map as mapNEA,
  readonlyNonEmptyArray,
} from "fp-ts/lib/ReadonlyNonEmptyArray"
import { reader } from "fp-ts/lib/Reader"
import { mapLeft, either, fold, fromPredicate } from "fp-ts/lib/Either"

import { Form, focus, form, map } from "src/lib/Form"
import { sequence_ } from "src/lib/Foldable"
import { validateLength } from "src/simple/validateForm"
import { Validator } from "src/lib/Validator"

type Person = {
  name: string
  email: string
}

const mkPersonLens = Lens.fromProp<Person>()
const nameLens = mkPersonLens("name")
const emailLens = mkPersonLens("email")

const textInput = (attrs: {
  label: string
  validators: ReadonlyNonEmptyArray<Validator<string, string>>
}): Form<string, string> => input => ({
  ui: handleChange => (
    <label>
      {attrs.label}
      <input onChange={e => handleChange(e.target.value)} />
    </label>
  ),
  result: pipe(
    input,
    sequenceT(reader)(attrs.validators[0], ...attrs.validators.slice(1)),
    mapNEA(mapLeft(readonlyNonEmptyArray.of)),
    sequence_(either, readonlyNonEmptyArray),
    fold(
      () => none,
      () => some(input),
    ),
  ),
})

const personForm: Form<Person, ReactNode> = pipe(
  sequenceS(form)({
    name: focus(nameLens)(
      textInput({
        label: "Name",
        validators: [validateLength({ min: 2, max: 100 })],
      }),
    ),
    email: focus(emailLens)(
      textInput({
        label: "Email",
        validators: [
          validateLength({ min: 6, max: 30 }),
          fromPredicate(
            (str: string) => str.includes("@"),
            () => "Invalid email",
          ),
        ],
      }),
    ),
  }),
  map(({ name, email }) => (
    <p>
      {name} has email address: {email}
    </p>
  )),
)

export function Complicated() {
  const [person, setPerson] = useState<Person>({ name: "", email: "" })
  return (
    <>
      <div>{personForm(person).ui(setPerson)}</div>
      <div>{pipe(personForm(person).result, toNullable)}</div>
    </>
  )
}
