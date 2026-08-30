import Swal from "sweetalert2";

const swal = Swal.mixin({
  background: "#fffacd",
  color: "#000812",
  iconColor: "#b81104",
  confirmButtonColor: "#b81104",
  cancelButtonColor: "#00081233",
  buttonsStyling: true,
  reverseButtons: true,
  padding: "2em",
  customClass: {
    popup: "rounded-3xl shadow-[0_35px_90px_-15px] shadow-tertiary/40",
  },
});

export default swal;
