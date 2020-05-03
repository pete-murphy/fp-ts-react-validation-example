import { Either, left, right, fold as foldEither } from "fp-ts/lib/Either"
import { Option, fold as foldOption, fromEither } from "fp-ts/lib/Option"
import { flow } from "fp-ts/lib/function"
import { Eq } from "fp-ts/lib/Eq"
import { ReactNode, createElement } from "react"
import { pipe } from "fp-ts/lib/pipeable"

import { Form } from "src/lib/Form"
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
  E.equals(value1, value2) ? right(value1) : left(error)

const displayValidationError = <A>(
  err: Either<string, A>,
  node: ReactNode,
): ReactNode =>
  pipe(
    err,
    foldEither(
      e =>
        createElement(
          "p",
          {
            style: { color: "tomato" },
          },
          e,
        ),
      _ => monoidJsx.empty,
    ),
    el => createElement(Row, null, monoidJsx.concat(node, el)),
  )

export const validated = <I, A, B>(v: Validator<I, B>) => (
  fa: Form<I, A>,
): Form<I, B> => (input: I) => ({
  ui: handler => displayValidationError(v(input), fa(input).ui(handler)),
  result: fromEither(v(input)),
})
