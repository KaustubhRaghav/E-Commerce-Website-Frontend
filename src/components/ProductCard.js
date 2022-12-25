import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        alt={product.name}
        height="300"
        image={product.image}
      />
      <CardContent>
        <Typography variant="body2" fontWeight="regular">
          {product.name}
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          fontWeight="bold"
        >{`$${product.cost}`}</Typography>
        <Rating name="rating" value={product.rating} readOnly />
      </CardContent>
      <CardActions className="card-actions">
        <Button
          className="card-button"
          variant="contained"
          startIcon={<AddShoppingCartOutlined />}
          onClick={() =>
            handleAddToCart("", [], [], product._id, 1, {
              preventDuplicate: true,
            })
          }
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
