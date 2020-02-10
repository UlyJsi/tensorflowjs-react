import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Select, message, Button, Spin, Icon } from 'antd';

import { imageNetClasses } from '../../models/imagenet';
import { Props, State, MappedResult } from './ImageClassification.types';

const MobileNet = 'mobilenet';

export class ImageClassification extends Component<Props, State> {
  state: State = {
    selectedModel: MobileNet,
    file: null,
    results: [],
    loading: false
  };
  model: any = null;
  pickedImage: any = null;

  componentDidMount = () => {
    this.onLoadModel();
  };

  preprocessImage() {
    const tensor = tf.fromPixels(this.pickedImage).resizeNearestNeighbor([224, 224]).toFloat();

    const offset = tf.scalar(127.5);
    return tensor.sub(offset).div(offset).expandDims();
  };

  onLoadModel = async () => {
    this.setState({ loading: true });

    this.model = await tf.loadModel('https://raw.githubusercontent.com/UlyJsi/tensorflowjs-react/master/src/models/mobilenet/model.json');

    this.setState({ loading: false });
    console.log('Model is loaded !')
  };

  onUploadImg = (event: any) => {
    this.setState({ results: [] });
    this.setState({
      file: URL.createObjectURL(event.target.files[0])
    });

    this.pickedImage = document.getElementById('picked-img');
    message.success(`File uploaded successfully`);
  };

  onPredictClick = async () => {
    let tensor = this.preprocessImage();
    const prediction = await this.model.predict(tensor).data();

    // structuring data helpers - START
    const mapClassesToResults = (prediction: number[]) => {
      return Array.from(prediction).map((p, index) => {
        return {
          probability: p,
          // @ts-ignore
          className: imageNetClasses[index]
        };
      });
    }

    const descSortResults = (prediction: MappedResult[]) => {
      return prediction.sort((a: MappedResult, b: MappedResult) => {
        return b.probability - a.probability;
      });
    };

    const getMostProbableResults = (prediction: MappedResult[]) => {
      return prediction.slice(0, 5);
    };
    // structuring data helpers - END

    const mappedPredictionResults = mapClassesToResults(prediction);
    const sortedPredictionResults = descSortResults(mappedPredictionResults);
    const mostProbableResults = getMostProbableResults(sortedPredictionResults);

    this.setState({ results: mostProbableResults });
  };

  // UI STUFF
  renderResultsInformation = () => {
    return (
      <ul className="results-info">
        {this.state.results.map((result: MappedResult) =>
          <li key={result.probability}>probability: <span className="red-font">{result.probability.toFixed(2)}</span>, name: <span className="red-font">{result.className.toLocaleUpperCase()}</span></li>
        )}
      </ul>
    )
  };

  render() {
    const { file, selectedModel, loading } = this.state;

    if (loading) return <Spin className="m" size='large' indicator={<Icon type='loading' />} />;

    return (
      <div className="image-classification">
        <div className="box">
          <Select value={selectedModel} style={{ marginRight: 12 }} disabled={true}>
            <Select.Option key={MobileNet} value={MobileNet}>MobileNet</Select.Option>
          </Select>
          <input type="file" onChange={this.onUploadImg}/>
          <Button type="danger" disabled={!file} onClick={this.onPredictClick}>Predict</Button>
        </div>
        <div className="flex box">
          <img id="picked-img" src={file} alt="" />
          {file && this.renderResultsInformation()}
        </div>
      </div>
    );
  }
};