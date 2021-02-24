import React, { useEffect, useState } from 'react'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Proposal</h1>
        <Propose />
      </header>
    </div>
  );
}

function Propose() {
  const YesMessage = <h1>I Love You!</h1>;
  const NoMessage = <h1>Ops! Jibonta Bedonar kore dila</h1>;
  const ProposeMessage = <h1>Will You Merry Me ?</h1>;

  const [mesaage, setMessage] = useState(ProposeMessage);

  const loveMessage = () => {
    setMessage(YesMessage)
  }

  const RejectMessage = () => {
    setMessage(NoMessage)
  }
  const styleBtn = {
    padding: '10px 20px',
    margin: '0px 10px',
    fontSize: '20px',
    backgroundColor: 'orange'
  }
  return (
    <div>
      <h1>{mesaage}</h1>
      <button style={styleBtn} onClick={loveMessage}>Yes</button>
      <button style={styleBtn} onClick={RejectMessage}>No</button>
    </div>
  )
}

export default App;
