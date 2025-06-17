import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYJxA5WeIDms43EAqimDKIo5v1VLy6aBM",
  authDomain: "personalfolder-7defa.firebaseapp.com",
  databaseURL: "https://personalfolder-7defa-default-rtdb.firebaseio.com",
  projectId: "personalfolder-7defa",
  storageBucket: "personalfolder-7defa.appspot.com",
  messagingSenderId: "811880952527",
  appId: "1:811880952527:web:a72b613cbd84924651bdba"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let currentUser = null;

const userIdDiv = document.getElementById("userId");
const folderInput = document.getElementById("folderInput");
const uploadBtn = document.getElementById("uploadBtn");

signInAnonymously(auth)
  .then(() => console.log("✅ Sesión anónima iniciada"))
  .catch((e) => {
    console.error("❌ Error de login:", e);
    userIdDiv.textContent = "Error de autenticación";
  });

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userIdDiv.textContent = "Usuario ID: " + currentUser.uid;
  } else {
    currentUser = null;
    userIdDiv.textContent = "No autenticado";
  }
});

uploadBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Error: usuario no autenticado.");
    return;
  }

  const files = folderInput.files;

  if (!files.length) {
    alert("Seleccioná una carpeta primero.");
    return;
  }

  const uid = currentUser.uid;
  const folderCode = Math.random().toString(36).substring(2, 10);

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Subiendo...";

  try {
    for (const file of files) {
      const pathInFolder = file.webkitRelativePath || file.name;
      const storagePath = `${uid}/${folderCode}/${pathInFolder}`;
      const fileRef = ref(storage, storagePath);

      await uploadBytes(fileRef, file);
      console.log("📁 Subido:", storagePath);
    }
    alert("✅ Carpeta subida con código: " + folderCode);
  } catch (err) {
    console.error("❌ Error al subir archivos:", err);
    alert("Error al subir archivos. Revisa la consola.");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Subir carpeta";
  }
});
