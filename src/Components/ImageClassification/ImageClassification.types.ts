export type State = {
  selectedModel: string,
  file: FileList | null | any,
  results: MappedResult[],
  loading: boolean
}

export type Props = {};
export type MappedResult = {
  probability: number,
  className: string
};