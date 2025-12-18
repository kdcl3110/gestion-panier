import api from "./api";


const getProducts = async () => {
  return api.get("/products").then((response) => {
    return response.data;
  });
};

const productService = {
  getProducts,
};  

export { getProducts};
export default productService;