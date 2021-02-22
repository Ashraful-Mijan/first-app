import logo from './logo.svg';
import './App.css';

function App() {
  const products = [
    {name:'Photoshop', price: '$90.99'},
    {name:'illustrator', price:'$10.120'}
  ]
  return (
    <div className="App">
      <header className="App-header">
      <Products name={products[0].name} price={products[0].price} />
        {/* <Person name="Shakib" />
        <Person name="Alamin" />
        <Person name="kalamin" /> */}
      </header>
    </div>
  );
}


function Products(props) {
  const productStyle = {
    border: '1px solid gray',
    borderRadius: '5px',
    backgroundColor: 'lightgray',
    height: '200px',
    width: '200px',
    float: 'left'
  }
  return (
    <div style={productStyle}>
      <h3>{props.name}</h3>
      <h5>{props.price}</h5>
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
