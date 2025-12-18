import api from "./api";

const calculateBasket = async (basketData) => {
  return api.post("/paniers/calculer", basketData).then((response) => {
    return response.data;
  });
};

const basketService = {
  calculateBasket,
};

export default basketService;
