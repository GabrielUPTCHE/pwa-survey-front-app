import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Configuración base adaptada al nuevo Theme (Emerald Ledger)
const baseConfig = {
  background: "#ffffff", // surface-container-lowest
  color: "#161d19", // text-on-surface
  backdrop: `rgba(22, 29, 25, 0.6)`, // Fondo oscuro sutil basado en on-surface
  buttonsStyling: false, // ¡Clave! Desactiva los botones por defecto para usar Tailwind
  customClass: {
    // Contenedor principal de la alerta
    popup: "rounded-[1.5rem] shadow-[0_32px_64px_-12px_rgba(22,29,25,0.15)] border border-[#bbcac0]/30 font-body p-6 md:p-8",
    // Título con la fuente Manrope y color Primary
    title: "font-headline font-extrabold text-2xl text-[#006c4b] tracking-tight mb-2",
    // Contenedor del texto
    htmlContainer: "text-[#3c4a42] text-sm md:text-base font-medium m-0",
    // Contenedor de los botones
    actions: "flex gap-4 mt-8 w-full justify-center",
    // Botón de Confirmación (Estilo auth-gradient)
    confirmButton: "px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#006c4b] to-[#34d399] shadow-lg shadow-[#006c4b]/20 hover:opacity-90 transition-all active:scale-95",
    // Botón de Cancelación (Estilo Error Container)
    cancelButton: "px-8 py-3.5 rounded-xl font-semibold text-[#ba1a1a] bg-[#ffdad6] hover:bg-[#ffdad6]/80 transition-all active:scale-95",
  },
  showClass: {
    popup: "animate__animated animate__fadeInDown animate__faster",
  },
  hideClass: {
    popup: "animate__animated animate__fadeOutUp animate__faster",
  },
};

export const AlertMessage = {
  success: (title = "Éxito", text = "Operación realizada correctamente") => {
    MySwal.fire({
      ...baseConfig,
      icon: "success",
      iconColor: "#006c4b", // Color primario
      title,
      text,
      timer: 2500,
      showConfirmButton: false,
      timerProgressBar: true,
      // Personalizamos la barra de progreso para que coincida con el tema
      didOpen: () => {
        const progressBar = MySwal.getTimerProgressBar();
        if (progressBar) {
          progressBar.style.backgroundColor = '#34d399'; // primary-container
        }
      }
    });
  },

  error: (title = "Error", text = "Ocurrió un problema") => {
    MySwal.fire({
      ...baseConfig,
      icon: "error",
      iconColor: "#ba1a1a", // Color de error del tema
      title,
      text,
      confirmButtonText: "Entendido",
      showConfirmButton: true,
      customClass: {
        ...baseConfig.customClass,
        // Si es un error, el botón de confirmar toma el estilo de error
        confirmButton: "px-8 py-3.5 rounded-xl font-semibold text-white bg-[#ba1a1a] shadow-lg shadow-[#ba1a1a]/20 hover:bg-[#93000a] transition-all active:scale-95",
      }
    });
  },

  info: (title = "Información", text = "") => {
    MySwal.fire({
      ...baseConfig,
      icon: "info",
      iconColor: "#006c4b",
      title,
      text,
      confirmButtonText: "Ok",
    });
  },

  confirm: async (
    title = "¿Estás seguro?",
    text = "Esta acción no se puede deshacer"
  ) => {
    const result = await MySwal.fire({
      ...baseConfig,
      icon: "warning",
      iconColor: "#ffa668", // tertiary-container (naranja/advertencia)
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    return result.isConfirmed;
  },
};