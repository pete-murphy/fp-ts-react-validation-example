import {
  Either,
  left,
  right,
  fold as foldEither,
  fromPredicate,
} from "fp-ts/lib/Either"
import {
  Option,
  fold as foldOption,
  fromEither,
  chain as chainOption,
} from "fp-ts/lib/Option"
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

const validEmailRE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const isValidEmail: Validator<string, string> = fromPredicate(
  (e: string) => validEmailRE.test(e),
  () => "Invalid email",
)

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
  blurred: boolean
}

export const validated = <I, A, B>(v: Validator<I, B>) => (
  fa: FormBuilder<Validated<I>, A>,
): FormBuilder<Validated<I>, B> => input => {
  const { ui, result } = fa(input)
  const err = v(input.value)
  return {
    ui: handler =>
      displayValidationError(
        input.modified && input.blurred,
        err,
        ui(({ value, blurred }) => handler({ value, modified: true, blurred })),
      ),
    result: pipe(
      result,
      chainOption(() => fromEither(err)),
    ),
  }
}
