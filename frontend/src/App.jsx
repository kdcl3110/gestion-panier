import React, { useState, useEffect } from "react";
import {
  ConfigProvider,
  Layout,
  Typography,
  Card,
  Select,
  InputNumber,
  Button,
  Table,
  message,
  Space,
  Modal,
  Form,
  Input,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import clientService from './services/client.service'
import productService from "./services/product.service";
import basketService from "./services/basket.service";
import { calc } from "antd/es/theme/internal";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function App() {
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [panier, setPanier] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clientType, setClientType] = useState("particulier");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClients();
    fetchProduits();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients();
      setClients(response);
    } catch (error) {
      message.error("Erreur lors du chargement des clients");
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await productService.getProducts();
      setProduits(response);
    } catch (error) {
      message.error("Erreur lors du chargement des produits");
    }
  };

  const handleClientChange = (clientId) => {
    const client = clients.find((c) => `${c.type}-${c.id}` === clientId);
    setSelectedClient(client);
    setPanier([]);
    setTotal(null);
  };

  const handleAddProduct = (produitId) => {
    const existingProduct = panier.find((item) => item.produitId === produitId);
    if (existingProduct) {
      setPanier(
        panier.map((item) =>
          item.produitId === produitId
            ? { ...item, quantite: item.quantite + 1 }
            : item
        )
      );
    } else {
      setPanier([...panier, { produitId, quantite: 1 }]);
    }
  };

  const handleQuantityChange = (produitId, quantite) => {
    if (quantite <= 0) {
      setPanier(panier.filter((item) => item.produitId !== produitId));
    } else {
      setPanier(
        panier.map((item) =>
          item.produitId === produitId ? { ...item, quantite } : item
        )
      );
    }
  };

  const handleCalculate = async () => {
    if (!selectedClient || panier.length === 0) {
      message.warning(
        "Veuillez sélectionner un client et ajouter des produits"
      );
      return;
    }

    setLoading(true);
    try {
      const data = {
        clientType: selectedClient.type,
        clientId: selectedClient.id,
        items: panier,
      };

      const response = await basketService.calculateBasket(data);
      setTotal(response);
      message.success("Montant calculé avec succès");
    } catch (error) {
      message.error("Erreur lors du calcul du montant");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPanier([]);
    setTotal(null);
  };

  const handleCreateClient = async (values) => {
    try {
      await clientService.createClient(clientType, values);
      message.success("Client créé avec succès");
      fetchClients();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Erreur lors de la création du client");
    }
  };

  const columns = [
    {
      title: "Produit",
      dataIndex: "produit",
      key: "produit",
    },
    {
      title: "Quantité",
      dataIndex: "quantite",
      key: "quantite",
      align: "center",
    },
    {
      title: "Prix unitaire",
      dataIndex: "prixUnitaire",
      key: "prixUnitaire",
      align: "right",
      render: (prix) => `${prix.toFixed(2)} €`,
    },
    {
      title: "Sous-total",
      dataIndex: "sousTotal",
      key: "sousTotal",
      align: "right",
      render: (sousTotal) => `${sousTotal.toFixed(2)} €`,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <Layout className="min-h-screen">
        <Header className="bg-white border-b border-gray-200 flex items-center px-8">
          <ShoppingCartOutlined className="text-2xl text-blue-500 mr-3" />
          <Title level={3} className="m-0">
            Gestion des Paniers
          </Title>
        </Header>

        <Content className="p-8">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-6 shadow-sm">
              <Space direction="vertical" className="w-full" size="large">
                <div className="">
                  <Text strong className="block mb-2">
                    Sélectionner un client
                  </Text>
                  <div className="flex flex-1 justify-between">
                    <Select
                      className="w-[85%]"
                      placeholder="Choisir un client"
                      onChange={handleClientChange}
                      value={
                        selectedClient
                          ? `${selectedClient.type}-${selectedClient.id}`
                          : undefined
                      }
                      suffixIcon={<UserOutlined />}
                      size="large"
                    >
                      {clients.map((client) => (
                        <Option
                          key={`${client.type}-${client.id}`}
                          value={`${client.type}-${client.id}`}
                        >
                          {client.type === "particulier"
                            ? `${client.prenom} ${client.nom} (Particulier)`
                            : `${client.raison_sociale} (Professionnel - CA: ${(
                                client.chiffre_affaires / 1000000
                              ).toFixed(1)}M€)`}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => setIsModalVisible(true)}
                      size="large"
                    >
                      Nouveau client
                    </Button>
                  </div>
                </div>

                {selectedClient && (
                  <div className="bg-gray-50 p-4 rounded">
                    <Text strong>Ajouter des produits au panier</Text>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {produits.map((produit) => {
                        const itemInPanier = panier.find(
                          (item) => item.produitId === produit.id
                        );
                        return (
                          <Card
                            key={produit.id}
                            size="small"
                            className="hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col h-full">
                              <Text strong className="mb-2">
                                {produit.nom}
                              </Text>
                              <Text type="secondary" className="text-xs mb-3">
                                {produit.code}
                              </Text>
                              <div className="mt-auto flex items-center justify-between">
                                {itemInPanier ? (
                                  <InputNumber
                                    min={0}
                                    value={itemInPanier.quantite}
                                    onChange={(value) =>
                                      handleQuantityChange(produit.id, value)
                                    }
                                    className="w-24"
                                  />
                                ) : (
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => handleAddProduct(produit.id)}
                                  >
                                    Ajouter
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Space>
            </Card>

            {panier.length > 0 && (
              <Card className="shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4} className="m-0">
                    Panier
                  </Title>
                  <Space>
                    <Button onClick={handleReset}>Réinitialiser</Button>
                    <Button
                      type="primary"
                      onClick={handleCalculate}
                      loading={loading}
                      size="large"
                    >
                      Calculer le montant
                    </Button>
                  </Space>
                </div>

                {total && (
                  <div className="mb-6">
                    <Table
                      columns={columns}
                      dataSource={total.details}
                      pagination={false}
                      size="small"
                      rowKey={(record) => record.produit}
                      className="mb-4"
                    />
                    <div className="flex justify-end">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Text strong className="text-lg">
                          Total :{" "}
                        </Text>
                        <Text strong className="text-2xl text-blue-600 ml-2">
                          {total.total.toFixed(2)} €
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </Content>

        <Modal
          title="Créer un nouveau client"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <div className="mb-4">
            <Text strong className="block mb-2">
              Type de client
            </Text>
            <Select
              className="w-full"
              value={clientType}
              onChange={setClientType}
            >
              <Option value="particulier">Particulier</Option>
              <Option value="professionnel">Professionnel</Option>
            </Select>
          </div>

          <Form form={form} layout="vertical" onFinish={handleCreateClient}>
            <Form.Item
              label="Identifiant"
              name="identifiant"
              rules={[{ required: true, message: "Identifiant requis" }]}
            >
              <Input />
            </Form.Item>

            {clientType === "particulier" ? (
              <>
                <Form.Item
                  label="Prénom"
                  name="prenom"
                  rules={[{ required: true, message: "Prénom requis" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Nom"
                  name="nom"
                  rules={[{ required: true, message: "Nom requis" }]}
                >
                  <Input />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  label="Raison sociale"
                  name="raison_sociale"
                  rules={[
                    { required: true, message: "Raison sociale requise" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Numéro de TVA intracommunautaire"
                  name="numero_tva"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Numéro d'immatriculation"
                  name="numero_immatriculation"
                  rules={[
                    {
                      required: true,
                      message: "Numéro d'immatriculation requis",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Chiffre d'affaires annuel (€)"
                  name="chiffre_affaires"
                  rules={[
                    { required: true, message: "Chiffre d'affaires requis" },
                  ]}
                >
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </>
            )}

            <Form.Item className="mb-0 mt-6">
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Annuler
                </Button>
                <Button type="primary" htmlType="submit">
                  Créer
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
