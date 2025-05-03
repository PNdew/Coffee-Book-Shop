import { router } from "expo-router";
import { useEffect } from "react";

export default function OrderScreen() {
  useEffect(() => {
    router.replace('./bill/hoadon');
  }, []);
  return null;
}