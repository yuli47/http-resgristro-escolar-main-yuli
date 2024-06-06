import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
//import { getFirestore } from "./node_modules/firebase/firebase-firestore-lite.js";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
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

let bti = document.getElementById("inser");
let btc = document.getElementById("consu");

const tbCalificaciones = document.querySelector("#tbCalificaciones");

bti.addEventListener('click', async (e) => {
  e.preventDefault();

  const matricula = document.getElementById("mat_etu").value; 
  const unidadSeleccionada = document.getElementById("cla_uni").value;
  const calificacion = document.getElementById("calificacion").value;
  const catedratico = document.getElementById("catedratico").value;
  const ciclo = document.getElementById("ciclo").value;

  if (!matricula || !unidadSeleccionada || !calificacion || !catedratico || !ciclo) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    const matricula = document.getElementById("mat_etu").value; 
    const unidadSeleccionada = document.getElementById("cla_uni").value;
    const calificacion = document.getElementById("calificacion").value;

    if (calificacion === "NC" || calificacion === "6") {
      let subcoleccion = "";
      if (calificacion === "NC") {
          subcoleccion = "NoCurso";
      } else {
          subcoleccion = "DesAcreditados";
      }

      const subcoleccionRef = collection(db, "Unidades", unidadSeleccionada, subcoleccion);
      const snapshot = await getDocs(subcoleccionRef);

      if (snapshot.empty) {
        const newmatricula = matricula + "-01";
        const docRef = doc(subcoleccionRef, newmatricula);
        await setDoc(docRef, {
          Clave: document.getElementById("cla_uni").value,
          Matricula: matricula, 
          Catedratico: document.getElementById("catedratico").value,
          Calificacion: calificacion,
          Ciclo: document.getElementById("ciclo").value,
          Registro: "yulissa",
        });
        console.log("La subcolección no existe");
      } else {
        let intento = 1;
        let registroID = matricula + "-0" + intento;
        
        let registroExiste = false;
        snapshot.forEach(doc => {
          if (doc.id === registroID) {
            registroExiste = true;
            return;
          }
        });
        
        while (registroExiste && intento < 3) {
          intento++;
          registroID = matricula + "-0" + intento;
          registroExiste = false;
          snapshot.forEach(doc => {
            if (doc.id === registroID) {
              registroExiste = true;
              return;
            }
          });
        }

        if (registroExiste && intento >= 3) {
          const overlayDiv = mostrarOverlay();
          const mensajeErrorHTML = `
            <div id="mensaje-error" class="mensaje-error">
              <p>Número de Intentos Excedido. Subir Reporte</p>
            </div>
          `;
          document.body.insertAdjacentHTML("beforeend", mensajeErrorHTML);
          const mensajeError = document.getElementById("mensaje-error");
          setTimeout(() => {
            mensajeError.remove();
            overlayDiv.remove();
          }, 4000);
        } else {
          const docRef = doc(subcoleccionRef, registroID);
          await setDoc(docRef, {
            Clave: document.getElementById("cla_uni").value,
            Matricula: matricula, 
            Catedratico: document.getElementById("catedratico").value,
            Calificacion: calificacion,
            Ciclo: document.getElementById("ciclo").value,
            Registro: "yulissa",
          });
        }
      }
      } else {
          const docRef = doc(collection(db, "Unidades", unidadSeleccionada, "Acreditados"), matricula);
          await setDoc(docRef, {
            Clave: document.getElementById("cla_uni").value,
            Matricula: matricula, 
            Catedratico: document.getElementById("catedratico").value,
            Calificacion: calificacion,
            Ciclo: document.getElementById("ciclo").value,
          Registro: "yulissaa",
      });
    }
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
  } catch (e) {
    console.error("Error adding document: ", e);
  }
});

btc.addEventListener('click', async (e) => {
  try {
    tbCalificaciones.innerHTML = "";
    const unidadesRef = collection(db, "Unidades");
    const unidadesSnapshot = await getDocs(unidadesRef);
    
    unidadesSnapshot.forEach(async (unidadDoc) => {
      const unidadId = unidadDoc.id;
      const unidadData = unidadDoc.data();
      
      // Consulta para obtener los registros de la subcolección "Acreditados"
      const registrosAcreditadosRef = collection(db, "Unidades", unidadId, "Acreditados");
      const registrosAcreditadosSnapshot = await getDocs(registrosAcreditadosRef);
      registrosAcreditadosSnapshot.forEach((registroDoc) => {
        const registroData = registroDoc.data();
        // Agrega los registros de Acreditados a la tabla
        tbCalificaciones.innerHTML += `<tr class="regis" data-id="${registroDoc.id}">
          <td>${registroData.Clave}</td>
          <td>${registroData.Matricula}</td>
          <td>${registroData.Calificacion}</td>
          <td>${registroData.Ciclo}</td>
          <td>
            <button class="btn-primary btn m-1 editar_" data-id="${registroDoc.id}|${unidadId}">
              Editar 
              <span class="spinner-border spinner-border-sm" id="Edit-${registroDoc.id}" style="display: none;"></span>
            </button>        
            <button class="btn-danger btn eliminar_" data-id="${registroDoc.id}|${registroData.Clave}|${registroData.Matricula}">
              Eliminar 
              <span class="spinner-border spinner-border-sm" id="elim-${registroDoc.id}" style="display: none;"></span>
            </button>
          </td>
        </tr>`;
      });
      
      // Consulta para obtener los registros de la subcolección "NoCurso"
      const registrosNoCursoRef = collection(db, "Unidades", unidadId, "NoCurso");
      const registrosNoCursoSnapshot = await getDocs(registrosNoCursoRef);
      registrosNoCursoSnapshot.forEach((registroDoc) => {
        const registroData = registroDoc.data();
        // Agrega los registros de NoCurso a la tabla
        tbCalificaciones.innerHTML += `<tr class="regis" data-id="${registroDoc.id}">
          <td>${registroData.Clave}</td>
          <td>${registroData.Matricula}</td>
          <td>${registroData.Calificacion}</td>
          <td>${registroData.Ciclo}</td>
          <td>
            <button class="btn-primary btn m-1 editar_" data-id="${registroDoc.id}|${unidadId}">
              Editar 
              <span class="spinner-border spinner-border-sm" id="Edit-${registroDoc.id}" style="display: none;"></span>
            </button>        
            <button class="btn-danger btn eliminar_" data-id="${registroDoc.id}|${registroData.Clave}|${registroData.Matricula}">
              Eliminar 
              <span class="spinner-border spinner-border-sm" id="elim-${registroDoc.id}" style="display: none;"></span>
            </button>
          </td>
        </tr>`;
      });

      // Consulta para obtener los registros de la subcolección "DesAcreditados"
      const registrosDesAcreditadosRef = collection(db, "Unidades", unidadId, "DesAcreditados");
      const registrosDesAcreditadosSnapshot = await getDocs(registrosDesAcreditadosRef);
      registrosDesAcreditadosSnapshot.forEach((registroDoc) => {
        const registroData = registroDoc.data();
        // Agrega los registros de DesAcreditados a la tabla
        tbCalificaciones.innerHTML += `<tr class="regis" data-id="${registroDoc.id}">
          <td>${registroData.Clave}</td>
          <td>${registroData.Matricula}</td>
          <td>${registroData.Calificacion}</td>
          <td>${registroData.Ciclo}</td>
          <td>
            <button class="btn-primary btn m-1 editar_" data-id="${registroDoc.id}|${unidadId}">
              Editar 
              <span class="spinner-border spinner-border-sm" id="Edit-${registroDoc.id}" style="display: none;"></span>
            </button>        
            <button class="btn-danger btn eliminar_" data-id="${registroDoc.id}|${registroData.Clave}|${registroData.Matricula}">
              Eliminar 
              <span class="spinner-border spinner-border-sm" id="elim-${registroDoc.id}" style="display: none;"></span>
            </button>
          </td>
        </tr>`;
      });
    });
  } catch (error) {
    console.error("Error al mostrar registros:", error);
  }
});

$("#tbCalificaciones").on("click", ".eliminar_", async function () {
  try {
    const producto_id = $(this).data("id");
    const [registro_id, unidad_id] = producto_id.split('|');
    await deleteDoc(doc(db, "Unidades", unidad_id, "Acreditados", registro_id));
  } catch (error) {
    console.log("error", error);
  }
});

$("#tbCalificaciones").on("click", ".editar_", async function () {
  try {
    const ids = $(this).data("id").split('|');
    const registro_id = ids[0];
    const unidad_id = ids[1];
    const registroRef = doc(db, "Unidades", unidad_id, "Acreditados", registro_id);
    await updateDoc(registroRef, {
      Catedratico: document.getElementById("catedratico").value,
      Calificacion: document.getElementById("calificacion").value,
      Ciclo: document.getElementById("ciclo").value,
      Registro: "Pancho Villa",
    });
  } catch (error) {
    console.log("Error:", error);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const unidadesRef = collection(db, "Unidades");
    const unidadesSnapshot = await getDocs(unidadesRef);
    const selectElement = document.getElementById("cla_uni");
    unidadesSnapshot.forEach((doc) => {
      const unidadId = doc.id;
      const unidadData = doc.data(); 
      const optionText = `${unidadId} - ${unidadData.Nombre}`;
      const option = document.createElement("option");
      option.value = unidadId;
      option.textContent = optionText;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar las unidades:", error);
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