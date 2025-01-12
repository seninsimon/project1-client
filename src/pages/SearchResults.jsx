import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(useLocation().search).get('q');

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  const fetchSearchResults = async (searchQuery) => {
    try {
      const response = await axiosClient.get(`/search?q=${searchQuery}`);
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for: {query}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="border p-4 rounded-lg">
                <img src={product.imageUrls[0]} alt={product.productName} />
                <h2>{product.productName}</h2>
                <p>{product.description}</p>
                <p>₹{product.price}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
