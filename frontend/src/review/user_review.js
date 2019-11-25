import React from 'react';
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
import moment from 'moment';

// text for rating
const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
const UserReviewList = (props) => (
  <div>
    <Row type="flex" align="top">
      <Col offset={3} span={18}>
        <h2 style={{ float: "right" }}>{props.count} reviews</h2>
      </Col>
    </Row>
    {/* <Divider /> */}
    {props.data.map((value, index) => {
      return (
        <Row key={index} type="flex" align="middle">
          <Col offset={3} span={18}>
            <Comment
              author={
                <Link style={{ fontSize: "15px", fontWeight: 700 }}
                  to={`/user/${value.reviewer.id}`}>
                  {value.reviewer.username}
                </Link>
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
                <Tooltip
                  title={moment(value.create_time).format('YYYY-MM-DD HH:mm:ss')}>
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
    {props.next ?
      <Divider>
        <Link to="#" onClick={() => props.get_next()}>More reviews</Link>
      </Divider>
      : <Divider />
    }
  </div>
)

export default UserReviewList;