import styled, { css } from "styled-components"

export const inputStyle = css`
  outline: none;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  &:focus {
    box-shadow: 0 0 0 3px #1d70b899, 0 0 0 4px #1d70b833;
  }
`

export const Row = styled.div`
  padding: 1rem 0;
`

export const Label = styled.label`
  display: flex;
  flex-flow: column;
  > span {
    padding-bottom: 0.5rem;
  }
  > input {
    padding: 0.5rem;
    background: #f3f2f1;
    ${inputStyle}
  }
`

export const Main = styled.main`
  width: 80vw;
  max-width: 25rem;
  margin: 0 auto;
`

export const Form = styled.form`
  padding: 0 2rem;
`

export const Button = styled.button`
  padding: 0.5rem 1rem;
  float: right;
  font-size: 1rem;
  background: #003078;
  color: white;
  ${inputStyle}
  &:focus {
    background: #ffdd00;
    color: black;
  }
  &:active {
    background: white;
  }
`
