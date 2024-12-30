import React, { useState } from 'react';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });

  const [isSignup, setIsSignup] = useState(false);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("Login Execute", formData);
    let responseData;
    await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    }else{
      alert(responseData.errors)
    }
  };

  const signup = async () => {
    console.log("Signup Execute", formData);
    let responseData;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    }else{
      alert(responseData.errors)
    }
  };

  return (
    <div className="login-signup">
      <div className="login-signup-container">
        <h1>{isSignup ? 'Daftar' : 'Masuk'}</h1>
        <p className="login-signup-subtext">
          {isSignup
            ? 'Sudah punya akun Eleganza?'
            : 'Belum punya akun Eleganza?'}
          <span
            className="login-signup-register"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Masuk' : 'Daftar'}
          </span>
        </p>

        <button className="google-login">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google Logo"
          />
          Google
        </button>

        <div className="divider">
          <span></span>
          <p>atau</p>
          <span></span>
        </div>

        <div className="login-signup-fields">
          {isSignup && (
            <input
              name="username"
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder="Username"
            />
          )}
          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="text"
            placeholder="Nomor HP atau Alamat Email"
          />
          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Masukkan Password Anda"
          />
        </div>

        {isSignup ? (
          <button onClick={signup} className="login-button">DAFTAR</button>
        ) : (
          <>
            <p className="forgot-password">Lupa password?</p>
            <button onClick={login} className="login-button">LOGIN</button>
          </>
        )}

        <p className="terms">
          Dengan melanjutkan, saya menyetujui{' '}
          <span className="highlight">Syarat & Ketentuan</span> serta{' '}
          <span className="highlight">Kebijakan Privasi Eleganza</span>.
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
