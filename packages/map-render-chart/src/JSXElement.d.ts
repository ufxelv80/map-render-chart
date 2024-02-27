declare namespace JSX {
  interface ElementAttributesProperty {
    props: any
  }
  interface IntrinsicElements {
    [elemName: string]: any
  }

  interface Element {}
}