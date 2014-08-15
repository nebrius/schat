import { aggregator } from 'aggregator';
import { dispatcher } from 'dispatcher';
import { CommentsStoreController } from 'storecontrollers/CommentsStoreController';
import { CommentsViewController } from 'viewcontrollers/CommentsViewController';

let commentsViewController = new CommentsViewController();
let commentsStoreController = new CommentsStoreController();

aggregator.registerStoreController(commentsStoreController);
aggregator.registerViewController(commentsViewController);

dispatcher.registerStoreController(commentsStoreController);

commentsViewController.onConnected();
commentsStoreController.onConnected();
