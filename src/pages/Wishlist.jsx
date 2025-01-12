import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';


const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const navigate = useNavigate()

  const fetchWishlist = async () => {
    const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
    console.log("Token:", token);

    try {
      const response = await axiosClient.post('/productwishlist', { token });
      console.log("Wishlist Response:", response.data.wishlist);

      const products = response.data.wishlist.flatMap((item) =>
        item.products.map((product) => ({
          id: product.productId._id,
          name: product.productId.productName,
          price: product.productId.price,
          image: product.productId.imageUrls[0],
          description: product.productId.description,
        }))
      );

      setWishlistProducts(products);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
       const deleteresponse =    await axiosClient.post(`/productwishlist/${productId}` , {token})


      setWishlistProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
      console.log(`Product with ID ${productId} removed from wishlist.`);
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Your Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistProducts.length > 0 ? (
          wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border  p-4 items-center rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-72 object-cover cursor-pointer rounded mb-4"
                onClick={()=>navigate(`/product/${product.id}`)}
              />
              <h3 className="text-lg font-semibold text-center mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 text-center mb-4 flex-grow">{product.description}</p>
              <div className="w-full text-center mt-4">
                {/* <p className="font-bold text-orange-500 text-lg">₹{product.price}</p> */}
              </div>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition mt-2"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
