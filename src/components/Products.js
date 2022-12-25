import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
import { useLocation } from "react-router-dom";
import "./Products.css";

// Definition of Data Structures used
/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const currentUserToken = localStorage.getItem("token");
  const { pathname } = useLocation();

  const [productsList, setProductsList] = useState([]);
  const [initialProductsList, setInitialProductsList] = useState([]);
  const [isLoading, setLoadingStatus] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const [cartProductsList, setCartProductsList] = useState([]);
  const [modifiedCartProductsList, setModifiedCartProductsList] = useState([]);
  const [isCartLoading, setCartLoadingStatus] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (currentUserToken) {
      setLoginStatus(true);
    } else {
      setLoginStatus(false);
    }
  }, [currentUserToken]);

  useEffect(() => {
    performAPICall();
  }, []);

  useEffect(() => {
    if (currentUserToken) {
      fetchCart(currentUserToken);
    }
  }, []);

  useEffect(() => {
    if (cartProductsList.length >= 0 && initialProductsList.length > 0) {
      let list = generateCartItemsFrom(cartProductsList, initialProductsList);
      setModifiedCartProductsList(list);
    }
  }, [cartProductsList, initialProductsList]);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setLoadingStatus(true);
    try {
      let successResult = await axios.get(`${config.endpoint}/products`);
      setProductsList(successResult.data);
      setInitialProductsList(successResult.data);
      setLoadingStatus(false);
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong. Check the backend console for more details",
        { variant: "error" }
      );
      setLoadingStatus(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setLoadingStatus(true);
    try {
      let successResult = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setProductsList(successResult.data);
      setLoadingStatus(false);
    } catch (error) {
      if (
        (!error.response && error.request) ||
        (error.response && error.response.status !== 404)
      ) {
        enqueueSnackbar(
          "Something went wrong. Check the backend console for more details",
          { variant: "error" }
        );
      }
      setProductsList([]);
      setLoadingStatus(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (callbackFxn, debounceTimeout) => {
    let timerId;

    return (...args) => {
      clearTimeout(timerId);

      timerId = setTimeout(() => {
        callbackFxn(...args);
      }, debounceTimeout);
    };
  };

  const updateDebounceText = debounceSearch(performSearch, 500);

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let successResult = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartProductsList(successResult.data);
      return successResult.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.find((item) => item.productId === productId);
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    token = localStorage.getItem("token");
    items = cartProductsList;
    products = initialProductsList;

    if (options.preventDuplicate) {
      if (!token) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
      } else {
        let isProductInCart = isItemInCart(items, productId);

        if (isProductInCart) {
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item",
            { variant: "warning" }
          );
        } else {
          try {
            let successResult = await axios.post(
              `${config.endpoint}/cart`,
              { productId, qty },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setCartProductsList(successResult.data);
          } catch (error) {
            if (error.response) {
              enqueueSnackbar(error.response.data.message, {
                variant: "error",
              });
            } else {
              enqueueSnackbar(
                "Could not add to cart. Check that the backend is running, reachable and returns valid JSON",
                { variant: "error" }
              );
            }
          }
        }
      }
    } else {
      if (options.action === "add") {
        setCartLoadingStatus(true);
        try {
          let successResult = await axios.post(
            `${config.endpoint}/cart`,
            { productId, qty: qty + 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCartProductsList(successResult.data);
          setCartLoadingStatus(false);
        } catch (error) {
          if (error.response) {
            enqueueSnackbar(error.response.data.message, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(
              "Could not update quantity of card product. Check that the backend is running, reachable and returns valid JSON",
              { variant: "error" }
            );
          }
          setCartLoadingStatus(false);
        }
      } else if (options.action === "delete") {
        setCartLoadingStatus(true);
        try {
          let successResult = await axios.post(
            `${config.endpoint}/cart`,
            { productId, qty: qty - 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCartProductsList(successResult.data);
          setCartLoadingStatus(false);
        } catch (error) {
          if (error.response) {
            enqueueSnackbar(error.response.data.message, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(
              "Could not update quantity of card product. Check that the backend is running, reachable and returns valid JSON",
              { variant: "error" }
            );
          }
          setCartLoadingStatus(false);
        }
      }
    }
  };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <Box className="search-desktop" sx={{ width: 1 / 3 }}>
          <TextField
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(event) => updateDebounceText(event.target.value)}
          />
        </Box>
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event) => updateDebounceText(event.target.value)}
      />
      {!loginStatus && (
        <>
          <Grid container>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
          </Grid>
          <Grid container rowSpacing={2} columnSpacing={2} p="20px">
            {isLoading && (
              <Box className="loading">
                <CircularProgress sx={{ color: "#00a278" }} />
                <Typography variant="body2" mt="10px" fontWeight="bold">
                  Loading Products...
                </Typography>
              </Box>
            )}
            {!isLoading && productsList.length === 0 && (
              <Box className="loading">
                <SentimentDissatisfied />
                <Typography variant="body2" mt="10px" fontWeight="bold">
                  No products found
                </Typography>
              </Box>
            )}
            {!isLoading &&
              productsList.length !== 0 &&
              productsList.map((productItem) => (
                <Grid item key={productItem._id} xs={6} md={3}>
                  <ProductCard
                    product={productItem}
                    handleAddToCart={addToCart}
                  />
                </Grid>
              ))}
          </Grid>
        </>
      )}
      {loginStatus && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <>
              <Grid container>
                <Grid item className="product-grid">
                  <Box className="hero">
                    <p className="hero-heading">
                      India’s{" "}
                      <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                      to your door step
                    </p>
                  </Box>
                </Grid>
              </Grid>
              <Grid container rowSpacing={2} columnSpacing={2} p="20px">
                {isLoading && (
                  <Box className="loading">
                    <CircularProgress sx={{ color: "#00a278" }} />
                    <Typography variant="body2" mt="10px" fontWeight="bold">
                      Loading Products...
                    </Typography>
                  </Box>
                )}
                {!isLoading && productsList.length === 0 && (
                  <Box className="loading">
                    <SentimentDissatisfied />
                    <Typography variant="body2" mt="10px" fontWeight="bold">
                      No products found
                    </Typography>
                  </Box>
                )}
                {!isLoading &&
                  productsList.length !== 0 &&
                  productsList.map((productItem) => (
                    <Grid item key={productItem._id} xs={6} md={3}>
                      <ProductCard
                        product={productItem}
                        handleAddToCart={addToCart}
                        loadingStatus={isCartLoading}
                      />
                    </Grid>
                  ))}
              </Grid>
            </>
          </Grid>
          {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
          <Grid
            item
            xs={12}
            md={3}
            bgcolor="#E9F5E1"
            mt="16px"
            className="cart-container"
          >
            <Cart
              products={initialProductsList}
              items={modifiedCartProductsList}
              handleQuantity={addToCart}
              loadingStatus={isCartLoading}
            />
          </Grid>
        </Grid>
      )}
      <Footer />
    </div>
  );
};

export default Products;
