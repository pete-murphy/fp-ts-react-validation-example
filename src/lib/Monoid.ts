import { Monoid } from "fp-ts/lib/Monoid"
import { FlattenSimpleInterpolation, css } from "styled-components"
import { ReactNode, Fragment, createElement } from "react"

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
