import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import AddProperty from './components/AddProperty';
import { Web3Provider } from './context/Web3Context';
import BuilderRegistration from './components/BuilderRegistration';
import BuyerRegistration from './components/BuyerRegistration';
import Footer from './components/Footer';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/register/builder" element={<BuilderRegistration />} />
            <Route path="/register/buyer" element={<BuyerRegistration />} />
          </Routes>
        </div>
        <Footer/>
      </Router>
    </Web3Provider>
  );
}

export default App;
