import { Newtype, prism } from "newtype-ts"

export interface NonEmptyString
  extends Newtype<{ readonly NonEmptyString: unique symbol }, string> {}

const isNonEmpty = (str: string) => str.length > 0

export const fromString = prism<NonEmptyString>(isNonEmpty).getOption
