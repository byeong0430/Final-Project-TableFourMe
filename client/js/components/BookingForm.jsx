import React, { Component, Fragment } from 'react';
import NumberFormat from 'react-number-format';
import { namifyStr, getOnlyNumbers } from '../../libs/form-helper-func.js';

export default class BookingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        name: '',
        phone: '',
        group_size: '',
        email: '',
        res_code: '',
        host: process.env.HOST || window.location.host
      },
      btnType: ''
    };
  }

  // store the form button type in state (submit, update, cancel)
  btnClicked = btnType => {
    this.setState({ btnType });
  }

  // submit the form data
  handleFormSubmission = event => {
    // prevent default GET request
    event.preventDefault();
    // deconstruct event.target
    let { name, phone, group_size, email, host } = event.target;
    // deconstruct state object
    const { btnType, formData: { res_code } } = this.state;

    this.props.socket.emit(`${btnType}Reservation`, {
      name: namifyStr(name.value),
      phone: getOnlyNumbers(phone.value),
      group_size: group_size.value,
      email: email.value,
      res_code,
      isAdmin: this.props.isAdmin,
      host
    });
  }

  // add submit button for a new reservation or
  // add update and cancel buttons for an existing reservation
  addBtns = () => {
    let defaultBtnConfig = {};
    let cancelBtn = '';

    if (this.state.formData.res_code) {
      // CASE 1: res_code exists. show update and cancel buttons
      defaultBtnConfig = {
        type: 'update',
        klassName: 'button is-success'
      };
      cancelBtn = (
        <button
          type='submit'
          onClick={() => this.btnClicked('cancel')}
          className="button is-danger"
        >CANCEL</button>
      );
    } else {
      // CASE 2: res_code doesn't exist. show new buttons
      defaultBtnConfig = {
        type: 'submit',
        klassName: 'button is-link'
      };
    }

    let defaultBtn = (
      <button
        type='submit'
        onClick={() => this.btnClicked(defaultBtnConfig.type)}
        className={defaultBtnConfig.klassName}
      >{defaultBtnConfig.type.toUpperCase()}</button>
    );

    return { defaultBtn, cancelBtn };
  }

  // handle changes in input boxes
  handleChange = ({ target: { name, value } }) => {
    this.setState(oldState => {
      const { formData } = oldState;
      formData[name] = value;
      return { ...oldState, formData };
    })
  }

  showResCode = () => {
    const { res_code } = this.state.formData;
    if (res_code) {
      return (
        <span className='subtitle is-5'>
          <em> - Reference ID: {res_code}</em>
        </span>
      );
    }
  }

  componentDidMount = () => {
    // add formData to state
    const { formData } = this.props;
    this.setState({ formData });
  }

  componentDidUpdate(prevProps, prevState) {
    const { isAdmin, formData } = this.props;
    // there are 2 conditions to check for any update to occur
    // 1. this.props.isAdmin must be === as this.props.formData.isAdmin
    // this.props.isAdmin represents on which page BookingForm.jsx is RENDERED.
    // For example, if this.props.isAdmin === true, this component is rendered at /admin
    // this.props.formData.isAdmin represents on which page the FORM WAS SUBMITTED.
    // in short, it represents the origin of the form data.
    // For example, if this.props.formData.isAdmin === true, the form was submitted at /admin
    // without this condition check, a form submission on the customer page will both render
    // the form BOTH on the customer AND admin pages (NOT GOOD).
    // 2. the current formData is different from formData in the previous state
    if ((isAdmin === formData.isAdmin) && (prevState.formData !== formData)) {
      this.setState({ formData });
    }
  }

  render() {
    const { name, phone, group_size, email } = this.state.formData;
    return (
      <Fragment>
        {this.showResCode()}
        < form onSubmit={this.handleFormSubmission} >
          <div className='field'>
            <label className='label is-medium'>Name*</label>
            <div className='control has-icons-left has-icons-right'>
              <input
                className='input is-medium'
                value={name}
                onChange={this.handleChange}
                name='name'
                type='text'
                placeholder='Your name'
                required
              />
              <span className='icon is-medium is-left'>
                <i className='fas fa-user-alt'></i>
              </span>
              <span className='icon is-medium is-right'>
                <i className='fas fa-check fa-lg'></i>
              </span>
            </div>
          </div>

          <div className='field'>
            <label className='label is-medium'>Phone*</label>
            <div className='control has-icons-left has-icons-right'>
              <NumberFormat
                className='input is-medium'
                format='(###) ###-####'
                value={phone}
                onChange={this.handleChange}
                name='phone'
                type='tel'
                placeholder='(778) 123-4567'
                required
              />
              <span className='icon is-medium is-left'>
                <a className='button is-static'>
                  +1
              </a>
              </span>
              <span className='icon is-medium is-right'>
                <i className='fas fa-check fa-lg'></i>
              </span>
            </div>
          </div>

          <div className='field'>
            <label className='label is-medium'>Group Size*</label>
            <div className='control has-icons-left has-icons-right'>
              <input
                className='input is-medium'
                value={group_size}
                onChange={this.handleChange}
                name='group_size'
                type='number'
                min='1'
                max='10'
                placeholder='e.g. 2'
                required
              />
              <span className='icon is-medium is-left'>
                <i className='fas fa-user-alt'></i>
              </span>
              <span className='icon is-medium is-right'>
                <i className='fas fa-check fa-lg'></i>
              </span>
            </div>
          </div>

          <div className='field'>
            <label className='label is-medium'>Email (optional)</label>
            <div className='control has-icons-left has-icons-right'>
              <input
                className='input is-medium'
                value={email}
                onChange={this.handleChange}
                name='email'
                type='email'
                placeholder='example@gmail.com'
              />
              <span className='icon is-medium is-left'>
                <i className='fas fa-envelope'></i>
              </span>
              <span className='icon is-medium is-right'>
                <i className='fas fa-check fa-lg'></i>
              </span>
            </div>
          </div>

          <div className="field is-centered is-grouped">
            <p className="control">
              {this.addBtns().defaultBtn}
            </p>
            <p className="control">
              {this.addBtns().cancelBtn}
            </p>
          </div>
        </form >
      </Fragment>
    );
  }
}
