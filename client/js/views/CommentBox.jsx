import React from 'react';

export let CommentBox = React.createClass({
  render() {
    return (
      <div>
        { this.props.comment }
      </div>
    );
  }
});
