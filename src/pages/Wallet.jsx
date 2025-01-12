import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1); // Current page
  const [hasMore, setHasMore] = useState(true); // Check if more transactions are available
  const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");

  
  
  useEffect(() => {
    walletFetch();
    fetchTransactions(1); // Fetch first page of transactions
  }, []);

  const walletFetch = async () => {
    try {
      const response = await axiosClient.post("/walletfetch", { token });
      console.log(response);
      
      setBalance(response.data.wallet.balance);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (pageNumber) => {
    if (loadingMore) return; // Prevent multiple requests while loading

    setLoadingMore(true);

    try {
      const response = await axiosClient.post("/transactionhistory", {
        token,
        page: pageNumber,
        limit: 5, // Number of transactions per page
      });

      const newTransactions = response.data.transaction;
      setTransactions((prev) => [...prev, ...newTransactions]);

      // Update hasMore based on total transactions
      if (newTransactions.length < 5) {
        setHasMore(false);
      } else {
        setPage(pageNumber); // Update current page
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Wallet Details</h1>

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {/* Wallet Balance */}
            <div className="mb-6">
              <p className="text-lg text-gray-700 font-medium">
                Wallet Balance: <span className="text-green-600 font-bold">₹{balance}</span>
              </p>
            </div>

            {/* Transaction History */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h2>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="text-left px-4 py-2 border">Date</th>
                        <th className="text-left px-4 py-2 border">Type</th>
                        <th className="text-right px-4 py-2 border">Amount</th>
                        <th className="text-left px-4 py-2 border">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="border-t">
                          <td className="px-4 py-2 border text-gray-700">
                            {new Date(transaction.date).toLocaleString()}
                          </td>
                          <td
                            className={`px-4 py-2 border font-medium ${
                              transaction.type === "credit" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type}
                          </td>
                          <td className="px-4 py-2 border text-right text-gray-700">
                            ₹{transaction.amount}
                          </td>
                          <td className="px-4 py-2 border text-gray-700">{transaction.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {hasMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        className={`px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition ${
                          loadingMore ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => fetchTransactions(page + 1)}
                        disabled={loadingMore}
                      >
                        {loadingMore ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No transactions found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
