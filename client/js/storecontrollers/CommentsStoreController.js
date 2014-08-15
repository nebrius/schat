import { aggregator } from 'aggregator';

export class CommentsStoreController {
  render() {
    return {
      commentList: [
        'I am a comment',
        'I am another comment'
      ]
    };
  }
  onConnected() {
    aggregator.update();
  }
}
