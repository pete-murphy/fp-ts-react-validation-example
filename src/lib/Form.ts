import { Fragment, ReactNode } from "react"
import { Applicative2 } from "fp-ts/lib/Applicative"
import { monoidJsx } from "src/lib/Monoid"
import { Lens } from "monocle-ts"

declare module "fp-ts/lib/HKT" {
  interface URItoKind2<E, A> {
    readonly Form: Form<E, A>
  }
}

export const URI = "Form"

export type URI = typeof URI

type UI = ReactNode

interface Form<E, A> {
  (input: E): {
    ui: (f: (i: E) => void) => UI
    result: A
  }
}

export const form: Applicative2<URI> = {
  URI,
  map: (ma, f) => input => ({
    ui: ma(input).ui,
    result: f(ma(input).result),
  }),
  of: a => _input => ({
    ui: _f => Fragment,
    result: a,
  }),
  ap: (mab, ma) => input => ({
    ui: f => monoidJsx.concat(mab(input).ui(f), ma(input).ui(f)),
    result: mab(input).result(ma(input).result),
  }),
}

// focus :: forall i j a. Lens' i j -> Form j a -> Form i a
// focus l (Form f) =
//   Form \i ->
//     let
//       { ui, result } = f (view l i)
//     in
//       { ui: \onChange -> ui (onChange <<< flip (set l) i)
//       , result
//       }

export const focus = <I, J>(lens: Lens<I, J>) => <A>(
  form: Form<J, A>,
): Form<I, A> => {
  return input => {
    const { ui, result } = form(lens.get(input))
    return {
      ui: onChange => ui(x => onChange(lens.set(x)(input))),
      result,
    }
  }
}
