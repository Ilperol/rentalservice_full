import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CarTokenABI from '../abis/CarTokenABI.json';
import RentalServiceABI from '../abis/RentalServiceABI.json';
import RentalTokenABI from '../abis/RentalTokenABI.json';
import config from '../config';
import './MyAccount.css';

const web3 = new Web3(Web3.givenProvider || 'https://rpc.sepolia.org');

const carTokenContract = new web3.eth.Contract(CarTokenABI, config.carTokenAddress);
const rentalServiceContract = new web3.eth.Contract(RentalServiceABI, config.rentalServiceAddress);
const rentalTokenContract = new web3.eth.Contract(RentalTokenABI, config.rentalTokenAddress);

const MyAccount = ({ account }) => {
  const [myCars, setMyCars] = useState([]);
  const [myRents, setMyRents] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedRent, setSelectedRent] = useState(null);
  const [newCar, setNewCar] = useState({
    vin: '',
    licensePlate: '',
    bodyType: '',
    brand: '',
    model: ''
  });
  const [showNewCarModal, setShowNewCarModal] = useState(false);

  useEffect(() => {
    const loadMyCars = async () => {
      try {
        const carList = await carTokenContract.methods.getCarsByOwner(account).call();
        setMyCars(carList);
      } catch (error) {
        console.error('Error loading cars:', error);
      }
    };

    const loadMyRents = async () => {
      try {
        const rents = await rentalServiceContract.methods.getRentsByRenter(account).call();
        setMyRents(rents);
      } catch (error) {
        console.error('Error loading rents:', error);
      }
    };

    loadMyCars();
    loadMyRents();
  }, [account]);

  const handleListCarForRent = async (tokenId) => {
    const dailyRate = prompt('Enter daily rate for rent:');
    if (!dailyRate || isNaN(dailyRate) || dailyRate <= 0) {
      alert('Invalid daily rate');
      return;
    }

    const deposit = prompt('Enter deposit amount:');
    if (!deposit || isNaN(deposit) || deposit <= 0) {
      alert('Invalid deposit amount');
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

      const listCarForRent = carTokenContract.methods.listCarForRent(tokenId, parseInt(dailyRate), parseInt(deposit));
      const gas = await listCarForRent.estimateGas({ from });
      const data = listCarForRent.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.carTokenAddress,
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
        nonce: web3.utils.toHex(nonce)
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Car listed for rent successfully!');
      setMyCars(await carTokenContract.methods.getCarsByOwner(from).call());
    } catch (error) {
      console.error('Error listing car for rent:', error);
      if (error.message.includes('execution reverted')) {
        alert(`Error listing car for rent: ${error.message}. This might be due to insufficient funds, invalid inputs, or the car not being available for rent.`);
      } else {
        alert('Error listing car for rent');
      }
    }
  };

  const handleRemoveCarFromRent = async (tokenId) => {
    const privateKey = prompt('Enter your private key:');
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      alert('Private key is invalid. It must be a 64-character hex string starting with "0x".');
      return;
    }

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const from = account.address;

      const gasPrice = await web3.eth.getGasPrice();

      const removeCarFromRent = carTokenContract.methods.removeCarFromRental(tokenId);
      const gas = await removeCarFromRent.estimateGas({ from });
      const data = removeCarFromRent.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.carTokenAddress,
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
        nonce: web3.utils.toHex(nonce)
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Car removed from rent successfully!');
      setMyCars(await carTokenContract.methods.getCarsByOwner(from).call());
    } catch (error) {
      console.error('Error removing car from rent:', error);
      alert('Error removing car from rent');
    }
  };

  const handleReturnCar = async (tokenId) => {
    const privateKey = prompt('Enter your private key:');
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      alert('Private key is invalid. It must be a 64-character hex string starting with "0x".');
      return;
    }

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const from = account.address;

      const gasPrice = await web3.eth.getGasPrice();

      const returnCar = rentalServiceContract.methods.returnCar(tokenId);
      const gas = await returnCar.estimateGas({ from });
      const data = returnCar.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.rentalServiceAddress,
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
        nonce: web3.utils.toHex(nonce)
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Car returned successfully!');
      setMyRents(await rentalServiceContract.methods.getRentsByRenter(from).call());
    } catch (error) {
      console.error('Error returning car:', error);
      alert('Error returning car');
    }
  };

  const handleMintCar = async (e) => {
    e.preventDefault();
    const privateKey = prompt('Enter your private key:');
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      alert('Private key is invalid. It must be a 64-character hex string starting with "0x".');
      return;
    }

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const from = account.address;

      const gasPrice = await web3.eth.getGasPrice();

      const { vin, licensePlate, bodyType, brand, model } = newCar;
      const mintCar = carTokenContract.methods.mint(from, vin, licensePlate, bodyType, brand, model);
      const gas = await mintCar.estimateGas({ from });
      const data = mintCar.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.carTokenAddress,
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
        nonce: web3.utils.toHex(nonce)
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Car minted successfully!');
      setShowNewCarModal(false);
      setMyCars(await carTokenContract.methods.getCarsByOwner(from).call());
    } catch (error) {
      console.error('Error minting car:', error);
      alert('Error minting car');
    }
  };

  const handleWithdrawDividends = async () => {
    const amount = prompt('Enter the amount to withdraw:');
    const privateKey = prompt('Enter your private key:');
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Invalid amount');
      return;
    }
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      alert('Private key is invalid. It must be a 64-character hex string starting with "0x".');
      return;
    }

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const from = account.address;

      const gasPrice = await web3.eth.getGasPrice();

      const withdrawDividends = rentalTokenContract.methods.withdrawDividends(web3.utils.toWei(amount, 'ether'));
      const gas = await withdrawDividends.estimateGas({ from });
      const data = withdrawDividends.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.rentalTokenAddress,
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
        nonce: web3.utils.toHex(nonce)
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Dividends withdrawn successfully!');
    } catch (error) {
      console.error('Error withdrawing dividends:', error);
      alert('Error withdrawing dividends');
    }
  };

  const handleApproveAllowance = async () => {
    const amount = prompt('Enter the amount to approve:');
    const privateKey = prompt('Enter your private key:');
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Invalid amount');
      return;
    }
    if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      alert('Private key is invalid. It must be a 64-character hex string starting with "0x".');
      return;
    }

    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const from = account.address;

      const gasPrice = await web3.eth.getGasPrice();

      const approve = rentalTokenContract.methods.approve(config.rentalServiceAddress, web3.utils.toWei(amount, 'ether'));
      const gas = await approve.estimateGas({ from });
      const data = approve.encodeABI();
      const nonce = await web3.eth.getTransactionCount(from);

      const tx = {
        from,
        to: config.rentalTokenAddress,
        gas: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
        nonce: web3.utils.toHex(nonce)
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Allowance approved successfully!');
    } catch (error) {
      console.error('Error approving allowance:', error);
      alert('Error approving allowance');
    }
  };

  const toggleCarDetails = (index, type) => {
    if (type === 'car') {
      setSelectedCar(selectedCar === index ? null : index);
    } else if (type === 'rent') {
      setSelectedRent(selectedRent === index ? null : index);
    }
  };

  return (
    <div>
      <h3>My Cars</h3>
      <ul>
        {myCars.map((car, index) => (
          <li key={index} onClick={() => toggleCarDetails(index, 'car')}>
            {car.brand} {car.model}
            {selectedCar === index && (
              <div className="car-details">
                <p>VIN: {car.vin}</p>
                <p>License Plate: {car.licensePlate}</p>
                <p>Body Type: {car.bodyType}</p>
                {car.availableForRent ? (
                  <>
                    <p>Daily Rate: {car.dailyRate.toString()}</p>
                    <p>Deposit: {car.deposit.toString()}</p>
                    <button onClick={() => handleRemoveCarFromRent(car.tokenId)}>Remove from Rent</button>
                  </>
                ) : (
                  <button onClick={() => handleListCarForRent(car.tokenId)}>List for Rent</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <h3>My Rents</h3>
      <ul>
        {myRents.map((rent, index) => (
          <li key={index} onClick={() => toggleCarDetails(index, 'rent')}>
            Car Id {rent.tokenId.toString()}
            {selectedRent === index && (
              <div className="car-details">
                <p>Start Date: {new Date(Number(rent.startDate) * 1000).toLocaleDateString()}</p>
                <p>End Date: {new Date(Number(rent.endDate) * 1000).toLocaleDateString()}</p>
                <p>Daily Rate: {rent.dailyRate.toString()}</p>
                <p>Deposit: {rent.deposit.toString()}</p>
                <button onClick={() => handleReturnCar(rent.tokenId)}>Return</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <h3>Actions</h3>
      <button className="green-plus" onClick={() => setShowNewCarModal(true)}>+</button>
      {showNewCarModal && (
        <div className="modal">
          <form onSubmit={handleMintCar}>
            <h3>Mint New Car</h3>
            <input
              type="text"
              placeholder="VIN"
              value={newCar.vin}
              onChange={(e) => setNewCar({ ...newCar, vin: e.target.value })}
            />
            <input
              type="text"
              placeholder="License Plate"
              value={newCar.licensePlate}
              onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
            />
            <input
              type="text"
              placeholder="Body Type"
              value={newCar.bodyType}
              onChange={(e) => setNewCar({ ...newCar, bodyType: e.target.value })}
            />
            <input
              type="text"
              placeholder="Brand"
              value={newCar.brand}
              onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
            />
            <input
              type="text"
              placeholder="Model"
              value={newCar.model}
              onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
            />
            <button type="submit">Mint Car</button>
            <button type="button" onClick={() => setShowNewCarModal(false)}>Cancel</button>
          </form>
        </div>
      )}
      <button onClick={handleWithdrawDividends}>Withdraw Dividends</button>
      <button onClick={handleApproveAllowance}>Approve Allowance</button>
    </div>
  );
};

export default MyAccount;
