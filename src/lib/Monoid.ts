import { Monoid } from "fp-ts/lib/Monoid"
import { FlattenSimpleInterpolation, css } from "styled-components"
import { ReactNode, Fragment, createElement } from "react"

/**
 * This module is experimental, but the idea is to explore how many UI-type
 * things can be expressed as type class instances. Monoid is a pretty simple
 * place to start.
 */
export const monoidCss: Monoid<FlattenSimpleInterpolation> = {
  concat: (x, y) => css`
    ${x}
    ${y}
  `,
  empty: css``,
}

export const monoidJsx: Monoid<ReactNode> = {
  concat: (x, y) => createElement(Fragment, { children: [x, y] }),
  empty: Fragment,
}
