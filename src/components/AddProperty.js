import React, { useState } from 'react';
import './AddProperty.css';
import { abi } from '../abi';
import { contractAddress } from '../contract';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import { pinata } from '../config';

function AddProperty() {
  const [formData, setFormData] = useState({
    title: '',
    totalCost: '',
    location: '',
    totalUnits: '',
    bookedUnits: '',
    pricePerUnit: '',
    description: '',
    blueprint:'',
    landPicture:'',
    authCertificate: ''

  });

  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleBlueprintChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setFormData(prevState => ({
        ...prevState,
        blueprint: file
      }));
    }
  };
  
  const handleLandPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setFormData(prevState => ({
        ...prevState,
        landPicture: file
      }));
    }
  };
  
  const handleAuthCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setFormData(prevState => ({
        ...prevState,
        authCertificate: file
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.blueprint || !formData.landPicture || !formData.authCertificate) {
      console.error("Please upload all required files.");
      return;
    }
  
    try {
      // Connect to Web3
      if (!window.ethereum) {
        console.error("Metamask is not installed.");
        return;
      }
  
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      // Get user's account
      const accounts = await web3.eth.getAccounts();
      const userAccount = accounts[0];
  
      // Initialize contract instance
      const contract = new web3.eth.Contract(abi, contractAddress);
  
      // Upload files to Pinata and retrieve their C
      const blueprintResponse = await pinata.upload.file(formData.blueprint);
      const blueprintHash = blueprintResponse.cid;
  
      const landPicResponse = await pinata.upload.file(formData.landPicture);
      const landPicsHash = landPicResponse.cid;
  
      const authCertResponse = await pinata.upload.file(formData.authCertificate);
      const approvalCertsHash = authCertResponse.cid;

      console.log(formData,blueprintHash,
     landPicsHash,
    approvalCertsHash,)
  
      // Send transaction to smart contract
      await contract.methods
        .listApartment(
          formData.title,
          blueprintHash,
          landPicsHash,
          approvalCertsHash,
          formData.location,
          formData.totalCost,
          formData.pricePerUnit,
          formData.totalUnits
        )
        .send({ from: userAccount });
  
      alert("Apartment listed successfully!");
    } catch (error) {
      console.error("Error while listing the apartment:", error);
      alert("Failed to list the apartment. Please try again.");
    }
  };
  

  return (
    <div className="add-property">
      <h2>List Your Property</h2>
      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="title">Property Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter property title"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Total Cost Estimation ($)</label>
            <input
              type="number"
              id="price"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">Price per Unit</label>
            <input
              type="number"
              id="area"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              placeholder="Enter area"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bedrooms">Total Units</label>
            <input
              type="number"
              id="bedrooms"
              name="totalUnits"
              value={formData.totalUnits}
              onChange={handleChange}
              placeholder="No. of bedrooms"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bathrooms">Booked Units</label>
            <input
              type="number"
              id="bathrooms"
              name="bookedUnits"
              value={formData.bookedUnits}
              onChange={handleChange}
              placeholder="No. of bathrooms"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter property description"
            required
          />
        </div>

        <div className="form-group">
          <div 
            className={`file-input-label ${dragActive ? 'drag-active' : ''}`}
            
          >
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleBlueprintChange}
              required
            />
            <span>
              {selectedFileName ? selectedFileName : "Drag and drop your images here or click to select"}
            </span>
          </div>
        </div>
        <div className="form-group">
          <div 
            className={`file-input-label ${dragActive ? 'drag-active' : ''}`}
           
          >
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleLandPictureChange}
              required
            />
            <span>
              {selectedFileName ? selectedFileName : "Drag and drop your images here or click to select"}
            </span>
          </div>
        </div>
        <div className="form-group">
          <div 
            className={`file-input-label ${dragActive ? 'drag-active' : ''}`}
            
          >
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleAuthCertificateChange}
              required
            />
            <span>
              {selectedFileName ? selectedFileName : "Drag and drop your images here or click to select"}
            </span>
          </div>
        </div>

        <button type="submit" className="submit-button">
          List Property
        </button>
      </form>
    </div>
  );
}

export default AddProperty; 