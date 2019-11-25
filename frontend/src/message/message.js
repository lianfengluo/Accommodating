import React, { Component } from 'react';
import {
  Row, Col, Avatar, Button, Modal, Dropdown,
  Icon, Menu, Tabs, Radio, Divider, Badge
} from 'antd';

import {
  GetHostInfo,
  GetRenterInfo,
  PaidRequest,
} from './action.js'
import Dialog from './message_dialog.js'
const { TabPane } = Tabs;

function menu(history, cur_key) {
  return (
    <Menu
      className="drop-down-menu"
      selectedKeys={[cur_key]}
      onClick={({ key }) => {
        if (key === cur_key)
          return
        key === "1" ?
          history.push("/message/renter") :
          history.push("/message/host")
      }}>
      <Menu.Item key="1">
        As renter
      </Menu.Item>
      <Menu.Item key="2">
        As host
      </Menu.Item>
    </Menu>)
}


export const pay_group = (PaidMethodonChange, value, amount,
  statement = "Reminding: You cannot get refund after pay.") => (
    <div>
      <h3>{statement}</h3>
      <h2 className="booking-total">Amount: {amount}</h2>
      <Radio.Group
        onChange={PaidMethodonChange} value={value}>
        <Radio value={1}>
          <Icon type="alipay" />Alipay
    </Radio>
        <Radio value={2}>
          <Icon type="wechat" />Wechat
    </Radio>
        <Radio value={3}>
          <Icon type="google" />Google Pay
    </Radio>
        <Radio value={4}>
          <Avatar size="small"
            src={window.location.origin + '/static/mastercard.png'} />
          Mastercard
  </Radio>
      </Radio.Group>
    </div>
  )
class Inbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      paying_id: null,
      pay_method: 1,
      pay_amount: 0,
      count: '0',
      new_message: [],
    }
  }
  fetch_data = () => {
    if (this.props.match.params.type === 'renter') {
      GetRenterInfo((data) => {
        this.setState({
          data: data
        })
      }, () => {
        alert("Something went wrong.");
        this.props.history.push('/');
      })
    } else if (this.props.match.params.type === 'host') {
      GetHostInfo((data) => {
        this.setState({
          data: data
        })
      }, () => {
        alert("Something went wrong.");
        // this.props.history.push('/');
      })
    }
  }
  update(count, new_message) {
    this.setState({ count: count, new_message: new_message });
  }
  componentWillUnmount() {
    // this.props.childRef.current = undefined;
  }
  componentDidMount() {
    this.props.childRef(this)
    this.fetch_data();
  }
  componentDidUpdate(preProps) {
    // Do not update if the uri location is the same as before
    if (preProps.location !== this.props.location) {
      this.fetch_data();
    }
  }
  paid_submit = () => {
    PaidRequest(this.state.paying_id, () => {
      this.setState({ paidVisible: false })
      this.props.history.push(
        this.props.history.location.pathname)
    }, () => {
      window.location.reload();
    })
  }
  PaidMethodonChange = e => {
    this.setState({
      pay_method: e.target.value,
    });
  };
  render() {
    const { data } = this.state;
    return (
      <div style={{ width: "100%", marginTop: "30px",
        minHeight: window.screen.height > 650 + 91  ? window.screen.height - 91 : 650 }}>
        <Row>
          <Col span={14} offset={5}>
            <div style={{ float: "right" }}>
              <Dropdown
                trigger={['click']}
                overlay={() => menu(this.props.history,
                  this.props.match.params.type === 'renter' ? "1" : "2")}
              >
                <Button size="large">
                  <Badge dot count={this.state.count} offset={[5, 8]}>
                    {this.props.match.params.type === 'renter' ?
                      "Renter inbox" : "Host inbox"}
                  </Badge>&nbsp;
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
          </Col>
        </Row>
        {/* <hr /> */}
        <Divider />
        <Row>
          <Col span={16} offset={4} style={{ marginBottom: "30px" }}>
            <Tabs defaultActiveKey="1" className="message-center-tab">
              <TabPane tab="All message" key="1">
                <Divider dashed />
                <Dialog data={data}
                  history={this.props.history}
                  new_message={this.state.new_message}
                  open_paid_modal={(id, amount) => {
                    this.setState({
                      paidVisible: true,
                      paying_id: id,
                      pay_amount: amount,
                    })
                  }}
                  type={this.props.match.params.type} />
              </TabPane>
              <TabPane tab="Ongoing" key="2">
                <Divider dashed />
                <Dialog data={data.filter(x => ['AR', 'D', 'E'].indexOf(x.status) === -1)}
                  history={this.props.history}
                  new_message={this.state.new_message}
                  open_paid_modal={(id, amount) => {
                    this.setState({
                      paidVisible: true,
                      paying_id: id,
                      pay_amount: amount,
                    })
                  }}
                  type={this.props.match.params.type} />
              </TabPane>
              <TabPane tab="Finished" key="3">
                <Divider dashed />
                <Dialog data={data.filter(x => ['AR', 'D', 'E'].indexOf(x.status) !== -1)}
                  new_message={this.state.new_message}
                  history={this.props.history}
                  open_paid_modal={(id, amount) => {
                    this.setState({
                      paidVisible: true,
                      paying_id: id,
                      pay_amount: amount,
                    })
                  }}
                  type={this.props.match.params.type} />
              </TabPane>
            </Tabs>
            <Modal
              title="Choosing the way you want to paid"
              visible={this.state.paidVisible}
              onOk={this.paid_submit}
              onCancel={() => {
                this.setState({
                  paidVisible: false,
                })
              }}
            >
              {pay_group(this.PaidMethodonChange, this.state.pay_method, this.state.pay_amount)}
            </Modal>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Inbox;