const express = require('express');
const mongoose = require('mongoose');
const { Web3 } = require('web3');
const Transaction = require('./models/Transaction');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc2.sepolia.org'));

const monitoredContracts = [
  '0x510848bE71Eac101a4Eb871C6436178e52210646',
  '0x9371E44CBD6924703F7Dd2AB812BF513992b1802',
  '0xbE381bf921a7129D2808A3eBaf8e474A775778D4'
].map(address => address.toLowerCase()); 

mongoose.connect('mongodb://localhost/rental-service')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json());
app.use(cors()); // Add this line to handle CORS

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 }); 
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

const saveTransaction = async (transaction) => {
  try {
    const newTransaction = new Transaction(transaction);
    await newTransaction.save();
    console.log('Transaction saved:', transaction); 
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const processBlock = async (blockNumber) => {
  try {
    const block = await web3.eth.getBlock(blockNumber, true);

    if (block && Array.isArray(block.transactions)) {
      for (let tx of block.transactions) {
        const to = tx.to ? tx.to.toLowerCase() : null; 
        const isMonitored = monitoredContracts.includes(to);

        if (isMonitored) {
          const receipt = await web3.eth.getTransactionReceipt(tx.hash);
          const functionName = receipt.logs[0]?.topics[0] || 'Unknown function'; 
          const transaction = {
            transactionHash: tx.hash,
            from: tx.from,
            to: tx.to,
            functionName: functionName,
            gas: tx.gas,
            value: web3.utils.fromWei(tx.value.toString(), 'ether'),
            timestamp: new Date(parseInt(block.timestamp, 10) * 1000)
          };

          console.log('Transaction detected:', transaction);
          await saveTransaction(transaction);
        }
      }
    }
  } catch (error) {
    console.error('Error processing block:', error);
  }
};


let latestBlockNumber = 0;

const pollNewBlocks = async () => {
  try {
    const currentBlockNumber = await web3.eth.getBlockNumber();
    if (currentBlockNumber > latestBlockNumber) {
      latestBlockNumber = currentBlockNumber;
      await processBlock(currentBlockNumber);
    }
  } catch (error) {
    console.error('Error polling new blocks:', error);
  }
};


setInterval(pollNewBlocks, 10000); 


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
