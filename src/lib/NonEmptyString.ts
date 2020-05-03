import { Newtype, prism } from "newtype-ts"

export interface NonEmptyString
  extends Newtype<{ readonly NonEmptyString: unique symbol }, string> {}

const isNonEmpty = (str: string) => str.length > 0

const prismNonEmptyString = prism<NonEmptyString>(isNonEmpty)

export const fromString = prismNonEmptyString.getOption
