import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";

export function useCart() {
  return useQuery<CartItem[], AxiosError>("cart", async () => {
    const res = await axios.get<CartItem[]>(`${API_PATHS.cart}/profile/cart`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    });
    return res.data;
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  const queryClient = useQueryClient();

  return useMutation(
    (values: CartItem) => {
      console.log("values", values);
      return axios.put<CartItem[]>(`${API_PATHS.cart}/profile/cart`, values, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      });
    },
    {
      onMutate: async (newItem: CartItem) => {
        await queryClient.cancelQueries("cart");

        const previousCart = queryClient.getQueryData<CartItem[]>("cart");

        queryClient.setQueryData<CartItem[]>("cart", (oldCart) => {
          if (!oldCart) return [newItem];

          const existingItemIndex = oldCart.findIndex(
            (item) => item.product.id === newItem.product.id
          );
          if (existingItemIndex !== -1) {
            const updatedCart = [...oldCart];
            updatedCart[existingItemIndex] = {
              ...oldCart[existingItemIndex],
              count: newItem.count,
            };
            return updatedCart;
          }

          return [...oldCart, newItem];
        });

        return { previousCart };
      },
    }
  );
}
