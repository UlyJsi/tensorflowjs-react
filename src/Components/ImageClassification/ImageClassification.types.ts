export type State = {
  selectedModel: string,
  file: FileList | null | any,
  results: MappedResult[]
}

export type Props = {};
export type MappedResult = {
  probability: number,
  className: string
};