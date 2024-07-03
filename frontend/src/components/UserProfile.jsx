import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import CarTokenABI from '../abis/CarTokenABI.json';

const web3 = new Web3(Web3.givenProvider || 'https://rpc.sepolia.org');

const carTokenAddress = '0xfD55378dBA9D115b375E1E56D2a73CC96069E3e0';

const carTokenContract = new web3.eth.Contract(CarTokenABI, carTokenAddress);

const UserProfile = () => {
  const { userAddress } = useParams();
  const [userCars, setUserCars] = useState([]);

  useEffect(() => {
    loadUserCars();
  }, [userAddress]);

  const loadUserCars = async () => {
    const carList = await carTokenContract.methods.getAllCars().call();
    const userCarList = carList.filter(car => car.owner === userAddress);
    setUserCars(userCarList);
  };

  return (
    <div>
      <h2>User Profile</h2>
      <h3>Cars owned by {userAddress}</h3>
      <ul>
        {userCars.map((car, index) => (
          <li key={index}>
            {car.brand} {car.model}
            <div className="car-details">
              <p>VIN: {car.vin}</p>
              <p>License Plate: {car.licensePlate}</p>
              <p>Body Type: {car.bodyType}</p>
              <p>Daily Rate: {car.dailyRate}</p>
              <p>Deposit: {car.deposit}</p>
              <p>Available for Rent: {car.availableForRent ? 'Yes' : 'No'}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;
