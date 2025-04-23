import React from 'react';
import ItemList from './components/ItemList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Price Tracker</h1>
      </header>
      <main>
        <ItemList />
      </main>
    </div>
  );
}

export default App;
