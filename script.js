const storage = firebase.storage();
const db = firebase.firestore();
let currentUser = null;

// Autenticación anónima
firebase.auth().signInAnonymously().then(cred => {
  currentUser = cred.user;
  console.log("Conectado como:", currentUser.uid);
  mostrarArchivos();
}).catch(err => {
  console.error("Error de login:", err);
});

// Subir carpeta completa
async function uploadFolder() {
  const input = document.getElementById("folderInput");
  const files = input.files;
  if (files.length === 0) return;

  const folderId = Date.now().toString(36);
  const uploadPromises = [];

  for (let file of files) {
    const fullPath = `${currentUser.uid}/${folderId}/${file.webkitRelativePath}`;
    const ref = storage.ref(fullPath);
    uploadPromises.push(ref.put(file));
  }

  await Promise.all(uploadPromises);

  await db.collection("users").doc(currentUser.uid)
    .collection("folders").doc(folderId)
    .set({ createdAt: Date.now() });

  alert("¡Carpeta subida con éxito!");
  mostrarArchivos();
}

// Mostrar archivos subidos
async function mostrarArchivos() {
  const list = document.getElementById("fileList");
  list.innerHTML = "";

  const folders = await db.collection("users")
    .doc(currentUser?.uid).collection("folders").get();

  for (let folder of folders.docs) {
    const folderId = folder.id;
    const folderRef = storage.ref(`${currentUser.uid}/${folderId}`);
    const contents = await folderRef.listAll();

    for (let item of contents.items) {
      const url = await item.getDownloadURL();
      const li = document.createElement("li");
      li.innerHTML = `<a href="${url}" target="_blank">${item.name}</a>`;
      list.appendChild(li);
    }
  }
}
