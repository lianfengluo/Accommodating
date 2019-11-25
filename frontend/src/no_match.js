import React from 'react';
import {
  Button, Result
} from 'antd';

/**
 * The component when none of the uri is matched
 * @param {router history} history 
 */
export const NoMatch = ({ history }) => {
  return <Result
    status="warning"
    title="There are some problems with your operation."
    extra={
      <Button type="primary" key="console" onClick={() => history.goBack()}>
        Go back.
    </Button>
    }
  />
}