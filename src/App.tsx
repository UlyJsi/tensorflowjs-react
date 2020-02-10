import React, { Component } from 'react';
import { Layout, Menu, Spin, Icon } from 'antd';
import * as p5Lib from 'p5';
import * as ml5 from 'ml5';
import Sketch from 'react-p5';
import { TransferLearning } from './Components/TransferLearning/TransferLearning';
import { ImageClassification } from './Components/ImageClassification/ImageClassification';

import { State, MlModels, ModelsDict, ODResults } from './App.types';

const MODELS: ModelsDict = {
  imageClassification: 'imageClassification',
  objectDetection: 'objectDetection',
  transferLearning: 'transferLearning'
};

const { Header, Content, Footer } = Layout;
const p5 = new p5Lib();

class MainApp extends Component {
  state: State = {
    loading: false,
    selectedModel: null
  };

  width: number = 1000;
  height: number = 700;
  mobilenet: any = null;
  classifier: any = null;
  objects: ODResults = [];
  video: any = null;
  trainingClassNum: number = 3;
  tlLabel: string | null = null;
  model: any = null;

  setup = () => {
    const { selectedModel } = this.state;

    if (selectedModel === MODELS.imageClassification) {
      this.video = null;
      p5.remove();

      return;
    }

    if (this.video === null) {
      p5.createCanvas(this.width, this.height)
        .parent('main-wrapper')
        .id('main-canvas');
      this.video = p5.createCapture(p5.VIDEO).parent('main-wrapper');
    }

    if (selectedModel === MODELS.objectDetection) {
      this.model = ml5.YOLO(this.video, this.onObjectDetect);
      this.setState({ loading: true });
    }

    if (selectedModel === MODELS.transferLearning) {
      this.model = 'MobileNet';
      this.mobilenet = ml5.featureExtractor(
        this.model,
        { numLabels: this.trainingClassNum },
        this.onTLModelReady
      );
      this.classifier = this.mobilenet.classification(this.video);
    }
  };

  // UI STUFF
  draw = () => {
    const { selectedModel } = this.state;

    if (selectedModel === MODELS.imageClassification) return;

    if (selectedModel === MODELS.objectDetection) {
      this.drawODLabel();
    }

    if (selectedModel === MODELS.transferLearning) {
      this.drawTLLabel();
    }
  };

  // UI STUFF
  drawODLabel = () => {
    p5.image(this.video, 0, 0, this.width, this.height);

    for (let i = 0; i < this.objects.length; i++) {
      const label = String(this.objects[i].label).toUpperCase();

      const xTextPosition = this.objects[i].x * this.width;
      const yTextPosition = this.objects[i].y * this.height - 5;

      const rectX = this.objects[i].x * this.width;
      const rectY = this.objects[i].y * this.height;
      const rectWidth = this.objects[i].w * this.width;
      const rectHeight = this.objects[i].h * this.height;

      p5.fill(11, 104, 255);
      p5.noStroke();
      p5.text(label, xTextPosition, yTextPosition);
      p5.noFill();
      p5.strokeWeight(4);
      p5.textSize(42);
      p5.stroke(11, 104, 255);
      p5.rect(rectX, rectY, rectWidth, rectHeight);
    }
  };

  // UI STUFF
  drawTLLabel = () => {
    const x = 100,
      y = 100;

    p5.image(this.video, 0, 0, this.width, this.height);
    p5.fill(11, 104, 255);
    p5.textSize(42);

    this.tlLabel && p5.text(this.tlLabel, x, y);
  };

  getTLLabel = (label: string) => {
    this.tlLabel = label;
  };

  getModels = (): MlModels => {
    return {
      [MODELS.imageClassification]: {
        label: 'Image classification',
        component: <ImageClassification />
      },
      [MODELS.objectDetection]: {
        label: 'Object detection',
        component: <></>
      },
      [MODELS.transferLearning]: {
        label: 'Transfer learning',
        component: (
          <TransferLearning
            p5Lib={p5}
            classifier={this.classifier}
            getTLLabel={this.getTLLabel}
          />
        )
      }
    };
  };

  onObjectDetect = () => {
    this.setState({ loading: false });
    console.log('Object detection model is ready !!!');

    if (this.model && typeof this.model !== 'string') {
      this.model.detect((err: string, results: ODResults) => {
        this.objects = results;
        this.onObjectDetect();
      });
    }
  };

  onModelSelect = ({ key }: { key: string }) => {
    this.setState({ selectedModel: key }, () => this.setup());
  };

  onTLModelReady = () => {
    console.log('Transfer learning model is ready !!!');
    this.setState({ loading: false });
  };

  render() {
    const { selectedModel, loading } = this.state;
    const models = this.getModels();

    return (
      <Layout>
        <Header>
          <Menu
            theme='dark'
            mode='horizontal'
            onClick={this.onModelSelect}
            style={{ lineHeight: '64px', textAlign: 'center' }}
          >
            {Object.keys(models).map(key => (
              <Menu.Item key={key}>{models[key].label}</Menu.Item>
            ))}
          </Menu>
        </Header>

        <Content
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column'
          }}
          id='main-wrapper'
        >
          {loading && (
            <div className='m'>
              <Spin size='large' indicator={<Icon type='loading' />} />
            </div>
          )}

          {selectedModel ? (
            <>
              {models[selectedModel].component}
              <Sketch setup={this.setup} draw={this.draw} />
            </>
          ) : <h1>Select module to start !</h1>}
        </Content>

        <Footer style={{ textAlign: 'center' }}>Made with fun &#9786;</Footer>
      </Layout>
    );
  }
}

export default MainApp;
