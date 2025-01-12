
import axiosClient from '../../api/axiosClient';

export const productService = {


  fetchProductDetails: async (id) => {
    try {
      const response = await axiosClient.get(`/product/${id}`);
      const productDetails = response.data.productDetails;
      const categoryName = response.data.categoryName;
      return { ...productDetails, categoryName };
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },
};

export const homepageService = {


  fetchHomepageProducts: async () => {
    try {
      const response = await axiosClient.get('/homepage');
      return response.data.allProducts;
    } catch (error) {
      console.error('Error fetching homepage products:', error);
      throw error;
    }
  },
};


export const cartService = {
 

    addToCart: async (productId, token) => {
      try {
        const response = await axiosClient.post('/addtocart', { id: productId, token });
        return response.data;
      } catch (error) {
        console.error('Error in addToCart service:', error);
        throw error;
      }
    },
  };
