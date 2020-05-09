import React, { useState } from 'react';
import '../styles/landing.scss';

import { generateRandomColor } from './Functions';

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
      setUserState({ ...userState, name: name_text, color: generateRandomColor() });
    } else {
      setError(true);
      document.getElementsByClassName('input')[0].focus();
    }
    setFormData(name_text);
  };

  return (
    <div className='container'>
      <div className='label'>Please enter your name to continue...</div>
      <form onSubmit={onNameSubmit}>
        <input
          type='text'
          name='name'
          autoFocus
          value={formData}
          onChange={onChange}
          className={`input ${error && `error`}`}
        />
        {error && <span className='material-icons error-icon'>error_outline</span>}
        <button type='submit'>Continue</button>
      </form>
    </div>
  );
};

export default LandingComponent;
