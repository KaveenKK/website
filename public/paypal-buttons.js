// public/js/paypal-buttons.js
// LIVE plan for “I’m Broke”
const PLAN_ID = 'P-31V66906BF6463352NAHKF3Y';
const CONTAINER = '#paypal-button-container-plan-basic';

export function renderPayPalButtons () {
  if (!window.paypal) {
    console.error('PayPal SDK not yet loaded');
    return;
  }

  paypal.Buttons({
    style: {
      layout:  'horizontal',
      shape:   'pill',
      color:   'black',
      label:   'subscribe'
    },

    createSubscription (_, actions) {
      return actions.subscription.create({
        plan_id: PLAN_ID,
        quantity: 1
      });
    },

    onApprove ({ subscriptionID, payerID }) {
      // Notify your server that the user is now subscribed
      fetch('/api/subscribed', {
        method:  'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ subscriptionID, plan_id: PLAN_ID })
      })
      .then(() => alert('✅ Subscription complete!'))
      .catch(err => {
        console.error('Server notify failed', err);
        alert('Payment succeeded but we failed to record it—contact support.');
      });
    },

    onError (err) {
      console.error('PayPal error', err);
      alert('Payment failed—please try again.');
    }

  }).render(CONTAINER);
}
