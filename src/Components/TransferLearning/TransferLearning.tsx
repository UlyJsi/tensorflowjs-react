import React, { Component } from 'react';
import { Input, Radio, Spin, Icon } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';

import { Props, State, BTN_TYPES } from './TransferLearning.types';

const { Group, Button } = Radio;

export class TransferLearning extends Component<Props, State> {
  video: any = null;
  model = 'MobileNet';
  trainingClassNum = 3;
  mobilenet: any = null;
  classifier: any = null;
  videoLabel: string | null = null;

  state: State = {
    loading: false,
    trainingExamples: [],
    trainExamplCounter: 0,
    actionBtn: BTN_TYPES.add
  };

  componentWillUnmount() {
    this.video = null;
  }

  // EVENT HANDLERS
  handleLoadingMode = (loading: boolean) => this.setState({ loading });
  handleActionBtn = (e: RadioChangeEvent) =>
    this.setState({ actionBtn: e.target.value });
  onAddClick = () =>
    this.setState({ trainExamplCounter: this.state.trainExamplCounter + 1 });
  onTrainClick = () => {
    this.handleLoadingMode(true);
    this.props.classifier.train(this.onTrainExamples);
  };

  onSingleExampleTrain = (value: string, index: number) => {
    const { trainingExamples } = this.state;
    // single training
    this.props.classifier.addImage(value);

    // UI stuff
    if (trainingExamples[index]) {
      trainingExamples[index].counter += 1;
    } else {
      trainingExamples.push({ key: value, counter: 1 });
    }

    this.setState({ trainingExamples });
  };

  // TRAINING
  onTrainExamples = (loss: number | null) => {
    if (loss === null) {
      this.handleLoadingMode(false);
      console.log('Trainning is completed !!!');

      this.props.classifier.classify(this.onResultsReady);
    } else {
      console.log('Loss value:', loss);
    }
  };

  onResultsReady = (
    err: string,
    results: { [k: string]: string | number }[]
  ) => {
    if (err) {
      console.log(err);
    } else {
      // UI stuff
      const label = String(results[0].label).toUpperCase();
      this.props.getTLLabel(label);

      // looping training
      this.props.classifier.classify(this.onResultsReady);
      this.setState({ trainingExamples: [] });
    }
  };

  // UI STUFF
  renderTrainingExamples = () => {
    const { Search } = Input;
    const { trainingExamples, trainExamplCounter, loading } = this.state;

    const examples = [];

    for (let i = 0; i < trainExamplCounter; i++) {
      const counter = trainingExamples[i] ? trainingExamples[i].counter : null;

      examples.push(
        <Search
          key={i}
          disabled={loading}
          placeholder='Train expample'
          enterButton={`+ ${counter || 0}`}
          onSearch={(value: string) => this.onSingleExampleTrain(value, i)}
        />
      );
    }

    return <>{examples}</>;
  };

  render() {
    const { loading, trainingExamples } = this.state;

    return (
      <div id='tl-wrapper'>
        <div className='flex m'>
          {loading && (
            <div className='m'>
              <Spin size='large' indicator={<Icon type='loading' />} />
            </div>
          )}
          <Group value={this.state.actionBtn} onChange={this.handleActionBtn}>
            <Button
              disabled={loading}
              value={BTN_TYPES.add}
              onClick={this.onAddClick}
            >
              Add
            </Button>
            <Button
              disabled={loading || !trainingExamples.length}
              value={BTN_TYPES.train}
              onClick={this.onTrainClick}
            >
              Train
            </Button>
          </Group>
          {this.renderTrainingExamples()}
        </div>
      </div>
    );
  }
}
