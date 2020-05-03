import React, { ChangeEventHandler } from "react"
import { Lens } from "monocle-ts"
import { Either, mapLeft, getValidation, chain, fold } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as NEA from "fp-ts/lib/ReadonlyNonEmptyArray"
import * as A from "fp-ts/lib/ReadonlyArray"
import { sequence_ } from "src/lib/Foldable"

type FormProps<FormState, E> = {
  formState: FormState
  formFields: NEA.ReadonlyNonEmptyArray<TextInput<FormState, E>>
}

type TextInput<FormState, E> = {
  lens: Lens<FormState, string>
  validators: (s: string) => ReadonlyArray<Either<E, string>>
  // validators: ReadonlyArray<Validator<FormState, string, E>>
}

// type Validator<S, A, E> = (
//   context: S,
//   scrutinee: A,
// ) => Either<ReadonlyNonEmptyArray<E>, A>

export function Form<FormState, E = never>(props: FormProps<FormState, E>) {
  return (
    <form>
      {props.formFields.map(f => {
        const value = f.lens.get(props.formState)
        const onChange: ChangeEventHandler<HTMLInputElement> = event =>
          f.lens.set(event.target.value)(props.formState)

        const V = getValidation(NEA.getSemigroup<E>())

        const validationState = pipe(
          f.validators(value),
          A.map(mapLeft(NEA.readonlyNonEmptyArray.of)),
          sequence_(V, A.readonlyArray),
          chain(() => V.of(value)),
        )

        return (
          <>
            <input type="text" value={value} onChange={onChange} />
            {pipe(
              validationState,
              fold(
                errs => <p>{JSON.stringify(errs)}</p>,
                () => null,
              ),
            )}
          </>
        )
      })}
      <button>Submit</button>
    </form>
  )
}
