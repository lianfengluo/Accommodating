import React from "react";
import { Row, Divider, Pagination } from 'antd';
import AccommodationList from "../accommodation/display.js"
import { GetWishesIdAction, GetWishesDetailAction } from './action.js'
import { BACKEND_PAGESIZE } from "../global.js"

/**
 * A react component that is shown under /wisheslist url (authenicated user)
 * It will show the wishes list of the login in user.
 */
class Wisheslist extends React.Component {
  state = { data: [], count: 0 };
  componentDidMount() {
    this.fetchWishesList();
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.fetchWishesList();
    }
  }
  fetchWishesList = () => {
    // page parameter for pagination
    if (!this.props.match.params.page) {
      return;
    }
    // Get the corresponding page
    GetWishesIdAction(this.props.match.params.page,
      ({ results, count }) => {
        if (!results) return;
        let list_data = [];
        results.map((acc) => list_data.push(acc.accommodation))
        // Get how many item in the wisheslist.
        if (count !== this.state.count) {
          this.setState({ count: count })
        }
        // Get all the properties detail you faviour.
        GetWishesDetailAction({ ids: list_data },
          data => {
            this.setState({
              data: data,
            })
          }, error => {
            this.props.history.goBack();
            console.error(error);
          })
      }, (error) => {
        this.props.history.goBack();
        console.error(error);
      });
  }
  page_change = (page) => {
    // An event when the page is changed
    let info = this.props.location.pathname.split("/");
    info[2] = page;
    this.props.history.push(info.join("/"));
  }
  render() {
    return (
      <Row style={{ minHeight: window.screen.height > 891 ? window.screen.height - 91 : 800 }} >
        <center style={{ marginTop: "20px" }}>
          <h1 style={{ fontWeight: 1000 }}>Wisheslist</h1>
        </center>
        <Divider />
        {this.state.data ?
          <AccommodationList data={this.state.data}
            go_to_accommodation={
              (value) => {
                this.props.history.push(`/accommodation/${value}`)
              }}
          /> :
          <span />}
        <Divider />
        <center>
          <Pagination
            style={{ fontSize: "20px" }}
            total={this.state.count}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            pageSize={BACKEND_PAGESIZE}
            onChange={(page) => this.page_change(page)}
            current={parseInt(this.props.match.params.page)}
          />
        </center>
      </Row>)
  }
}

export default Wisheslist;