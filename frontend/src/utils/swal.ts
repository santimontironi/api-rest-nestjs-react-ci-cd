import Swal from "sweetalert2";

const swal = Swal.mixin({ //mixin() es un método que sirve para crear una configuración personalizada y reutilizable de tus alertas
  background: "#fffacd",
  color: "#000812",
  buttonsStyling: false,
  reverseButtons: true,
  padding: "1.25em",
  customClass: {
    popup: "swal-mui-popup",
    title: "swal-mui-title",
    htmlContainer: "swal-mui-html",
    actions: "swal-mui-actions",
    confirmButton: "swal-mui-confirm",
    cancelButton: "swal-mui-cancel",
  },
});

export default swal;
