import React, { useState, Fragment } from 'react';
import '../styles/landing.scss';

import { generateUserId, generateRandomColor } from './Functions';

const LandingComponent = ({ userState, setUserState }) => {
  const { userId, name, color } = userState;

  const [formData, setFormData] = useState(name);

  const [error, setError] = useState(false);

  const onChange = (e) => {
    const value = e.target.value;
    if (/^[a-z0-9 _]*[a-z0-9]*$/i.test(value) && value.length <= 30) {
      setFormData(value);
      if (error) {
        setError(false);
      }
    }
  };

  const onNameSubmit = (e) => {
    e.preventDefault();
    let name_text = formData.trim();
    if (name_text.length > 0) {
      setUserState({
        userId: generateUserId(7),
        name: name_text,
        color: generateRandomColor(),
      });
    } else {
      setError(true);
      document.getElementsByClassName('input')[0].focus();
    }
    setFormData(name_text);
  };

  return (
    <Fragment>
      <div className='navbar'>
        <div className='brand'>Realtime Chat</div>
        <div className='right'>
          <div className='img-container' title='React'>
            <img
              src='https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png'
              alt='React'
            />
          </div>
          <div className='plus'>+</div>
          <div className='img-container' title='Socket.io'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/9/96/Socket-io.svg'
              alt='Socket.io'
            />
          </div>
        </div>
      </div>
      <div className='container'>
        <div className='label'>Please enter your name to continue...</div>
        <form onSubmit={onNameSubmit}>
          <input
            type='text'
            name='name'
            autoFocus
            autoComplete='off'
            value={formData}
            onChange={onChange}
            className={`input ${error && `error`}`}
          />
          {error && <span className='material-icons error-icon'>error_outline</span>}
          <button type='submit'>Continue</button>
        </form>
      </div>
    </Fragment>
  );
};

export default LandingComponent;
