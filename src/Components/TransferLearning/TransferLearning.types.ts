export type Props = {
  p5Lib: any,
  classifier: any,
  getTLLabel: (label: string) => void;
};
export type State = {
  loading: boolean,
  actionBtn: string,
  trainExamplCounter: number,
  trainingExamples: {
    key: string,
    counter: number
  }[]
};

export enum BTN_TYPES {
  add = 'add',
  train = 'train'
};