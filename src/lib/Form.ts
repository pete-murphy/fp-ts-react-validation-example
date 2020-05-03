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
    readonly Form: Form<E, A>
  }
}

export const URI = "Form"

export type URI = typeof URI

export interface Form<E, A> {
  (input: E): {
    ui: (handler: (i: E) => void) => ReactNode
    result: Option<A>
  }
}

export function of<E, A>(a: A): Form<E, A> {
  return (_input: E) => ({
    ui: _handler => monoidJsx.empty,
    result: some(a),
  })
}

export const form: Applicative2<URI> = {
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

export const { map, ap } = pipeable(form)

export const focus = <I, J>(lens: Lens<I, J>) => <A>(
  form: Form<J, A>,
): Form<I, A> => {
  return input => {
    const { ui, result } = form(lens.get(input))
    return {
      ui: handler => ui(x => handler(lens.set(x)(input))),
      result,
    }
  }
}
