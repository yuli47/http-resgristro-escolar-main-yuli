import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
//import { getFirestore } from "./node_modules/firebase/firebase-firestore-lite.js";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByQiwRJuf4Z5MKx8C-Aa56cTjV9XjDAWs",
  authDomain: "yulissa-371e4.firebaseapp.com",
  projectId: "yulissa-371e4",
  storageBucket: "yulissa-371e4.appspot.com",
  messagingSenderId: "39255672670",
  appId: "1:39255672670:web:5d7913657bee4bb4e071cf",
  measurementId: "G-EHBRTK8ZD5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let bti =  document.getElementById("inser");
let btc =  document.getElementById("consu");

const tablaUnidades = document.querySelector("#tbUnidades");

bti.addEventListener('click', async (e) => {
  e.preventDefault();

  const clave = document.getElementById("clave").value;
  const nombre = document.getElementById("nombre").value;
  const año = document.getElementById("año").value;
  const periodo = document.getElementById("periodo").value;
  const categoria = document.getElementById("categoria").value;
  const creditos = document.getElementById("creditos").value;

  if (!clave || !nombre || !año || !periodo || !categoria || !creditos) {
    alert("Por favor, complete todos los campos.");
    return;
  }
  
  try {
    const docRef = await setDoc(
      doc(db, "Unidades", clave),
      {
        Clave: clave,
        Nombre: nombre,
        Año: año,
        Periodo: periodo,
        Categoria: categoria,
        Creditos: creditos,
        Registro: "Leyva",
      }
    );
    const overlayDiv = mostrarOverlay();
    const mensajeErrorHTML = `
      <div id="mensaje-completado" class="mensaje-completado">
        <p>Subiendo Registro...</p>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", mensajeErrorHTML);
    const mensajeError = document.getElementById("mensaje-completado");
    setTimeout(() => {
      mensajeError.remove();
      overlayDiv.remove();
    }, 3000);
  } catch (error) {
    console.error("Error al agregar el documento: ", error);
  }
});


btc.addEventListener('click', async (e)=> {
  ShowUsers();
  viewUsuarios2(); 
});

async function ShowUsers() {
  tbUnidades.innerHTML = "";
  const Allusers = await ViewUsuarios();
  Allusers.forEach((doc) => {
    const datos = doc.data();
    tbUnidades.innerHTML += `<tr class = "regis" data-id="${doc.id}">
    <td>${datos.Clave}</td>
    <td>${datos.Nombre}</td>
    <td>${datos.Creditos}</td>
    <td>
      <button class="btn-primary btn m-1 editar_" data-id="${doc.id}" >
        Editar 
      <span class="spinner-border spinner-border-sm" id="Edit-${doc.id}" style="display: none;"></span>
      </button> 
      <button class="btn-danger btn eliminar_"  data-id="${doc.id}|${datos.Clave}|${datos.Nombre}" >
        Eliminar 
      <span class="spinner-border spinner-border-sm" id="elim-${doc.id}" style="display: none;"></span>
      </button>
    </td>
    </tr>`;
  });
}

async function ViewUsuarios() {
  const userRef = collection(db, "Unidades");
  const Allusers = await getDocs(userRef);
  return Allusers;
}

async function viewUsuarios2() {
  const q = query(collection(db, "Unidades"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const cities = [];
    querySnapshot.forEach((doc) => {
      cities.push(doc.data().nombre);     
    });
    console.log("Current cities in CA: ", cities.join(", "));
  });
}

$("#tbUnidades").on("click", ".eliminar_", async function () {
  const producto_id = $(this).data("id");
  console.log("click en " + producto_id);
  let datox = producto_id.split('|');
  console.log("datos  " + datox[1]);
  try {
    await deleteDoc(doc(db, "Unidades", datox[0]));
  } catch (error) {
    console.log("error", error);
  }
});

$("#tbUnidades").on("click", ".editar_", async function () {
  const producto_id = $(this).data("id");
  console.log("click en editar" + producto_id);
  try {
    const washingtonRef = doc(db, "Unidades", producto_id.toString());
    console.log(washingtonRef);
    await updateDoc(washingtonRef, {
      Nombre: document.getElementById("nombre").value,
      Año: document.getElementById("año").value,
      Periodo: document.getElementById("periodo").value,
      Categoria: document.getElementById("categoria").value,
      Creditos: document.getElementById("creditos").value,
      Registro:"Leyva",
    });
  } catch (error) {
    console.log("error", error);
  }
});

function mostrarOverlay() {
  const overlayDiv = document.createElement("div");
  overlayDiv.style.position = "fixed";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.width = "100%";
  overlayDiv.style.height = "100%";
  overlayDiv.style.backgroundColor = "rgba(0, 0, 0, 0.0)";
  overlayDiv.style.zIndex = "999";
  overlayDiv.id = "overlay-div";
  document.body.appendChild(overlayDiv);
  return overlayDiv;
}