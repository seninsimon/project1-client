import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ZenztoreNav from '../components/ZenztoreNav';
import CategoryNav from '../components/CategoryNav';
import axiosClient from '../api/axiosClient';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


const CategoryPage = () => {
  const { categoryname } = useParams();
  const [productDetails, setProductDetails] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cat, setCat] = useState('');
  const productsPerPage = 3;

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategoryDetails();
  }, [categoryname, navigate]);

  useEffect(() => {
    applyFilter();
  }, [filter, productDetails]);

  const fetchCategoryDetails = async () => {
    try {
      const response = await axiosClient.get(`/category/${categoryname}`);
      setProductDetails(response.data.productDetails);
      setCat(response.data.productDetails[0].categoryId.categoryName);
    } catch (error) {
      console.log(error);
      navigate('*');
    }
  };

  const handleProductDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const applyFilter = () => {
    let sortedProducts = [...productDetails];
    switch (filter) {
      case 'popularity':
        sortedProducts.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'priceLowHigh':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighLow':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'averageRating':
        sortedProducts.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'featured':
        sortedProducts.sort((a, b) => b.featured - a.featured);
        break;
      case 'newArrivals':
        sortedProducts.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        break;
      case 'alphabeticalAZ':
        sortedProducts.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'alphabeticalZA':
        sortedProducts.sort((a, b) => b.productName.localeCompare(a.productName));
        break;
      default:
        sortedProducts.sort((a, b) => b.popularity - a.popularity);
    }
    setFilteredProducts(sortedProducts);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);




  const handleWishlist = async (productId) => {

    const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken")

    const wishlistData = { token, productId }

    console.log("wishlist data", wishlistData);


    try {

      const wishlistResponse = await axiosClient.post('/wishlist', wishlistData)

      console.log("wishlist response  :", wishlistResponse);

      toast.success("product added to the wishlist")


    } catch (error) {

      toast.success("product already added to the wishlist")
      console.log(error)

    }

  }

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleSearch = () => {
    const searchedProducts = productDetails.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(searchedProducts);
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
              <label htmlFor="filter" className="block mb-2 font-medium">
                Sort by:
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {/* <option value="popularity">Popularity</option> */}
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                {/* <option value="averageRating">Average Ratings</option> */}
                {/* <option value="featured">Featured</option> */}
                {/* <option value="newArrivals">New Arrivals</option> */}
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
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {currentProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-white border cursor-pointer p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center relative"
                  onClick={() => handleProductDetails(product._id)}
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
                  {console.log(product._id)}
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
            {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, index) => (
              <motion.li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-2 leading-tight rounded-lg ${currentPage === index + 1 ? 'bg-orange-500 text-white' : 'bg-white text-blue-500'} border border-gray-300 hover:bg-orange-500 hover:text-white`}
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

