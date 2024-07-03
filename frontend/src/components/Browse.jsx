import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CarTokenABI from '../abis/CarTokenABI.json';
import RentalServiceABI from '../abis/RentalServiceABI.json';
import config from '../config';
import './Browse.css';

const web3 = new Web3(Web3.givenProvider || 'https://rpc.sepolia.org');

const carTokenContract = new web3.eth.Contract(CarTokenABI, config.carTokenAddress);
const rentalServiceContract = new web3.eth.Contract(RentalServiceABI, config.rentalServiceAddress);

const Browse = () => {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
    };

    const loadCars = async () => {
      try {
        const carList = await carTokenContract.methods.getAllCars().call();
        setCars(carList.map(car => ({
          ...car,
          dailyRate: parseInt(car.dailyRate),
          deposit: parseInt(car.deposit),
        })));
      } catch (error) {
        console.error('Error loading cars:', error);
      }
    };

    loadAccount();
    loadCars();
  }, []);

  const handleRentCar = async (car) => {
    const rentalDays = prompt('Enter the number of rental days:');
    if (!rentalDays || isNaN(rentalDays) || rentalDays <= 0) {
      alert('Invalid rental days');
      return;
    }

    const privateKey = prompt('Enter your private key:');
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      alert('Private key is invalid. It must be a 64-character hex string starting with "0x".');
      return;
    }

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const from = account.address;

      const gasPrice = await web3.eth.getGasPrice();

      const rentCar = rentalServiceContract.methods.rentCar(parseInt(car.tokenId), parseInt(rentalDays));
      const gas = await rentCar.estimateGas({ from });
      const data = rentCar.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.rentalServiceAddress,
        gas,
        gasPrice,
        data,
        nonce
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Car rented successfully!');
    } catch (error) {
      console.error('Error renting car:', error);
      alert(`Error renting car: ${error.message}`);
    }
  };

  const toggleCarDetails = (index) => {
    setSelectedCar(selectedCar === index ? null : index);
  };

  return (
    <div>
      <h3>Browse Cars</h3>
      <input type="text" placeholder="Search cars" />
      <button>Show Available</button>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Available</th>
            <th>Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car, index) => (
            <React.Fragment key={index}>
              <tr onClick={() => toggleCarDetails(index)}>
                <td>{car.brand} {car.model}</td>
                <td>{car.availableForRent ? 'Yes' : 'No'}</td>
                <td>{car.availableForRent ? car.dailyRate : 'N/A'}</td>
                <td>
                  {car.availableForRent && (
                    <button onClick={() => toggleCarDetails(index)}>Expand</button>
                  )}
                </td>
              </tr>
              {selectedCar === index && (
                <tr>
                  <td colSpan="4">
                    <div className="car-details">
                      <p>VIN: {car.vin}</p>
                      <p>License Plate: {car.licensePlate}</p>
                      <p>Body Type: {car.bodyType}</p>
                      <p>Daily Rate: {car.dailyRate}</p>
                      <p>Deposit: {car.deposit}</p>
                      <button onClick={() => handleRentCar(car)}>Rent</button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Browse;
