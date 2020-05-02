import { Either } from "fp-ts/lib/Either"
import { Newtype, iso } from "newtype-ts"
import { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray"

export type FormValidationState = Either<
  ReadonlyNonEmptyArray<ValidationError>,
  ValidatedForm
>

export enum ValidationError {
  EmptyField = "EmptyField",
  TooShort = "TooShort",
  TooLong = "TooLong",
  InvalidEmail = "InvalidEmail",
  NoSpecialChar = "NoSpecialChar",
}

export type ValidatedForm = {
  email: Email
  password: Password
}

export interface Email
  extends Newtype<{ readonly Email: unique symbol }, string> {}
export interface Password
  extends Newtype<{ readonly Password: unique symbol }, string> {}

export const isoEmail = iso<Email>()
export const isoPassword = iso<Password>()
