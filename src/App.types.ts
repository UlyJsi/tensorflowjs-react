export type State = {
  loading: boolean,
  selectedModel: string | null,
}

export type MlModels = {
  [k: string]: {
    label: string,
    component: React.ReactNode
  }
};

export type ModelsDict = {
  imageClassification: string,
  objectDetection: string,
  transferLearning: string
};

export type ODResults = {
  label: string,
  confidence: number,
  x: number,
  y: number,
  w: number,
  h: number
}[];