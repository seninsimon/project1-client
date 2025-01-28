import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ZenztoreNav from "../components/ZenztoreNav";
import CategoryNav from "../components/CategoryNav";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const { categoryname } = useParams();
  const [productDetails, setProductDetails] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  
  


  


  const navigate = useNavigate();
  const productsPerPage = 6; // Limit for products per page

  useEffect(() => {
    fetchCategoryDetails();
  }, [categoryname, currentPage, sort, searchTerm]);

  const fetchCategoryDetails = async () => {
    try {
      const response = await axiosClient.get(`/category/${categoryname}`, {
        params: {
          sort,
          search: searchTerm,
          page: currentPage,
          limit: productsPerPage,
        },
      });

      const { productDetails, totalPages } = response.data;
      setProductDetails(productDetails);
      setTotalPages(totalPages);
      if (productDetails.length > 0) {
        setCat(categoryname)
      }

    } catch (error) {
      console.log(error);
      navigate("*");
    }
  };

  const handleWishlist = async (productId) => {
    const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
    

    const wishlistData = { token, productId };

    try {
      const wishlistResponse = await axiosClient.post("/wishlist", wishlistData);
      toast.success("Product added to the wishlist");
    } catch (error) {
      toast.error("Product already added to the wishlist");
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ZenztoreNav />
      <CategoryNav />

      {/* Breadcrumb */}
      <motion.nav
        className="text-sm mb-4 border w-4/5 mx-auto mt-6 text-gray-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ol className="flex space-x-2">
          <li>
            <Link to="/" className="hover:text-blue-600">Home</Link>
          </li>
          <li>&gt;</li>
          <li>
            <Link to={`/category/${categoryname}`} className="hover:text-blue-600 capitalize">
              {cat}
            </Link>
          </li>
        </ol>
      </motion.nav>

      <div className="container mx-auto mt-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4 bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="mb-4">
              <label htmlFor="sort" className="block mb-2 font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">None</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="alphabeticalAZ">aA - zZ</option>
                <option value="alphabeticalZA">zZ - aA</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="search" className="block mb-2 font-medium">
                Search Products:
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="w-full lg:w-3/4">
            <h1 className="text-2xl font-bold mb-4 capitalize">{categoryname}</h1>
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
            >
              {productDetails.map((product, index) => (
                <motion.div
                  key={product._id}
                  className="bg-white border cursor-pointer p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center relative"
                  onClick={() => navigate(`/product/${product._id}`)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Product Image */}
                  <img
                    className="w-full md:w-48 h-48 object-cover mb-4 md:mb-0 md:mr-4 rounded-lg"
                    src={product.imageUrls[0]}
                    alt={product.productName}
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-2">{product.productName}</h2>
                    <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                    <p className="font-bold text-lg text-orange-500">₹{product.price}</p>
                  </div>

                  {/* Wishlist Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the product details
                      handleWishlist(product._id);
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.657l1.318-1.339a4.5 4.5 0 016.364 0 4.5 4.5 0 010 6.364L12 21.657l-7.682-7.975a4.5 4.5 0 010-6.364z"
                      />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Pagination */}
      <motion.div
        className="flex justify-center mt-6 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav>
          <ul className="flex gap-4 items-center -space-x-px">
            {Array.from({ length: totalPages }, (_, index) => (
              <motion.li key={index}>
                <button
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-2 leading-tight rounded-lg ${
                    currentPage === index + 1 ? "bg-orange-500 text-white" : "bg-white text-blue-500"
                  } border border-gray-300 hover:bg-orange-500 hover:text-white`}
                >
                  {index + 1}
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.div>
    </div>
  );
};

export default CategoryPage;
