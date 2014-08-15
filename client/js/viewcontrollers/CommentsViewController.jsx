import React from 'react';
import { CommentBox } from 'views/CommentBox';

export class CommentsViewController {
  render(data) {
    React.renderComponent(
      <div>
        <CommentBox comment={data.commentList[0]} />
        <CommentBox comment={data.commentList[1]} />
      </div>,
      document.getElementById('content')
    );
  }
  onConnected() {
  }
}
