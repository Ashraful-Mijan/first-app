import React, { useEffect, useState } from 'react'
import logo from './logo.svg';
import './App.css';

function App() {
  const products = [
    { name: 'Photoshop', price: '$90.99' },
    { name: 'illustrator', price: '$10.120' },
    { name: 'PdF Reader', price: '$50.330' }
  ]

  return (
    <div className="App">
      <header className="App-header">
        <User></User>
        <Counter></Counter>
        {
          products.map(product => <Products name={product} />)
        }
        {/* <Products name={products[0]} />
      <Products name={products[1]} /> */}

        {/* <Person name="Shakib" />
        <Person name="Alamin" />
        <Person name="kalamin" /> */}
      </header>
    </div>
  );
}

function User() {
  const [state, setState] = useState([]);
 
  useEffect(()=>{
    fetch('https://jsonplaceholder.typicode.com/users')
    .then(res => res.json())
    .then(data => setState(data))
  })
  console.log()
  return (
    <div>
      <h3>Dynamic User: {state.length}</h3>
      <ul>
        {
          state.map(user=> <li>{user.username}</li>)
        }
      </ul>
    </div>
  )
}

function Counter() {
  const [state, setState] = useState(10)

  const decreaseButton = () => {
    if (state > 0) {
      setState(state - 1)
    }
  }
  return (
    <div>
      <h3>Count: {state} </h3>
      <button onClick={() => setState(state + 1)}>Increase</button>
      <button onClick={decreaseButton}>Decrease</button>
    </div>
  )
}

function Products(props) {
  const productStyle = {
    border: '1px solid gray',
    borderRadius: '5px',
    backgroundColor: 'lightgray',
    height: '200px',
    width: '200px',
    float: 'left',
    margin: '5px'
  }

  const { name, price } = props.name
  return (
    <div style={productStyle}>
      <h3>{name}</h3>
      <h5>{price}</h5>
      <button>Buy now</button>
    </div>
  )
}

// function Person(props) {
//   const style= {
//     color: 'orange',
//     backgroundColor: 'black',
//     margin: '2px',
//     padding: '5px',
//     width: '350px',
//     border: '5px solid cyan'
//   }
//   return (
//     <div style={style}>
//       <h1>Name: {props.name}</h1>
//       <p>Best Player in for bangladesh</p>
//     </div>
//   )
// }

export default App;
