import api from "./api";

const getClients = async () => {
   return api.get("/clients").then((response) => {
    return response.data;
  });
}

const createClient = async (clientType, clientData) => {
  return api.post(`/clients/${clientType}`, clientData).then((response) => {
    return response.data;
  });
}

const clientService = {
  getClients,
  createClient
};

export { getClients, createClient };
export default clientService;