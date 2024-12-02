import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PropertyList.css';
import { pinata } from '../config';
import Web3 from 'web3';
import { abi } from '../abi';
import { contractAddress } from '../contract';

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

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        if (!window.ethereum) {
          console.error("Metamask is not installed.");
          return;
        }
    
        const web3 = new Web3(window.ethereum);
    
        // Initialize contract instance
        const contract = new web3.eth.Contract(abi, contractAddress);
        console.log(contract)
        const apartmentCount = await contract.methods.apartmentCounter().call();
        console.log(apartmentCount)
         // Fetch the total number of apartments
        const apartments = [];

        for (let i = 0; i < apartmentCount; i++) {
          const apartment = await contract.methods.apartments(i).call();
          console.log(apartment)
          if (apartment.bookedUnits < apartment.totalUnits) {
            const imageUrl = await getSignedUrl(apartment.blueprintHash); // Get signed URL for image
            apartments.push({
              id: i,
              title: apartment.projectName,
              price: apartment.totalCost,
              location: apartment.location,
              bedrooms: apartment.totalUnits,
              bathrooms: apartment.bookedUnits,
              area: apartment.pricePerUnit,
              image: imageUrl,
            });
          }
        }
        setProperties(apartments);
      } catch (err) {
        console.error('Error fetching apartments:', err);
      }
    };

    fetchApartments();
  }, []);
  console.log(properties);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPrice = true;
    if (priceRange === 'low') {
      matchesPrice = property.price <= 200000;
    } else if (priceRange === 'mid') {
      matchesPrice = property.price > 200000 && property.price <= 500000;
    } else if (priceRange === 'high') {
      matchesPrice = property.price > 500000;
    }

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="property-list">
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="all">All Prices</option>
          <option value="low">$0 - $200,000</option>
          <option value="mid">$200,000 - $500,000</option>
          <option value="high">$500,000+</option>
        </select>
      </div>
      <div  className="properties-grid">
        {filteredProperties.map((property) => (
          <Link to={`/property/${property.id}`} key={property.id} className="property-card">
            <img src={property.image} alt={property.title} />
            <div className="property-info">
              <h3>{property.title}</h3>
              <p className="price">{property.price.toLocaleString()} GWEI</p>
              <p className="details">
              Total Units: {Number(property.bedrooms)} |
              Price Per Unit :{Number(property.area)} |
              Booked Units :{Number(property.bathrooms)} 
              </p>
              <p className="location">{property.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PropertyList;
