import React from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider options={{"client-id":"AeZlCuN9CMKEbjAtAUgyb1D1UrZA7Vx7rSZXHIRFiAn8Om4HJJtKNCwkS23EcGlwXhhEaoSgeeZAdHmu"}}>
        <PayPalButtons 
            style={{layout: 'vertical'}}
            createOrder={(data, actions) => {
                return actions.order.create({
                    purchase_units:[{amount: {value: amount}}]
                })
            }}
            onApprove={(data, actions) => {
                return actions.order.capture().then(onSuccess)
            }}
            onError={onError} />
    </PayPalScriptProvider>
  )
}

export default PayPalButton