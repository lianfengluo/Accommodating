import React, { Component } from 'react';
import {
  Row,
  Col,
  Divider,
  Comment,
  Tooltip,
  Avatar,
  Rate,
  Popover
} from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment'

const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
class AccReviewList extends Component {
  render() {
    //fetch the user review
    return (
      <div>
        {this.props.data.map((value, index) => {
          return (
            <Row key={index} type="flex" align="middle">
              <Col span={24}>
                <Comment
                  author={
                    <Link style={{ fontSize: "15px" }} to={`/user/${value.reviewer.id}`}>{value.reviewer.username}</Link>
                  }
                  avatar={
                    <Avatar
                      size={80}
                      className="comment-image"
                      src={value.reviewer.image}
                      alt={value.reviewer.username}
                    />
                  }
                  content={
                    value.content
                  }
                  datetime={
                    <Tooltip title={moment(value.create_time).format('YYYY-MM-DD HH:mm:ss')}>
                      <span>{moment(value.create_time).fromNow()}</span>
                    </Tooltip>
                  }
                />
                <div style={{ float: "right" }}>
                  <Popover content={
                    <span>
                      {desc[value.rate - 1]}
                    </span>
                  } placement="top"
                  >
                    <span>
                      <Rate disabled defaultValue={value.rate} />
                    </span>
                  </Popover>
                </div>
                <Divider dashed />
              </Col>
            </Row>
          );
        }
        )}
        {this.props.next ?
          <Divider>
            <Link to="#" onClick={() => this.props.get_next()}>More reviews</Link>
          </Divider>
          : <Divider />
        }
      </div>
    )
  }
}
export default AccReviewList;