import "@testing-library/jest-dom";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(qualifiedName: string, value?: string): R;
      toHaveValue(value: string | string[] | number): R;
      toBeDisabled(): R;
    }
  }
}