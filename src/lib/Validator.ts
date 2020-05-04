import { Either, left, right, fold as foldEither } from "fp-ts/lib/Either"
import { Option, fold as foldOption, fromEither } from "fp-ts/lib/Option"
import { flow } from "fp-ts/lib/function"
import { Eq } from "fp-ts/lib/Eq"
import { ReactNode, createElement } from "react"
import { pipe } from "fp-ts/lib/pipeable"

import { FormBuilder } from "src/lib/FormBuilder"
import { monoidJsx } from "src/lib/Monoid"
import * as NES from "src/lib/NonEmptyString"
import { NonEmptyString } from "src/lib/NonEmptyString"
import { Row } from "src/simple/Simple.styles"

export type Validator<I, A> = (i: I) => Either<string, A>

export const nonNull = <A>(name: string): Validator<Option<A>, A> =>
  foldOption(() => left(`${name} is required`), right)

export const nonEmpty = (name: string): Validator<string, NonEmptyString> =>
  flow(
    NES.fromString,
    foldOption(() => left(`${name} is required`), right),
  )

export const mustEqual = <A>(E: Eq<A>) => (
  value1: A,
  error: string,
): Validator<A, A> => (value2: A) =>
  E.equals(value1, value2) ? right(value2) : left(error)

const displayValidationError = <A>(
  modified: boolean,
  err: Either<string, A>,
  node: ReactNode,
): ReactNode =>
  pipe(
    err,
    foldEither(
      e =>
        modified
          ? createElement(
              "p",
              {
                style: { color: "tomato" },
              },
              e,
            )
          : monoidJsx.empty,
      _ => monoidJsx.empty,
    ),
    el => createElement(Row, null, monoidJsx.concat(node, el)),
  )

export type Validated<A> = {
  value: A
  modified: boolean
}

export const validated = <I, A, B>(v: Validator<I, B>) => (
  fa: FormBuilder<I, A>,
): FormBuilder<Validated<I>, B> => input => {
  const { ui } = fa(input.value)
  const err = v(input.value)
  return {
    ui: handler =>
      displayValidationError(
        input.modified,
        err,
        ui(value => handler({ value, modified: true })),
      ),
    result: fromEither(err),
  }
}
