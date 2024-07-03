import React, { useState, useEffect } from 'react';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTransactions(data.map(transaction => ({ ...transaction, expanded: false })));
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error);
      }
    };

    fetchTransactions();
  }, []);

  const toggleDetails = (index) => {
    const newTransactions = [...transactions];
    const transactionIndex = (currentPage - 1) * transactionsPerPage + index;
    newTransactions[transactionIndex].expanded = !newTransactions[transactionIndex].expanded;
    setTransactions(newTransactions);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const firstPage = 1;
    const lastPage = totalPages;

    const previousPage = currentPage > firstPage ? currentPage - 1 : firstPage;
    const nextPage = currentPage < lastPage ? currentPage + 1 : lastPage;

    if (currentPage > firstPage) {
      pages.push(
        <button
          key={firstPage}
          onClick={() => handlePageChange(firstPage)}
          style={{ backgroundColor: 'gray', color: 'black', margin: '0 5px' }}
        >
          {firstPage}
        </button>
      );
    }

    if (currentPage > firstPage + 1) {
      pages.push(
        <button
          key={previousPage}
          onClick={() => handlePageChange(previousPage)}
          style={{ backgroundColor: 'gray', color: 'black', margin: '0 5px' }}
        >
          {'<'}
        </button>
      );
    }

    pages.push(
      <button
        key={currentPage}
        onClick={() => handlePageChange(currentPage)}
        className="active"
        style={{ backgroundColor: 'gray', color: 'black', margin: '0 5px' }}
      >
        {currentPage}
      </button>
    );

    if (currentPage < lastPage - 1) {
      pages.push(
        <button
          key={nextPage}
          onClick={() => handlePageChange(nextPage)}
          style={{ backgroundColor: 'gray', color: 'black', margin: '0 5px' }}
        >
          {'>'}
        </button>
      );
    }

    if (currentPage < lastPage) {
      pages.push(
        <button
          key={lastPage}
          onClick={() => handlePageChange(lastPage)}
          style={{ backgroundColor: 'gray', color: 'black', margin: '0 5px' }}
        >
          {lastPage}
        </button>
      );
    }

    return pages;
  };

  if (error) {
    return <div>Error fetching transactions: {error.message}</div>;
  }

  return (
    <div>
      <h3>Transaction History</h3>
      <ul>
        {currentTransactions.map((transaction, index) => (
          <li key={index}>
            <div onClick={() => toggleDetails(index)}>
              <p>Transaction Hash: {transaction.transactionHash}</p>
              {transaction.expanded && (
                <div className="transaction-details">
                  <p>From: {transaction.from}</p>
                  <p>To: {transaction.to}</p>
                  <p>Function: {transaction.functionName}</p>
                  <p>Gas: {transaction.gas}</p>
                  <p>Value: {transaction.value}</p>
                  <p>Timestamp: {new Date(transaction.timestamp).toLocaleString()}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default History;
