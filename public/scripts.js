
function renderPayPalButton(containerId, planId) {
    paypal.Buttons({
        style: {
            shape: 'pill',
            color: 'black',
            layout: 'vertical',
            label: 'subscribe'
        },
        createSubscription: function(data, actions) {
            return actions.subscription.create({
                /* Creates the subscription */
                plan_id: planId
            });
        },
        onApprove: function(data, actions) {
            alert(data.subscriptionID); // You can add optional success message for the subscriber here
        }
    }).render(containerId); // Renders the PayPal button
}

renderPayPalButton('#paypal-button-container-P-59B647217R330650PM7OIJXY-1', 'P-59B647217R330650PM7OIJXY');
renderPayPalButton('#paypal-button-container-P-59B647217R330650PM7OIJXY-2', 'P-59B647217R330650PM7OIJXY');
renderPayPalButton('#paypal-button-container-P-59B647217R330650PM7OIJXY-3', 'P-59B647217R330650PM7OIJXY');
renderPayPalButton('#paypal-button-container-P-59B647217R330650PM7OIJXY-4', 'P-59B647217R330650PM7OIJXY');
