/* global Stripe */
import axios from "axios";
import showAlert from "./alerts";

const bookTour = async (tourId) => {
  const publicKey = document.getElementById("stripe-js").dataset.key;
  // TODO: there is might be no need to import Stripe, so if that the case
  // then remove it from this file and the tour.pug file also.
  // also remove the primarykey from viewsController.js, env file and customHelmetFn.js
  const stripe = Stripe(publicKey);

  try {
    // 1) Get checkout session from API
    const { checkoutUrl } = (
      await axios(`/api/v1/bookings/checkout-session/${tourId}`)
    ).data;

    // 2) redirect to checkout page
    window.location.assign(checkoutUrl);
  } catch (err) {
    console.log(err);
    showAlert("error", "Error processing payment! Try again.");
  }
};

export default bookTour;
