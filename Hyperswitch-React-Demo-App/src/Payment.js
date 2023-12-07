import { useEffect, useState } from "react";
import React from "react";
import { HyperElements } from "@juspay-tech/react-hyper-js";
import CheckoutForm from "./CheckoutForm";
import "./css/NavBar.css";

function Payment() {
  const [hyperPromise, setHyperPromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  const paymentFlow = new URLSearchParams(window.location.search).get(
    "flow"
  );

  const customer_id = new URLSearchParams(window.location.search).get(
    "customer_id"
  );

  console.log(paymentFlow)

  useEffect(() => {

    Promise.all([
      fetch(`${endPoint}/config`),
      fetch(`${endPoint}/urls`),
      fetch(`${endPoint}/create-payment-intent`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentFlow: paymentFlow, customer_id: customer_id })
      }),
    ])
      .then((responses) => {
        return Promise.all(responses.map((response) => response.json()));
      })
      .then((dataArray) => {
        const { publishableKey } = dataArray[0];
        const { serverUrl, clientUrl } = dataArray[1];
        const { clientSecret } = dataArray[2];
        setClientSecret(clientSecret);
        const script = document.createElement("script");
        script.src = `${clientUrl}/HyperLoader.js`;
        document.head.appendChild(script);
        script.onload = () => {
          setHyperPromise(
            new Promise((resolve, _) => {
              resolve(
                window.Hyper(publishableKey, {
                  customBackendUrl: serverUrl,
                })
              );
            })
          );
        };

        script.onerror = () => {
          setHyperPromise(
            new Promise((_, reject) => {
              reject("Script could not be loaded");
            })
          );
        };
      });
  }, []);

  return <div className="viewport">
    {clientSecret && hyperPromise && (
      <HyperElements hyper={hyperPromise} options={{ clientSecret }}>
        <CheckoutForm paymentFlow={paymentFlow} customer_id={customer_id} />
      </HyperElements>
    )}
  </div>
}

export default Payment;
