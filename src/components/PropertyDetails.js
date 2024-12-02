import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import { abi } from "../abi";
import { contractAddress } from "../contract";
import { pinata } from "../config";
import "./PropertyDetails.css";

function PropertyDetails() {
  const { id } = useParams(); // Get the ID from the URL parameters
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([])
  const [account, setAccount] = useState("");

  const getSignedUrl = async (cid) => {
    try {
      const signedUrl = await pinata.gateways.createSignedURL({
        cid: cid,
        expires: 60, // URL expiration time in seconds
      });
      return signedUrl;
    } catch (err) {
      console.error('Error fetching signed URL:', err);
      return '';
    }
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(abi, contractAddress);
    
        // Fetch property details from the smart contract
        const details = await contract.methods.apartments(id).call();
    
        // Convert total cost (BigInt) to a string
        const totalCost = details.totalCost.toString();
    
        setProperty({
          ...details,
          totalCost, // Add the string-converted totalCost
        });
    console.log(details)
        // Fetch images
        const image1 = await getSignedUrl(details.blueprintHash);
        const image2 = await getSignedUrl(details.landPicsHash);
        const image3 = await getSignedUrl(details.approvalCertsHash);
        setImages([image1, image2, image3]);
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.requestAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      } else {
        alert("Please install MetaMask to interact with the DApp.");
      }
    };

    loadWeb3();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>Property not found.</div>;
  }

 

  const handlePreBooking = async () => {
    if (!property) return;
  
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, contractAddress);
  
      let unitPrice = property.pricePerUnit;
  
      // Apply a discount or set a custom reduced amount for the pre-booking
      // For example, reducing the price by 50%
      const discountFactor = 0.5;  // 50% discount or use any value that you prefer
      const reducedPrice = Math.ceil(Number(unitPrice) * discountFactor);
  
  
      console.log(id, reducedPrice);  // Log the reduced amount in Gwei
  
      // Send transaction with reduced amount
      await contract.methods
        .bookApartment(id, reducedPrice)
        .send({
          from: account,
          value: reducedPrice, // Send payment along with the transaction
        });
  
      alert("Pre-booking successful!");
    } catch (error) {
      console.log("Error during pre-booking:", error);
      alert("Pre-booking failed. Please try again.");
    }
  };
  
  



  return (
    <div className="property-details">
      <div className="property-header">
        <div className="header-content">
          <h1 className="property-title">{property.projectName || "Property Title"}</h1>
          <div className="property-meta">
            <div className="property-location">
              <i className="fas fa-map-marker-alt"></i>
              {property.location || "Unknown Location"}
            </div>
            <div className="property-price">${property.totalCost || "N/A"}</div>

          </div>
          <div className="property-tags">
            <span className="tag">{property.status || "For Sale"}</span>
          </div>
        </div>
      </div>

      <div className="gallery-container">
        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <div
              key={index}
              className={`thumbnail ${
                selectedImage === image ? "active" : ""
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <img src={image} alt={ `Image ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="property-details-grid">
        <div className="property-description">
          <h2 className="description-title">About this property</h2>
          <div className="description-content">
            <p>{property.description || "No description available."}</p>
            <div className="highlights">
              <h3>Property Highlights</h3>
              <ul>
                {property.highlights
                  ? property.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))
                  : "No highlights available."}
              </ul>
            </div>
          </div>
        </div>

        <div className="property-sidebar">
          <div className="features-section">
            <h2 className="features-title">Property Features</h2>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-text">Bedrooms</div>
                <div className="feature-value">{property.bedrooms}</div>
              </div>
              <div className="feature-item">
                <div className="feature-text">Bathrooms</div>
                <div className="feature-value">{property.bathrooms}</div>
              </div>
              <div className="feature-item">
                <div className="feature-text">Square Feet</div>
                <div className="feature-value">{property.area}</div>
              </div>
              <div className="feature-item">
                <div className="feature-text">Garage</div>
                <div className="feature-value">{property.garage}</div>
              </div>
            </div>
          </div>

          <div className="amenities-section">
            <h2 className="features-title">Amenities</h2>
            <div className="amenities-list">
              {property.amenities
                ? property.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <i className="fas fa-check"></i>
                      <span>{amenity}</span>
                    </div>
                  ))
                : "No amenities available."}
            </div>
          </div>
        </div>
      </div>

      <div className="contact-section">
        <div className="agent-info">
          <div className="agent-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="agent-details">
            <h3>{property.builder || "Agent Name"}</h3>
            <p>{property.projectName || "Property Specialist"}</p>
          </div>
        </div>
        <div className="contact-buttons">
        <button className="contact-button" onClick={handlePreBooking}>
          <i className="fas fa-ticket-alt"></i> Pre-booking
        </button>
          <button className="schedule-button">
            <i className="fas fa-calendar-alt"></i>
            Schedule Viewing
          </button>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
