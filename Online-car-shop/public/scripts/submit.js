document.addEventListener("DOMContentLoaded", () => {
  const cartIcon = document.querySelector(".add-cart img");

  cartIcon.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

function onProductClick(formId) {
  const form = document.getElementById(formId);
  form.submit();
}
