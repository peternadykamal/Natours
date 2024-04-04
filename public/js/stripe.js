import axios from "axios";
import showAlert from "./alerts";

const bookTour = async (tourId) => {
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
