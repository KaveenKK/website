// LIVE plan ID for your “Basic” tier
const PLAN_ID_BASIC = 'P-31V66906BF6463352NAHKF3Y';

/**
 * Renders PayPal buttons once the SDK is loaded.
 * Call this from your HTML (see above).
 */
export function renderPayPalButtons () {
  if (!window.paypal) {
    console.error('PayPal SDK not loaded');
    return;
  }

  paypal.Buttons({
    style: {
      layout:  'horizontal',
      shape:   'pill',
      color:   'black',
      label:   'subscribe'
    },

    // Create the subscription when the buyer clicks the button
    createSubscription: (_data, actions) =>
      actions.subscription.create({
        plan_id: PLAN_ID_BASIC,
        quantity: 1
      }),

    // Client-side confirmation (and notify your back-end)
    onApprove: ({ subscriptionID }) => {
      console.log('Subscription ID', subscriptionID);
      fetch('/api/subscribed', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ subscriptionID, plan_id: PLAN_ID_BASIC })
      })
      .then(() => alert('✅ Subscription active!'))
      .catch(err => {
        console.error('Notify failed', err);
        alert('Payment succeeded but we could not record it—please contact support.');
      });
    },

    onError: err => {
      console.error('PayPal error', err);
      alert('Payment failed—please try again.');
    }

  }).render('#paypal-button-container-plan-basic');
}
