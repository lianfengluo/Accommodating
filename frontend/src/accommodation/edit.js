import React from "react";
import { Form, Modal, Input, Icon, Row, InputNumber, Upload, Button, message, Popover } from "antd";
import { fetch_img_data, SubmitAdvertiseImg, Deletable, RequestDelete } from "./action.js"
const { confirm } = Modal;
const make_label = (info) => {
  return (<span style={{
    color: "black", textAlign: "left",
    fontSize: "20px", fontWeight: 600
  }}>{info}</span>)
}
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


function showDeleteConfirm(id, history) {
  confirm({
    title: 'Are you sure delete this property?',
    content: 'Click Yes to confirm',
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk() {
      RequestDelete(id, () => {
        message.success('Delete succeed.', 3.0);
        history.push("/")
      }, () => {
        message.error('delete error.');
        // history.push("/")
      })
    },
    onCancel() {
      console.log('Cancel');
    },
  });
}

class EditProperty extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      previewVisible: false,
      previewImage: '',
      fileList: '',
      deletable: false,
    };
  }
  componentDidMount() {
    this.setState({
      fileList: this.props.images.map((value, index) => {
        let data = {
          uid: index,
          name: value.split("/").pop(),
          url: value,
          status: 'done',
        }
        fetch_img_data(value).then(result => {
          data['originFileObj'] = result;
          data['url'] = URL.createObjectURL(result)
        })
        return data
      })
    })
    Deletable(this.props.acc_id, () => {
      this.setState({ deletable: true })
    }, () => { })
  }
  handleOk = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.setState({ loading: true });
      const data = new FormData();
      this.state.fileList.slice(0, 8).map(({ originFileObj, name }) =>
        data.append("images", originFileObj, name));
      data.append("acc_id", this.props.acc_id);
      data.append("description", values['description']);
      data.append("rules", values['rules']);
      data.append("price", values['price']);
      SubmitAdvertiseImg(data, () => {
        window.scrollTo(0, 0);
        window.location.reload();
      }, () => {
        this.setState({
          error: "Update error"
        })
      });
    });
  };
  handleCancelPreview = () => {
    this.setState({
      previewVisible: false,
    })
  }
  handleChangeImg = ({ fileList }) => this.setState({ fileList });
  handleCancel = () => {
    const { closeModal } = this.props;
    this.setState({ loading: false, });
    closeModal();
  };
  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    } else if (!file.preview) {
      file.preview = file.url;
    }
    this.setState({
      previewImage: null || file.preview,
      previewVisible: true,
    });
  };
  render() {
    const { form, visible } = this.props;
    const { previewVisible, fileList, previewImage, loading } = this.state;
    const { getFieldDecorator } = form;
    const uploadButton = (
      <div style={{ width: "100%", height: "80px" }}>
        <Row style={{ width: "100%", height: "100%" }} type="flex" justify="space-around" align="middle">
          <Row>
            <Icon type="plus" style={{ fontSize: "35px" }} />
          </Row>
          <div className="ant-upload-text"
            style={{
              color: "black",
              fontSize: "12px"
            }}>Upload image (maximum 8)</div>
        </Row>
      </div>
    );
    return (
      <span>
        <Modal
          title={
            <h3>Edit the property<Icon type="form" />
              {this.state.deletable ?
                <Button onClick={() => showDeleteConfirm(this.props.acc_id, this.props.history)}
                  type="danger" size="large" style={{ marginLeft: "30px" }}>
                  Delete the property
              </Button> :
                <Popover content="Someone rented your property delete not available at the moment">
                  <Button
                    disabled size="large" style={{ marginLeft: "30px" }}>
                    Delete the property
                  </Button>
                </Popover>
              }
            </h3>}
          visible={visible}
          confirmLoading={loading}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          className="edit-property-span"
        >
          <div>
            <Row>
              {this.state.error ? <h1 style={{ color: "red" }}>{this.state.error}</h1> : <span />}
              <Form.Item
                label={make_label("Price/day")}
              >
                {getFieldDecorator('price',
                  {
                    initialValue: this.props.price,
                    "rules": [{
                      required: true,
                      message: 'Input the price per day!'
                    }]
                  }
                )(
                  <InputNumber
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                )}
              </Form.Item>
            </Row>
            <Row style={{ widht: "100%" }}>
              {/* <Col offset={2} span={20}> */}
              <Form.Item label={make_label("Description")}>
                {getFieldDecorator('description',
                  {
                    initialValue: this.props.description,
                    "rules": [{
                      required: true,
                      message: 'Input the description!'
                    }]
                  }
                )(
                  <Input.TextArea
                    prefix={<Icon type="edit" />}
                    style={{ borderRadius: "5px" }}
                    autosize={{ minRows: 5, maxRows: 12 }}
                    type="textarea"
                    placeholder="Input your accommodation description here"
                  />
                )}
              </Form.Item>
            </Row>
            <Row style={{ widht: "100%" }}>
              {/* <Col offset={2} span={20}> */}
              <Form.Item label={make_label("Rules")}>
                {getFieldDecorator('rules',
                  {
                    initialValue: this.props.rules,
                    "rules": [{
                      required: true,
                      message: 'Input the rules!'
                    }]
                  }
                )(
                  <Input.TextArea
                    prefix={<Icon type="edit" />}
                    style={{ borderRadius: "5px" }}
                    autosize={{ minRows: 5, maxRows: 12 }}
                    type="textarea"
                    placeholder="Input your accommodation rules here"
                  />
                )}
              </Form.Item>
            </Row>
            <Row>
              <Upload
                customRequest={({ _, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 0);
                }}
                accept=".png,.jpg,.jpeg,.gif"
                listType="picture-card"
                fileList={fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChangeImg}
                multiple={true}
                style={{ cursor: "pointer" }}
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
              <Modal visible={previewVisible} footer={null}
                width={"70%"} onCancel={this.handleCancelPreview}>
                <center>
                  <img style={{ width: "90%", height: "90%" }}
                    alt="preview" src={previewImage} />
                </center>
              </Modal>
            </Row>
          </div>
        </Modal>
      </span>);
  }
}

export default Form.create()(EditProperty);
