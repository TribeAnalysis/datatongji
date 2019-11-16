import React from "react";
import classNames from "classnames";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  Nav,
  Navbar,
  Container,
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { DotLoader } from 'react-spinners';
var defaultMessage = localStorage.getItem('defaultLanguage') !== 'pt-br' ? require('../locales/en.js') : require('../locales/pt.js');


class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      userUrl: {},
      sidebarColor: '',
      backgroundColor: '',
      defaultLanguage: '',
      change: false,
      loading: false,
      img: false,
    }
    this.changeLanguage = this.changeLanguage.bind(this);
  };
  // async componentDidMount() {
  //   const token = localStorage.getItem('token');

  //   const response = await fetch(`https://datatongji-backend.herokuapp.com/auth/get_user?token=${token}`);
  //   const responseJson = await response.json();

  //   this.setState({ data: responseJson.user });
  //   if (responseJson.userImg != null) {
  //     this.setState({ userUrl: responseJson.userImg });
  //   }
  // };

  resetThenSet = (id, key) => {
    let temp = JSON.parse(JSON.stringify(this.state[key]));
    temp.forEach(item => item.selected = false);
    temp[id].selected = true;
    this.setState({
      [key]: temp
    });
  }

  toggleSelected = (id, key) => {
    let temp = JSON.parse(JSON.stringify(this.state[key]));
    temp[id].selected = !temp[id].selected;
    this.setState({
      [key]: temp
    });
  }

  handleBgClick = color => {
    this.setState({
      change: true,
      sidebarColor: color
    })
  };

  activateMode = mode => {
    this.setState({ change: true })
    switch (mode) {
      case "light":
        document.body.classList.add("white-content");
        this.setState({ backgroundColor: 'light' });
        break;
      default:
        document.body.classList.remove("white-content");
        this.setState({ backgroundColor: 'dark' });
        break;
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.backgroundColor !== '') {
      localStorage.setItem('background', this.state.backgroundColor);
    };
    if (this.state.sidebarColor !== '') {
      localStorage.setItem('sidebarColor', this.state.sidebarColor);
    };
    if (this.state.defaultLanguage !== '') {
      localStorage.setItem('defaultLanguage', this.state.defaultLanguage);
    };
    this.SaveChanges()

    // this.setState({ change: false })
    setTimeout(
      function () {
        window.location.reload();
      },
      900
    );
  };

  async SaveChanges() {
    this.setState({ loading: true });
    if (this.state.img !== false) {
      const data = new FormData();
      data.append('file', this.state.image);
      data.append('token', localStorage.getItem('token'));
      try {
        const response = await fetch('https://datatongji-backend.herokuapp.com/upload/posts', {
          mode: 'no-cors',
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data; boundary=AaB03x" +
              "--AaB03x" +
              "Content-Disposition: file" +
              "Content-Type: png" +
              "Content-Transfer-Encoding: binary" +
              "...data... " +
              "--AaB03x--",
            "Accept": "application/json",
            "type": "formData",
          },
          body: data
        });
        if (response.ok) {
          this.colorAlert = 'success';
          this.setState({
            message: 'Saved'
          });
        } else {
          throw new Error("Failure!");
        }
      } catch (e) {
        this.colorAlert = 'danger';
        this.setState({
          message: e.message,
          loading: false
        });
      }
    };
    if (this.state.sidebarColor !== '' || this.state.backgroundColor !== '') {
      const requestInfo = {
        method: 'PUT',
        body: JSON.stringify({ "token": localStorage.getItem('token'), "sidebarColor": this.state.sidebarColor, "backgroundColor": this.state.backgroundColor }),
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
      };
      try {
        const response = await fetch('https://datatongji-backend.herokuapp.com/auth/updateuser', requestInfo);
        if (response.ok) {
          this.colorAlert = 'success';
          this.setState({
            message: 'Saved'
          });
        } else {
          throw new Error("Error when updating user colors");
        }
      }
      catch (e) {
        this.colorAlert = 'danger';
        this.setState({
          message: e.message,
          loading: false
        })
      }
    }
  }

  handleImagechenge = e => {
    this.setState({
      image: e.target.files[0],
      change: true,
      img: true
    });
  };

  changeLanguage (language) {
    if (localStorage.getItem('defaultLanguage') !== language) {
      // localStorage.setItem('defaultLanguage', language);
      this.language = language === 'pt-br' ? <span class="flag-icon flag-icon-br" /> : <span class="flag-icon flag-icon-us" />;
      // this.setState({
      //   change: true,
      //   defaultLanguage: language
      // });
    }
  };

  render() {
    let btnSave;
    var language = localStorage.getItem('defaultLanguage') === 'pt-br' ? <span class="flag-icon flag-icon-br" /> : <span class="flag-icon flag-icon-us" />;

    let bntsavetext = defaultMessage.Modal.btn2;
    if (this.state.loading === true) {
      bntsavetext = <DotLoader
        css={`
                      display: block;
                      margin: 0 auto;
                      border-color: red;
                      `}
        sizeUnit={"px"}
        size={20}
        color={'#fff'}
        loading={this.state.loading}
      />
    }
    // onChange={this.handleImagechenge}

    let upload = <div class="box">
      <input onChange={this.handleImagechenge} type="file" name="file-1[]" id="file-1" class="inputfile inputfile-1" data-multiple-caption="{count} files selected" multiple />
      <label for="file-1"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" /></svg> <span>
        {defaultMessage.Profile.avatar}</span></label>
    </div>

    let photo = <img alt="..." className="avatar" src={require("assets/img/user.svg")} />

    if (this.state.change) {
      btnSave = <Button disabled={this.state.loading} className="btn-round" type="submit" style={{ top: '-30px', float: 'right' }} color="primary" onClick={this.handleSubmit}>{bntsavetext}</Button>
    }
    var url = localStorage.getItem('userUrl');

    if (url !== "" && url !== null && url !== 'undefined') {
      photo = <img alt="..." className="avatar" src={url} />
    }
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('email');
    return (
      <>
        <div className="content">
          <form id="new-post" onSubmit={this.handleSubmit}>
            <Row>
              <Col md="12">
                <Card className="card-user">
                  <CardBody>
                    <CardText />
                    <div className="author">
                      <div className="block block-one" />
                      <div className="block block-two" />
                      <div className="block block-three" />
                      <div className="block block-four" />
                      <a href="#" onClick={e => e.preventDefault()}>
                        {photo}
                        <h5 className="title">{userName}</h5>
                      </a>
                      <p className="description">{userEmail}</p>
                      <br />
                    </div>
                    <div className="fixed-plugin">
                      <div className={this.state.classes}>
                        <ul
                          style={{ padding: '3%', marginRight: '10%' }}
                          className="config-color show">
                          {upload}
                          <UncontrolledDropdown group >
                            <DropdownToggle caret color="primary" data-toggle="dropdown"
                              style={{ width: '40px', height: '35px', 'border-radius': '50%', hover: { background: 'transparent' } }}>
                              {/* <span class={`flag-icon flag-icon-${language}`} /> */}
                              {language}
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-navbar" right tag="ul" style={{ marginRight: '-65px', marginTop: '60px', height: '90px', width: '100px' }}>
                              <DropdownItem style={{ color: 'gray' }} className="nav-item">
                                <div onClick={() => { this.changeLanguage('en-us') }}>
                                  <span class="flag-icon flag-icon-us" />{' '} {defaultMessage.Menu.lang.en}
                                </div>
                              </DropdownItem>
                              <DropdownItem style={{ color: 'gray' }} className="nav-item" onClick={this.changeLanguage('pt-br')}>
                                <div onClick={() => { this.changeLanguage('pt-br') }}>
                                  <span class="flag-icon flag-icon-br" />{' '} {defaultMessage.Menu.lang.pt}
                                </div>
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                          <li className="header-title">{defaultMessage.Profile.sidecolor}</li>
                          <li className="adjustments-line">
                            <div className="badge-colors text-center">
                              <span
                                className={
                                  this.props.bgColor === "primary"
                                    ? "badge filter badge-primary active"
                                    : "badge filter badge-primary"
                                }
                                data-color="primary"
                                onClick={() => {
                                  this.handleBgClick("primary");
                                }}
                              />{" "}
                              <span
                                className={
                                  this.props.bgColor === "blue"
                                    ? "badge filter badge-info active"
                                    : "badge filter badge-info"
                                }
                                data-color="blue"
                                onClick={() => {
                                  this.handleBgClick("blue");
                                }}
                              />{" "}
                              <span
                                className={
                                  this.props.bgColor === "green"
                                    ? "badge filter badge-success active"
                                    : "badge filter badge-success"
                                }
                                data-color="green"
                                onClick={() => {
                                  this.handleBgClick("green");
                                }}
                              />{" "}
                            </div>
                          </li>
                          <li className="adjustments-line text-center color-change">
                            <span className="color-label">{defaultMessage.Profile.bgcolor.light}</span>{" "}
                            <span
                              className="badge light-badge mr-2"
                              onClick={() => this.activateMode("light")}
                            />{" "}
                            <span
                              className="badge dark-badge ml-2"
                              onClick={() => this.activateMode("dark")}
                            />{" "}
                            <span className="color-label">{defaultMessage.Profile.bgcolor.dark}</span>{" "}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter>
                    {btnSave}
                    {/* <div className="button-container">
                      <Button className="btn-icon btn-round" color="facebook">
                        <i className="fab fa-facebook" />
                      </Button>
                      <Button className="btn-icon btn-round" color="twitter">
                        <i className="fab fa-twitter" />
                      </Button>
                      <Button className="btn-icon btn-round" color="google">
                        <i className="fab fa-google-plus" />
                      </Button>
                    </div> */}
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </form>
        </div>
      </>
    );
  }
}

export default UserProfile;
