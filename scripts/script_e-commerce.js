//variables globales
const input = document.getElementById("ObtenerInput");
const buscarInput = document.getElementById("buscarInput");
const getProductos = document.getElementById("obtener");
const getP = document.getElementById("buscar_productos");
const contenido = document.getElementById("resultado");
const carritoTodo = document.getElementById("todo_carrito");
const carritoBuscar = document.getElementById("buscar_carrito");
const guardar = document.getElementById("btnGuardar");

const inicializar = () => {
  //funciones por eventos de delegacion
  getProductos.addEventListener("click", obtener);
  getP.addEventListener("click", obtenerP);
  carritoTodo.addEventListener("click", obtenerC);
  carritoBuscar.addEventListener("click", obtenerCarritoUsuario);
};
const obtener = async () => {
  try {
    const data = await fetch("https://fakestoreapi.com/products");
    const res = await data.json();
    console.log(res);
    // destructuracion de lo que regrese la api
    // const {id,title,price, descripcion,category, image} = res;
    contenido.innerHTML = res
      .slice(0, input.value)
      .map(
        (producto) =>
          `<div class="tarjeta">
            <h5>${producto.id}</h5>
            <h5 class="p-titulo">${producto.title}</h5>
            <h5 class="p-precio">${producto.price}</h5>
            <p class="p-desc">${producto.description}</p>
            <p class="p-cat">${producto.category}</p>
            <img src="${producto.image}"/>
            <button onclick="editar(${producto.id},this)">Editar</button>
            <button onclick="eliminar(${producto.id},this)">Eliminar</button>
        </div>`,
      )
      .join("");
  } catch (error) {
    alert("fallo al hacer la peticion");
  }
};
const obtenerP = async () => {
  try {
    const data = await fetch(
      `https://fakestoreapi.com/products/${buscarInput.value}`,
    );
    const res = await data.json();
    console.log(res);
    const { id, title, price, description, category, image } = res;
    contenido.innerHTML = `<div class="tarjeta">
            <h5>${id}</h5>
            <h5>${title}</h5>
            <h5>${price}</h5>
            <p>${description}</p>
            <p>${category}</p>
            <img src="${image}"/>
        </div>`;
  } catch (error) {
    alert("fallo al hacer la peticion");
  }
};
const obtenerC = async () => {
  try {
    const res = await fetch("https://fakestoreapi.com/carts");
    const data = await res.json();
    console.log(data);
  } catch (error) {
    alert("hubo un error al obtener el carrito", error);
    return;
  }
};
const obtenerCarritoUsuario = async () => {
  const inputC = document.getElementById("buscarCarrito");
  if (!inputC.value) {
    alert("ingrese un valor para encontrar el usuario");
    return;
  }
  try {
    const res = await fetch("https://fakestoreapi.com/carts");
    const data = await res.json();
    console.log(data);
    const filtro = data.find((nombre) => inputC.value == nombre.userId);
    console.log(filtro);
    const productosFiltrados = await Promise.all(
      filtro.products.map(async (p) => {
        // Se hace una peticion en forma de arreglo dentro de cada producto para usar
        // la propiedad de productId que hay en cada filtro de productos y a su vez obtener
        // el producto asociado a ese id
        const resP = await fetch(
          `https://fakestoreapi.com/products/${p.productId}`,
        );
        const datap = await resP.json();
        // spread operator para juntar y regresar el la info del mapeo
        // y solo se junta en un spread para que tambien obtenga la
        // cantidad
        return { ...datap, quantity: p.quantity };
      }),
    );
    console.log(productosFiltrados);
    renderizarProductos(filtro.id, filtro.userId, productosFiltrados);
    // const [{ id, userId, products }] = filtro;
  } catch (error) {
    alert("hubo un error al obtener el carrito", error);
    return;
  }
};

function renderizarProductos(id, userId, productoR) {
  contenido.innerHTML = `
    <div class="tarjeta">
      <header>
        <h2>Carrito ID: ${id}</h2>
        <h4>Usuario ID: ${userId}</h4>
      </header>
      <div class="lista-productos">
          ${productoR
            .map(
              (p) => `
              <div class="producto-item">
                  <img src="${p.image}" alt="${p.title}" width="50">
                  <h5 class="p-titulo">${p.title}</h5>
                  <p class="p-precio">Precio unitario: $${p.price}</p>
                  <p>Cantidad: ${p.quantity}</p>
                  <p class="p-desc">Descripcion: ${p.description}</p>
                  <p class="p-cat">Categoria: ${p.category}</p>
                  <p>Cantidad: ${p.quantity}</p>
                  <p><strong>Subtotal: $${(p.price * p.quantity).toFixed(2)}</strong></p>
                  <button onclick="editar(${p.id},this)">Editar</button>
                  <button onclick="eliminar(${p.id},this)">Eliminar</button>
              </div>
          `,
            )
            .join("")}
      </div>
  </div>`;
}
const editar = async (id, btn) => {
  console.log("el id de la tarjeta es: ", id, "y su referencia es", btn);
  const modal = document.getElementById("modal");
  const titulo = document.getElementById("titulo");
  const precio = document.getElementById("price");
  const descripcion = document.getElementById("description");
  const categoria = document.getElementById("category");
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await res.json();
    console.log(data);
    const { title, price, description, category } = data;
    titulo.value = title;
    precio.value = price;
    descripcion.value = description;
    categoria.value = category;
    modal.showModal();
    if (guardar) {
      guardar.addEventListener("click", async () => {
        const nuevoT = titulo.value;
        const nuevoP = precio.value;
        const nuevoD = descripcion.value;
        const nuevoC = categoria.value;
        if (!nuevoT || !nuevoP || !nuevoD || !nuevoC) {
          alert("ningun campo debe estar vacio");
        }
        try {
          console.log(
            "los campos rescatados son: ",
            nuevoT,
            nuevoP,
            nuevoD,
            nuevoC,
          );
          const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: nuevoT,
              description: nuevoD,
              price: nuevoP,
              category: nuevoC,
            }),
          });
          const data = await res.json();
          alert("actualizado con exito: ", data);
          const tarjeta = btn.closest(".tarjeta");
          if (tarjeta) {
            tarjeta.querySelector(".p-titulo").textContent = data.title;
            tarjeta.querySelector(".p-desc").textContent = data.description;
            tarjeta.querySelector(".p-precio").textContent = data.price;
            tarjeta.querySelector(".p-cat").textContent = data.category;
            alert("¡Producto actualizado visualmente!");
          } else {
            alert("no se encontro la tarjeta");
          }
          modal.close();
        } catch (error) {
          console.log(error);
          alert("hubo un error al actualizar el producto", error);
        }
      });
    }
  } catch (error) {
    console.log(error);
    alert("no se encontro el producto seleccionado", error);
  }
};
const eliminar = async (id, btn) => {
  console.log("el id de la tarjeta es: ", id, "y su referencia es", btn);
};
inicializar();
