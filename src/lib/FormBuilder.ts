import { ReactNode } from "react"
import { Applicative2 } from "fp-ts/lib/Applicative"
import { Lens } from "monocle-ts"
import {
  Option,
  map as mapOption,
  ap as apOption,
  some,
} from "fp-ts/lib/Option"
import { pipe, pipeable } from "fp-ts/lib/pipeable"

import { monoidJsx } from "src/lib/Monoid"

declare module "fp-ts/lib/HKT" {
  interface URItoKind2<E, A> {
    readonly FormBuilder: FormBuilder<E, A>
  }
}

export const URI = "FormBuilder"

export type URI = typeof URI

export interface FormBuilder<E, A> {
  (input: E): {
    ui: (handler: (i: E) => void) => ReactNode
    result: Option<A>
  }
}

export function of<E, A>(a: A): FormBuilder<E, A> {
  return (_input: E) => ({
    ui: _handler => monoidJsx.empty,
    result: some(a),
  })
}

export const formBuilder: Applicative2<URI> = {
  URI,
  map: (ma, f) => input => ({
    ui: ma(input).ui,
    result: pipe(ma(input).result, mapOption(f)),
  }),
  of,
  ap: (mab, ma) => input => ({
    ui: f => monoidJsx.concat(mab(input).ui(f), ma(input).ui(f)),
    result: pipe(mab(input).result, apOption(ma(input).result)),
  }),
}

export const { map, ap } = pipeable(formBuilder)

export const focus = <I, J>(lens: Lens<I, J>) => <A>(
  form: FormBuilder<J, A>,
): FormBuilder<I, A> => {
  return input => {
    const { ui, result } = form(lens.get(input))
    return {
      ui: handler => ui(x => handler(lens.set(x)(input))),
      result,
    }
  }
}

export const withValue = <I, A>(
  f: (i: I) => FormBuilder<I, A>,
): FormBuilder<I, A> => input => f(input)(input)

// From Max Willmott's example (https://github.com/Willmo36/form-ts)
export const mapUI = (f: (ui: ReactNode) => ReactNode) => <E, A>(
  form: FormBuilder<E, A>,
): FormBuilder<E, A> => input => ({
  result: form(input).result,
  ui: handler => f(form(input).ui(handler)),
})
