import React from "react";
import { useParams } from "react-router-dom";

function DetailUser() {
  const { id } = useParams();
  return <div>DetailUser {id}</div>;
}

export default DetailUser;
