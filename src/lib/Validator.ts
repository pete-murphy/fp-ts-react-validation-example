import { Either, left, right } from "fp-ts/lib/Either"
import { Option, fold as foldOption } from "fp-ts/lib/Option"

import * as NES from "src/lib/NonEmptyString"
import { NonEmptyString } from "src/lib/NonEmptyString"
import { flow } from "fp-ts/lib/function"
import { Eq } from "fp-ts/lib/Eq"

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
