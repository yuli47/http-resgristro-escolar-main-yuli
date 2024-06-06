import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
//import { getFirestore } from "./node_modules/firebase/firebase-firestore-lite.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
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

const tablaPapeleta = document.querySelector("#tbPapeleta")

bti.addEventListener('click', async (e) => {
  e.preventDefault();

  const matricula = document.getElementById("mat_pap").value;
  const programa = document.getElementById("pro_edu_pap").value;
  const unidad = document.getElementById("cla_uni").value;
  const semestre = document.getElementById("sem_pap").value;
  const grupo = document.getElementById("gru_pap").value;
  const id = matricula + "-0" + semestre;

  if (!matricula || !programa || !unidad || !semestre || !grupo) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    const docSnap = await getDoc(doc(db, "Papeleta", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!data.Unidad_01) {
        try {
          await updateDoc(doc(db, "Papeleta", id), {
            Unidad_01: unidad
          });
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
          console.error("Error al agregar la unidad a la base de datos:", error);
        }
        return;
      }
      const unidadesCompletas = ["Unidad_01", "Unidad_02", "Unidad_03", "Unidad_04", "Unidad_05"].every(unidad => data[unidad]);
      if (unidadesCompletas) {
        const overlayDiv = mostrarOverlay();
        const mensajeErrorHTML = `
          <div id="mensaje-error" class="mensaje-error">
            <p>No puedes exceder el número máximo de Unidades en la Papeleta.</p>
          </div>
        `;
        document.body.insertAdjacentHTML("beforeend", mensajeErrorHTML);
        const mensajeError = document.getElementById("mensaje-error");
        setTimeout(() => {
          mensajeError.remove();
          overlayDiv.remove();
        }, 4000);
        return;
      } else {
        let siguienteUnidad = "";
        let key = 0;

        for (let i = 2; i <= 5; i++) {
          const unidad = `Unidad_0${i}`;
          if (!data[unidad]) {
            siguienteUnidad = unidad;
            key = i - 1;
            break;
          }
        }

        if (siguienteUnidad === "") {
          siguienteUnidad = "Unidad_05";
          key = 4;
        }

        for (let i = 0; i < key; i++) {
          let unidadKey = `Unidad_0${i + 1}`;
          if (data[unidadKey] === unidad) {
            const overlayDiv = mostrarOverlay();
            const mensajeErrorHTML = `
              <div id="mensaje-error" class="mensaje-error">
                <p>La Unidad ya se encuentra registrada en la Papeleta.</p>
              </div>
            `;
            document.body.insertAdjacentHTML("beforeend", mensajeErrorHTML);
            const mensajeError = document.getElementById("mensaje-error");
            setTimeout(() => {
              mensajeError.remove();
              overlayDiv.remove();
            }, 4000);
            return;
          }
        }      
        try {
          await updateDoc(doc(db, "Papeleta", id), {
            [siguienteUnidad]: unidad
          });
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
          console.error("Error al agregar la unidad a la base de datos:", error);
        }
      }
    } else {
      const docRef = await setDoc(
        doc(db, "Papeleta", id),
        {
        Matricula: matricula,
        Programa: programa,
        Unidad_01: unidad,
        Semestre: semestre,
        Grupo: grupo,
        Registro: "Parra",
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
    }
  } catch (error) {
    console.error("Error al agregar documento: ", error);
  }
});

btc.addEventListener('click', async (e)=> {
  const matricula = document.getElementById("mat_pap").value;
  const semestre = document.getElementById("sem_pap").value;

  if (!matricula || !semestre) {
    alert("Por favor, complete los campos de Matrícula y Semestre.");
    return;
  }

  const id = matricula + "-0" + semestre;

  try {
    const docRef = doc(db, "Papeleta", id);
    
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const datos = docSnapshot.data();
        const papeletaElement = document.querySelector('.Pap_mat');
        papeletaElement.textContent = "Papeleta: " + matricula;
        tbPapeleta.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
          const unidadKey = `Unidad_0${i}`;
          if (!datos[unidadKey]) {
            continue;
          }
          tbPapeleta.innerHTML += `<tr class="regis" data-id="${id}">
            <td>${datos[unidadKey]}</td>
            <td>${datos.Programa}</td>
            <td>${datos.Semestre}</td>
            <td>${datos.Grupo}</td>
            <td>
              <button class="btn-danger btn eliminar_"  id="${datos[unidadKey]}">
                Eliminar 
              <span class="spinner-border spinner-border-sm" id="elim-${id}" style="display: none;"></span>
              </button>
            </td>
          </tr>`;
        }
      } else {
        const overlayDiv = mostrarOverlay();
        const mensajeErrorHTML = `
          <div id="mensaje-error" class="mensaje-error">
            <p>"El registro no existe en la Base de Datos.</p>
          </div>
        `;
        document.body.insertAdjacentHTML("beforeend", mensajeErrorHTML);
        const mensajeError = document.getElementById("mensaje-error");
        setTimeout(() => {
          mensajeError.remove();
          overlayDiv.remove();
        }, 4000);
      }
    });

    window.unsubscribe = unsubscribe;

  } catch (error) {
    console.error("Error al obtener el documento: ", error);
  }
})

$("#tbPapeleta").on("click", ".eliminar_", async function () {
  try {
    const matricula = document.getElementById("mat_pap").value;
    const semestre = document.getElementById("sem_pap").value;
  
    if (!matricula || !semestre) {
      alert("Por favor, complete los campos de Matrícula y Semestre.");
      return;
    }
  
    const id = matricula + "-0" + semestre;
    
    const docRef = doc(db, "Papeleta", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const claseTd = $(this).closest("tr").find(".unidad").attr("class");
      const botonId = this.id;

      if (data.Unidad_01 === botonId) {
        await updateDoc(docRef, {
          Unidad_01: null
        });
      } else if (data.Unidad_02 === botonId) {
        await updateDoc(docRef, {
          Unidad_02: null
        });
      } else if (data.Unidad_03 === botonId) {
        await updateDoc(docRef, {
          Unidad_03: null
        });
      } else if (data.Unidad_04 === botonId) {
        await updateDoc(docRef, {
          Unidad_04: null
        });
      } else if (data.Unidad_05 === botonId) {
        await updateDoc(docRef, {
          Unidad_05: null
        });
      }
    } else {
    }
  } catch (error) {
    console.log("error", error);
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