import React, { useState } from 'react';
import './BuyerRegistration.css';
import Web3 from 'web3';
import { abi } from '../abi';
import { contractAddress } from '../contract';
import { useNavigate } from 'react-router-dom';

function BuyerRegistration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    aadharId: '',
    aadharProof: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      aadharProof: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.aadharProof) {
      alert('Please upload your Aadhar proof.');
      return;
    }

    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(abi, contractAddress);
      const buyerId = await contract.methods.verifyBuyer(
        formData.aadharId,
        ).send({ from: accounts[0] });
        console.log(buyerId);
      alert('Buyer registered successfully!');
      navigate('/')
      }
      else{
        alert('Please install MetaMask to proceed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="buyer-registration">
      <div className="registration-container">
        <h1>Buyer Registration</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Aadhar ID *</label>
            <input
              type="text"
              name="aadharId"
              value={formData.aadharId}
              onChange={handleInputChange}
              required
              placeholder="Enter your Aadhar number"
              pattern="[0-9]{12}"
              title="Please enter valid 12-digit Aadhar number"
            />
          </div>

          <div className="form-group">
            <label>Aadhar Card Proof *</label>
            <input
              type="file"
              name="aadharProof"
              onChange={handleFileChange}
              required
              accept=".pdf,.jpg,.jpeg,.png"
              className="file-input"
            />
            <small>Upload your Aadhar card (PDF, JPG, PNG)</small>
          </div>

          <button type="submit" className="submit-button">
            Register as Buyer
          </button>
        </form>
      </div>
    </div>
  );
}

export default BuyerRegistration;
