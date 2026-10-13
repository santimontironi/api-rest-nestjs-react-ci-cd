import Swal from "sweetalert2";

const swal = Swal.mixin({ //mixin() es un método que sirve para crear una configuración personalizada y reutilizable de tus alertas
  buttonsStyling: false,
  reverseButtons: true,
  padding: "1.5rem",
  customClass: {
    popup: "swal-popup",
    title: "swal-title",
    htmlContainer: "swal-html",
    actions: "swal-actions",
    confirmButton: "swal-confirm",
    cancelButton: "swal-cancel",
  },
});

export default swal;
