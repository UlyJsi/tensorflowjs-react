import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Select } from 'antd';

import { Props, State } from './ImageClassification.types';

const MobileNet = 'mobilenet';

export class ImageClassification extends Component<Props, State> {
  state: State = {
    selectedModel: null
  }
  model: any | null = null;

  onModelSelect = (model: string) => {
    this.setState({ selectedModel: model });
    this.onLoadModel();
  };

  onLoadModel = async () => {
    this.model = await tf.loadModel('https://github.com/UlyJsi/tensorflowjs-react/blob/master/src/models/mobilenet/model.json');

    console.log(this.model)
  }

  render() {
    return (
      <div className='flex m'>
        <Select defaultValue="Select model" onChange={this.onModelSelect}>
          <Select.Option key={MobileNet} value={MobileNet}>MobileNet</Select.Option>
        </Select>
      </div>
    )
  }
};