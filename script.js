// Configuración de Firebase (pegá tu config.js antes que esto)
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let currentUser = null;

// Iniciar sesión anónima
signInAnonymously(auth)
  .then(() => {
    console.log("✅ Sesión anónima iniciada");
  })
  .catch((error) => {
    console.error("❌ Error de login:", error);
  });

// Esperar al usuario
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("👤 Usuario:", currentUser.uid);
  } else {
    console.warn("⚠️ No se encontró usuario");
  }
});

// Subida de carpeta
async function uploadFolder() {
  const input = document.getElementById("folderInput");
  const files = input.files;

  if (!files.length) {
    alert("Seleccioná una carpeta primero.");
    return;
  }

  if (!currentUser) {
    alert("Error: usuario no autenticado.");
    return;
  }

  const uid = currentUser.uid;
  const folderCode = Math.random().toString(36).substring(2, 10); // Código único

  for (const file of files) {
    const pathInFolder = file.webkitRelativePath || file.name;
    const storagePath = `${uid}/${folderCode}/${pathInFolder}`;
    const fileRef = ref(storage, storagePath);

    try {
      const result = await uploadBytes(fileRef, file);
      console.log("📁 Subido:", result.metadata.fullPath);
    } catch (err) {
      console.error("❌ Error al subir", file.name, err);
    }
  }

  alert("✅ Carpeta subida con código: " + folderCode);
}
